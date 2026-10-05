import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
} else if (fs.existsSync('.env.example')) {
  dotenv.config({ path: '.env.example' });
}

import { db } from '../server/db.js';
import { DEFAULT_ROLES, SYSTEM_PERMISSIONS } from '../src/types/roles.js';

export async function seedSuperAdmin(): Promise<void> {
  const adminName = process.env.SUPER_ADMIN_NAME || 'MR Abbas Khan';
  const adminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@ngtc.sa').toLowerCase().trim();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'password123';

  console.log('[Seed Super Admin] Initializing database connection...');
  await db.connectMongo();

  // Ensure Roles & Permissions are populated in database
  const rolesCount = await db.roles.countDocuments();
  if (rolesCount === 0) {
    console.log('[Seed Super Admin] Seeding system roles & permissions...');
    await db.permissions.insertMany(SYSTEM_PERMISSIONS);
    await db.roles.insertMany(DEFAULT_ROLES);
  } else {
    // Upsert SUPER_ADMIN and EMPLOYEE roles
    for (const r of DEFAULT_ROLES) {
      const existingRole = await db.roles.findOne({ code: r.code });
      if (!existingRole) {
        await db.roles.insertOne(r);
      } else {
        await db.roles.updateOne({ id: existingRole.id }, { permissions: r.permissions, name: r.name });
      }
    }
  }

  // Ensure Branches exist
  const branchesCount = await db.branches.countDocuments();
  if (branchesCount === 0) {
    await db.branches.insertMany([
      { id: 'br-riyadh', code: 'RUH-HQ', name: 'Riyadh Central HQ', city: 'Riyadh', managerName: 'Eng. Fahad Al-Subaie' },
      { id: 'br-jeddah', code: 'JED-OPS', name: 'Jeddah Western Hub', city: 'Jeddah', managerName: 'Sultan Al-Ghamdi' },
      { id: 'br-dammam', code: 'DMM-LOG', name: 'Dammam Eastern Hub', city: 'Dammam', managerName: 'Ziyad Al-Dosari' },
    ]);
  }

  // Securely hash password
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Check if Super Admin exists
  const existingAdmin = await db.users.findOne({ email: adminEmail });

  if (existingAdmin) {
    await db.users.updateOne(
      { id: existingAdmin.id },
      {
        name: adminName,
        passwordHash,
        role: 'SUPER_ADMIN',
        roleId: 'role-super-admin',
        roleName: 'Super Admin',
        status: 'active',
        updatedAt: new Date().toISOString(),
      }
    );
    console.log(`[Seed Super Admin] Verified & safely updated existing Super Admin account: ${adminEmail}`);
  } else {
    const newAdmin = await db.users.insertOne({
      id: 'usr-admin',
      employeeId: 'NGTC-0001',
      name: adminName,
      email: adminEmail,
      phone: '+966 50 123 4567',
      passwordHash,
      role: 'SUPER_ADMIN',
      roleId: 'role-super-admin',
      roleName: 'Super Admin',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      departmentId: 'Executive Management',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
    console.log(`[Seed Super Admin] Created primary Super Admin account: ${newAdmin.email}`);
  }

  // Also ensure default Read-Only Employee exists for testing & operations
  const employeeEmail = 'employee@ngtc.sa';
  const existingEmployee = await db.users.findOne({ email: employeeEmail });
  const empPasswordHash = await bcrypt.hash('employee123', 10);

  if (!existingEmployee) {
    await db.users.insertOne({
      id: 'usr-emp-01',
      employeeId: 'NGTC-0050',
      name: 'Fahad Al-Harbi (Staff)',
      email: employeeEmail,
      phone: '+966 50 777 8899',
      passwordHash: empPasswordHash,
      role: 'EMPLOYEE',
      roleId: 'role-employee',
      roleName: 'Employee (Read-Only)',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      departmentId: 'Operations',
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    console.log(`[Seed Super Admin] Seeded standard Read-Only Employee account: ${employeeEmail}`);
  } else {
    await db.users.updateOne(
      { id: existingEmployee.id },
      { role: 'EMPLOYEE', roleId: 'role-employee', roleName: 'Employee (Read-Only)', status: 'active' }
    );
  }

  // Ensure default employees collection items exist for linking
  const employeesCount = await db.employees.countDocuments();
  if (employeesCount === 0) {
    await db.employees.insertMany([
      {
        id: 'emp-001',
        employeeId: 'NGTC-0001',
        name: adminName,
        email: adminEmail,
        department: 'Executive Management',
        jobTitle: 'Super Administrator',
        salarySAR: 35000,
        branchId: 'br-riyadh',
        branchName: 'Riyadh Central HQ',
        status: 'active',
        hireDate: '2024-01-01',
      },
      {
        id: 'emp-050',
        employeeId: 'NGTC-0050',
        name: 'Fahad Al-Harbi (Staff)',
        email: employeeEmail,
        department: 'Operations Support',
        jobTitle: 'Fleet Dispatch Clerk',
        salarySAR: 6800,
        branchId: 'br-riyadh',
        branchName: 'Riyadh Central HQ',
        status: 'active',
        hireDate: '2025-02-01',
      },
      {
        id: 'emp-051',
        employeeId: 'NGTC-0051',
        name: 'Sara Al-Ghamdi',
        email: 'sara.g@ngtc.sa',
        department: 'Customer Relations',
        jobTitle: 'Client Services Specialist',
        salarySAR: 7500,
        branchId: 'br-riyadh',
        branchName: 'Riyadh Central HQ',
        status: 'active',
        hireDate: '2025-03-10',
      },
    ]);
  }

  console.log('[Seed Super Admin] Completed successfully with zero credential exposure.');
}

// Execute if run directly from CLI
if (process.argv[1]?.includes('seedSuperAdmin')) {
  seedSuperAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Super Admin] Error:', err.message);
      process.exit(1);
    });
}
