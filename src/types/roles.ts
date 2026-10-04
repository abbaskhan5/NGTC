// Shared Role and Permission definitions for NGTC ERP

export interface Permission {
  id: string;
  resource: string;
  action: 'read' | 'create' | 'update' | 'delete' | 'manage' | 'approve';
  description: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[]; // array of "resource.action" or "*"
  isSystem?: boolean;
}

export const SYSTEM_PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'p1', resource: 'dashboard', action: 'read', description: 'View executive dashboard' },
  
  // Vehicles
  { id: 'p2', resource: 'vehicles', action: 'read', description: 'View vehicle registry and status' },
  { id: 'p3', resource: 'vehicles', action: 'create', description: 'Register new vehicles' },
  { id: 'p4', resource: 'vehicles', action: 'update', description: 'Update vehicle information and assignments' },
  { id: 'p5', resource: 'vehicles', action: 'delete', description: 'Decommission vehicles' },

  // Drivers
  { id: 'p6', resource: 'drivers', action: 'read', description: 'View drivers and license records' },
  { id: 'p7', resource: 'drivers', action: 'create', description: 'Onboard new drivers' },
  { id: 'p8', resource: 'drivers', action: 'update', description: 'Update driver records and assignments' },
  { id: 'p9', resource: 'drivers', action: 'delete', description: 'Remove or archive driver' },

  // Contracts
  { id: 'p10', resource: 'contracts', action: 'read', description: 'View client contracts' },
  { id: 'p11', resource: 'contracts', action: 'create', description: 'Create enterprise contracts' },
  { id: 'p12', resource: 'contracts', action: 'update', description: 'Amend contract terms and dates' },
  { id: 'p13', resource: 'contracts', action: 'approve', description: 'Approve contracts' },

  // Projects
  { id: 'p14', resource: 'projects', action: 'read', description: 'View operational projects' },
  { id: 'p15', resource: 'projects', action: 'create', description: 'Create operational projects' },
  { id: 'p16', resource: 'projects', action: 'update', description: 'Manage project fleet and crew' },

  // Trips & Routes
  { id: 'p17', resource: 'trips', action: 'read', description: 'Track trips and schedules' },
  { id: 'p18', resource: 'trips', action: 'create', description: 'Dispatch new trips' },
  { id: 'p19', resource: 'trips', action: 'update', description: 'Update trip progress and status' },

  // HR & Employees
  { id: 'p20', resource: 'employees', action: 'read', description: 'View employee directory' },
  { id: 'p21', resource: 'employees', action: 'create', description: 'Onboard employees' },
  { id: 'p22', resource: 'employees', action: 'update', description: 'Manage employee records' },

  // Finance
  { id: 'p23', resource: 'finance', action: 'read', description: 'View financial statements and invoices' },
  { id: 'p24', resource: 'finance', action: 'create', description: 'Create invoices and expenses' },
  { id: 'p25', resource: 'finance', action: 'approve', description: 'Approve payouts and invoices' },

  // Reports
  { id: 'p26', resource: 'reports', action: 'read', description: 'Generate operations and compliance reports' },

  // Users & Settings
  { id: 'p27', resource: 'users', action: 'manage', description: 'Manage user accounts and access' },
  { id: 'p28', resource: 'settings', action: 'manage', description: 'Configure system settings and master data' },
  { id: 'p29', resource: 'audit', action: 'read', description: 'View system audit logs' },
];

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    code: 'SUPER_ADMIN',
    description: 'Unrestricted enterprise administrative control across all branches and modules',
    permissions: ['*'],
    isSystem: true,
  },
  {
    id: 'role-gm',
    name: 'General Manager / CEO',
    code: 'GENERAL_MANAGER',
    description: 'Executive oversight, strategic KPI reporting, approvals, and contract reviews',
    permissions: [
      'dashboard.read',
      'vehicles.read',
      'drivers.read',
      'contracts.read',
      'contracts.approve',
      'projects.read',
      'trips.read',
      'employees.read',
      'finance.read',
      'finance.approve',
      'reports.read',
      'audit.read',
    ],
    isSystem: true,
  },
  {
    id: 'role-fleet-mgr',
    name: 'Fleet Manager',
    code: 'FLEET_MANAGER',
    description: 'Vehicle lifecycle, maintenance, fuel management, vehicle inspections, and telemetry',
    permissions: [
      'dashboard.read',
      'vehicles.read',
      'vehicles.create',
      'vehicles.update',
      'vehicles.delete',
      'drivers.read',
      'projects.read',
      'trips.read',
      'reports.read',
    ],
    isSystem: true,
  },
  {
    id: 'role-ops-mgr',
    name: 'Operations Manager',
    code: 'OPERATIONS_MANAGER',
    description: 'Daily trip dispatch, route planning, driver assignments, school and university transport',
    permissions: [
      'dashboard.read',
      'vehicles.read',
      'vehicles.update',
      'drivers.read',
      'drivers.update',
      'projects.read',
      'projects.update',
      'trips.read',
      'trips.create',
      'trips.update',
      'reports.read',
    ],
    isSystem: true,
  },
  {
    id: 'role-finance-mgr',
    name: 'Finance Manager',
    code: 'FINANCE_MANAGER',
    description: 'Invoicing, expenses, revenue realization, client billing, and VAT accounting',
    permissions: [
      'dashboard.read',
      'contracts.read',
      'projects.read',
      'finance.read',
      'finance.create',
      'finance.approve',
      'reports.read',
    ],
    isSystem: true,
  },
  {
    id: 'role-hr-mgr',
    name: 'HR Manager',
    code: 'HR_MANAGER',
    description: 'Personnel records, Iqama tracking, attendance, leave management, driver compliance',
    permissions: [
      'dashboard.read',
      'employees.read',
      'employees.create',
      'employees.update',
      'drivers.read',
      'drivers.create',
      'drivers.update',
      'reports.read',
    ],
    isSystem: true,
  },
  {
    id: 'role-driver',
    name: 'Driver / Field Operator',
    code: 'DRIVER',
    description: 'Assigned trip execution, route stops, vehicle pre-trip inspection, incident reporting',
    permissions: [
      'dashboard.read',
      'trips.read',
      'trips.update',
    ],
    isSystem: true,
  },
];
