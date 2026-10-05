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
  code: 'SUPER_ADMIN' | 'EMPLOYEE' | 'GENERAL_MANAGER' | 'FLEET_MANAGER' | 'OPERATIONS_MANAGER' | 'FINANCE_MANAGER' | 'HR_MANAGER' | 'DRIVER' | string;
  description: string;
  permissions: string[]; // array of "resource.action" or "*"
  isSystem?: boolean;
}

export const SYSTEM_PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'p1', resource: 'dashboard', action: 'read', description: 'View operations and executive dashboard' },
  
  // Users & Access Control
  { id: 'p2', resource: 'users', action: 'read', description: 'View user accounts and access records' },
  { id: 'p3', resource: 'users', action: 'create', description: 'Create employee and administrative user accounts' },
  { id: 'p4', resource: 'users', action: 'update', description: 'Update user profiles, reset passwords, activate/deactivate' },
  { id: 'p5', resource: 'users', action: 'delete', description: 'Remove or archive user accounts' },
  { id: 'p6', resource: 'roles', action: 'manage', description: 'Configure system roles and permission sets' },
  { id: 'p7', resource: 'permissions', action: 'manage', description: 'Assign and revoke granular system permissions' },

  // HR & Employees
  { id: 'p8', resource: 'employees', action: 'read', description: 'View employee registry and personnel records' },
  { id: 'p9', resource: 'employees', action: 'create', description: 'Onboard new company employees' },
  { id: 'p10', resource: 'employees', action: 'update', description: 'Update employee job titles, salaries, departments' },
  { id: 'p11', resource: 'employees', action: 'delete', description: 'Terminate or archive employee records' },

  // Drivers
  { id: 'p12', resource: 'drivers', action: 'read', description: 'View drivers and license records' },
  { id: 'p13', resource: 'drivers', action: 'create', description: 'Onboard new transport drivers' },
  { id: 'p14', resource: 'drivers', action: 'update', description: 'Update driver records and license status' },
  { id: 'p15', resource: 'drivers', action: 'delete', description: 'Remove or decommission drivers' },

  // Vehicles
  { id: 'p16', resource: 'vehicles', action: 'read', description: 'View fleet registry and GPS status' },
  { id: 'p17', resource: 'vehicles', action: 'create', description: 'Register new fleet vehicles' },
  { id: 'p18', resource: 'vehicles', action: 'update', description: 'Update vehicle information and maintenance' },
  { id: 'p19', resource: 'vehicles', action: 'delete', description: 'Decommission vehicles from active fleet' },

  // Contracts
  { id: 'p20', resource: 'contracts', action: 'read', description: 'View enterprise customer contracts' },
  { id: 'p21', resource: 'contracts', action: 'create', description: 'Execute new customer agreements' },
  { id: 'p22', resource: 'contracts', action: 'update', description: 'Amend contract values, dates, and SLA terms' },
  { id: 'p23', resource: 'contracts', action: 'delete', description: 'Cancel or archive customer contracts' },
  { id: 'p24', resource: 'contracts', action: 'approve', description: 'Formal executive approval for contracts' },

  // Projects
  { id: 'p25', resource: 'projects', action: 'read', description: 'View operational projects' },
  { id: 'p26', resource: 'projects', action: 'create', description: 'Establish new client transport projects' },
  { id: 'p27', resource: 'projects', action: 'update', description: 'Modify project scope, assigned fleet and staff' },
  { id: 'p28', resource: 'projects', action: 'delete', description: 'Close and archive projects' },

  // Routes
  { id: 'p29', resource: 'routes', action: 'read', description: 'View transport routes and stop points' },
  { id: 'p30', resource: 'routes', action: 'create', description: 'Design new bus and transport routes' },
  { id: 'p31', resource: 'routes', action: 'update', description: 'Modify route stops, geofences, and paths' },
  { id: 'p32', resource: 'routes', action: 'delete', description: 'Deactivate routes' },

  // Trips
  { id: 'p33', resource: 'trips', action: 'read', description: 'Track trips, dispatch logs, and schedules' },
  { id: 'p34', resource: 'trips', action: 'create', description: 'Dispatch new operational trips' },
  { id: 'p35', resource: 'trips', action: 'update', description: 'Update trip progress, delays, and incidents' },
  { id: 'p36', resource: 'trips', action: 'delete', description: 'Cancel scheduled trips' },

  // Finance
  { id: 'p37', resource: 'finance', action: 'read', description: 'View invoices, balance sheets, and revenue' },
  { id: 'p38', resource: 'finance', action: 'create', description: 'Generate invoices and log operational expenses' },
  { id: 'p39', resource: 'finance', action: 'update', description: 'Amend financial records and billing status' },
  { id: 'p40', resource: 'finance', action: 'delete', description: 'Void invoices and payment records' },
  { id: 'p41', resource: 'finance', action: 'approve', description: 'Authorize financial disbursements and invoice settlements' },

  // Payroll
  { id: 'p42', resource: 'payroll', action: 'read', description: 'View staff payroll and compensation records' },
  { id: 'p43', resource: 'payroll', action: 'create', description: 'Generate monthly payroll runs' },
  { id: 'p44', resource: 'payroll', action: 'update', description: 'Adjust salary components and allowances' },
  { id: 'p45', resource: 'payroll', action: 'delete', description: 'Cancel pending payroll runs' },
  { id: 'p46', resource: 'payroll', action: 'approve', description: 'Approve salary disbursement batches' },

  // Reports, Settings, Audit
  { id: 'p47', resource: 'reports', action: 'read', description: 'Generate operations, safety, and compliance reports' },
  { id: 'p48', resource: 'settings', action: 'manage', description: 'Configure ERP enterprise settings and master data' },
  { id: 'p49', resource: 'auditLogs', action: 'read', description: 'Inspect system security and administrative audit trail' },
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
    id: 'role-employee',
    name: 'Employee (Read-Only)',
    code: 'EMPLOYEE',
    description: 'Standard employee account with read-only access across permitted ERP operational modules',
    permissions: [
      'dashboard.read',
      'employees.read',
      'drivers.read',
      'vehicles.read',
      'contracts.read',
      'projects.read',
      'routes.read',
      'trips.read',
      'finance.read',
      'payroll.read',
      'reports.read',
    ],
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
      'auditLogs.read',
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
      'payroll.read',
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
      'payroll.read',
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
