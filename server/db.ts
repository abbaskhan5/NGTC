/**
 * NGTC ERP Enterprise Document Store & MongoDB Hybrid Adapter
 * Provides high-speed indexed collections with MongoDB API semantics
 * and automatic two-way persistence with MongoDB Atlas via Mongoose.
 */
import mongoose from 'mongoose';

export interface QueryFilter<T = any> {
  [key: string]: any;
}

export class Collection<T extends { id?: string; _id?: string }> {
  public name: string;
  private items: Map<string, T> = new Map();
  private indexes: Map<string, Map<any, Set<string>>> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  public createIndex(field: string): void {
    if (!this.indexes.has(field)) {
      this.indexes.set(field, new Map());
      for (const [id, item] of this.items.entries()) {
        const val = (item as any)[field];
        if (val !== undefined) {
          const indexMap = this.indexes.get(field)!;
          if (!indexMap.has(val)) indexMap.set(val, new Set());
          indexMap.get(val)!.add(id);
        }
      }
    }
  }

  private updateIndexesForItem(id: string, item: T, isRemove = false): void {
    for (const [field, indexMap] of this.indexes.entries()) {
      const val = (item as any)[field];
      if (val !== undefined) {
        if (isRemove) {
          indexMap.get(val)?.delete(id);
        } else {
          if (!indexMap.has(val)) indexMap.set(val, new Set());
          indexMap.get(val)!.add(id);
        }
      }
    }
  }

  public async insertOne(doc: T): Promise<T> {
    const id = doc.id || doc._id || `${this.name.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cloned = { ...doc, id, _id: id };
    this.items.set(id, cloned);
    this.updateIndexesForItem(id, cloned);

    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        await mongoose.connection.db.collection(this.name).replaceOne(
          { _id: id as any },
          cloned as any,
          { upsert: true }
        );
      } catch (e: any) {
        console.warn(`[MongoDB Sync] ${this.name}.insertOne error:`, e.message);
      }
    }

    return cloned;
  }

  public async insertMany(docs: T[]): Promise<T[]> {
    const results: T[] = [];
    const bulkOps: any[] = [];

    for (const doc of docs) {
      const id = doc.id || doc._id || `${this.name.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const cloned = { ...doc, id, _id: id };
      this.items.set(id, cloned);
      this.updateIndexesForItem(id, cloned);
      results.push(cloned);

      bulkOps.push({
        replaceOne: {
          filter: { _id: id as any },
          replacement: cloned as any,
          upsert: true,
        },
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.connection.db && bulkOps.length > 0) {
      try {
        await mongoose.connection.db.collection(this.name).bulkWrite(bulkOps);
      } catch (e: any) {
        console.warn(`[MongoDB Sync] ${this.name}.insertMany bulkWrite error:`, e.message);
      }
    }

    return results;
  }

  public async findById(id: string): Promise<T | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  public async findOne(query: QueryFilter<T> = {}): Promise<T | null> {
    const results = await this.find(query, { limit: 1 });
    return results[0] || null;
  }

  public async find(
    query: QueryFilter<T> = {},
    options?: {
      sort?: Record<string, 1 | -1>;
      skip?: number;
      limit?: number;
    }
  ): Promise<T[]> {
    let matched: T[] = [];

    const queryKeys = Object.keys(query);
    if (queryKeys.length === 1 && this.indexes.has(queryKeys[0]) && typeof query[queryKeys[0]] !== 'object') {
      const field = queryKeys[0];
      const val = query[field];
      const idSet = this.indexes.get(field)?.get(val);
      if (idSet) {
        for (const id of idSet) {
          const item = this.items.get(id);
          if (item) matched.push({ ...item });
        }
      }
    } else {
      for (const item of this.items.values()) {
        if (this.matchesQuery(item, query)) {
          matched.push({ ...item });
        }
      }
    }

    if (options?.sort) {
      const sortKeys = Object.entries(options.sort);
      matched.sort((a: any, b: any) => {
        for (const [key, dir] of sortKeys) {
          const aVal = a[key];
          const bVal = b[key];
          if (aVal === bVal) continue;
          if (aVal > bVal) return dir === 1 ? 1 : -1;
          if (aVal < bVal) return dir === 1 ? -1 : 1;
        }
        return 0;
      });
    }

    if (options?.skip && options.skip > 0) {
      matched = matched.slice(options.skip);
    }

    if (options?.limit && options.limit > 0) {
      matched = matched.slice(0, options.limit);
    }

    return matched;
  }

  public async updateOne(query: QueryFilter<T>, update: Partial<T> | { $set?: Partial<T> }): Promise<T | null> {
    const target = await this.findOne(query);
    if (!target || !target.id) return null;

    const changes = (update as any).$set ? (update as any).$set : update;
    const updated = {
      ...target,
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    this.items.set(target.id, updated);
    this.updateIndexesForItem(target.id, updated);

    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        await mongoose.connection.db.collection(this.name).replaceOne(
          { _id: target.id as any },
          updated as any,
          { upsert: true }
        );
      } catch (e: any) {
        console.warn(`[MongoDB Sync] ${this.name}.updateOne error:`, e.message);
      }
    }

    return updated;
  }

  public async deleteOne(query: QueryFilter<T>): Promise<boolean> {
    const target = await this.findOne(query);
    if (!target || !target.id) return false;

    this.updateIndexesForItem(target.id, target, true);
    const deleted = this.items.delete(target.id);

    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        await mongoose.connection.db.collection(this.name).deleteOne({ _id: target.id as any });
      } catch (e: any) {
        console.warn(`[MongoDB Sync] ${this.name}.deleteOne error:`, e.message);
      }
    }

    return deleted;
  }

  public async countDocuments(query: QueryFilter<T> = {}): Promise<number> {
    if (Object.keys(query).length === 0) {
      return this.items.size;
    }
    const results = await this.find(query);
    return results.length;
  }

  public async clear(): Promise<void> {
    this.items.clear();
    for (const map of this.indexes.values()) {
      map.clear();
    }
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        await mongoose.connection.db.collection(this.name).deleteMany({});
      } catch (e: any) {
        console.warn(`[MongoDB Sync] ${this.name}.clear error:`, e.message);
      }
    }
  }

  public async hydrateFromAtlas(): Promise<void> {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return;
    try {
      const atlasCount = await mongoose.connection.db.collection(this.name).countDocuments();
      if (atlasCount > 0) {
        const docs = await mongoose.connection.db.collection(this.name).find({}).toArray();
        for (const doc of docs) {
          const id = (doc.id || doc._id)?.toString();
          if (id) {
            const item = { ...doc, id, _id: id } as any;
            this.items.set(id, item);
            this.updateIndexesForItem(id, item);
          }
        }
        console.log(`[MongoDB Sync] Hydrated ${docs.length} items from Atlas "${this.name}"`);
      } else if (this.items.size > 0) {
        // Seed Atlas collection with initial memory items
        const docsToInsert = Array.from(this.items.values()).map((doc) => ({
          ...doc,
          _id: doc.id || doc._id,
        }));
        await mongoose.connection.db.collection(this.name).insertMany(docsToInsert as any[]);
        console.log(`[MongoDB Sync] Initialized Atlas collection "${this.name}" with ${docsToInsert.length} documents`);
      }
    } catch (e: any) {
      console.warn(`[MongoDB Sync] Hydration error for "${this.name}":`, e.message);
    }
  }

  private matchesQuery(item: any, query: QueryFilter): boolean {
    for (const [key, expected] of Object.entries(query)) {
      if (expected === undefined) continue;

      if (key === '$or' && Array.isArray(expected)) {
        const matchesAny = expected.some((subQuery) => this.matchesQuery(item, subQuery));
        if (!matchesAny) return false;
        continue;
      }

      if (typeof expected === 'object' && expected !== null) {
        if ('$in' in expected && Array.isArray(expected.$in)) {
          if (!expected.$in.includes(item[key])) return false;
          continue;
        }
        if ('$regex' in expected) {
          const regex = new RegExp(expected.$regex, expected.$options || 'i');
          if (!regex.test(String(item[key] || ''))) return false;
          continue;
        }
        if ('$gte' in expected && !(item[key] >= expected.$gte)) return false;
        if ('$lte' in expected && !(item[key] <= expected.$lte)) return false;
        if ('$ne' in expected && item[key] === expected.$ne) return false;
      } else {
        if (item[key] !== expected) return false;
      }
    }
    return true;
  }
}

export interface DbStatus {
  connected: boolean;
  provider: 'mongodb-atlas' | 'indexed-memory';
  message: string;
  ipWhitelistHelp?: boolean;
}

// System Database Instance
class Database {
  public users = new Collection<any>('users');
  public roles = new Collection<any>('roles');
  public permissions = new Collection<any>('permissions');
  public branches = new Collection<any>('branches');
  public businessUnits = new Collection<any>('businessUnits');
  public vehicles = new Collection<any>('vehicles');
  public drivers = new Collection<any>('drivers');
  public contracts = new Collection<any>('contracts');
  public projects = new Collection<any>('projects');
  public trips = new Collection<any>('trips');
  public invoices = new Collection<any>('invoices');
  public expenses = new Collection<any>('expenses');
  public notifications = new Collection<any>('notifications');
  public auditLogs = new Collection<any>('auditLogs');
  public documents = new Collection<any>('documents');
  public employees = new Collection<any>('employees');
  public payroll = new Collection<any>('payroll');
  public settings = new Collection<any>('settings');

  public status: DbStatus = {
    connected: true,
    provider: 'indexed-memory',
    message: 'High-speed indexed document store active',
  };

  private allCollections: Collection<any>[];

  constructor() {
    this.allCollections = [
      this.users,
      this.roles,
      this.permissions,
      this.branches,
      this.businessUnits,
      this.vehicles,
      this.drivers,
      this.contracts,
      this.projects,
      this.trips,
      this.invoices,
      this.expenses,
      this.notifications,
      this.auditLogs,
      this.documents,
      this.employees,
      this.payroll,
      this.settings,
    ];

    this.setupIndexes();
  }

  private setupIndexes(): void {
    this.users.createIndex('email');
    this.employees.createIndex('employeeId');
    this.employees.createIndex('email');
    this.vehicles.createIndex('vehicleNumber');
    this.vehicles.createIndex('plateNumber');
    this.drivers.createIndex('driverCode');
    this.drivers.createIndex('iqamaNumber');
    this.contracts.createIndex('contractNumber');
    this.projects.createIndex('projectCode');
    this.trips.createIndex('tripNumber');
    this.payroll.createIndex('month');
    this.notifications.createIndex('read');
    this.notifications.createIndex('severity');
    this.auditLogs.createIndex('module');
  }

  public async connectMongo(): Promise<void> {
    const rawUri = process.env.MONGODB_URI;
    if (!rawUri || rawUri.includes('localhost:27017')) {
      return;
    }

    // Sanitize URI: Remove < and > from password, trim whitespace and newlines
    let sanitizedUri = rawUri
      .replace(/<([^>]+)>/, '$1')
      .replace(/[\r\n\t]+/g, '')
      .trim();

    // Ensure database name is ngtc_erp
    if (sanitizedUri.includes('mongodb.net/?') || sanitizedUri.endsWith('mongodb.net/')) {
      sanitizedUri = sanitizedUri.replace('mongodb.net/?', 'mongodb.net/ngtc_erp?').replace(/mongodb\.net\/$/, 'mongodb.net/ngtc_erp');
    }

    try {
      console.log('[NGTC DB] Connecting to MongoDB Atlas cluster...');
      await mongoose.connect(sanitizedUri, {
        dbName: 'ngtc_erp',
        serverSelectionTimeoutMS: 5000,
      });

      this.status = {
        connected: true,
        provider: 'mongodb-atlas',
        message: 'Connected to MongoDB Atlas cluster (0.0.0.0/0 allowed)',
      };
      console.log('[NGTC DB] Connected to MongoDB Atlas successfully! Syncing collections...');

      // Hydrate or seed collections to Atlas
      for (const col of this.allCollections) {
        await col.hydrateFromAtlas();
      }
      console.log('[NGTC DB] All collections synced with MongoDB Atlas!');
    } catch (err: any) {
      const isIpError =
        err.message &&
        (err.message.includes('whitelist') ||
          err.message.includes('buffering timed out') ||
          err.message.includes('Could not connect to any servers'));
      this.status = {
        connected: true,
        provider: 'indexed-memory',
        message: isIpError
          ? 'MongoDB Atlas: IP address not whitelisted. Using high-speed indexed document store.'
          : `MongoDB fallback: ${err.message}`,
        ipWhitelistHelp: isIpError,
      };
      console.warn(`[NGTC DB] MongoDB connection notice (${err.message}). Using high-speed document store fallback.`);
    }
  }
}

export const db = new Database();
