// Comprehensive Domain Interfaces for NGTC ERP

export interface User {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  roleName?: string;
  branchId: string;
  branchName?: string;
  departmentId?: string;
  status: 'active' | 'suspended' | 'inactive';
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  city: string;
  region: string;
  address: string;
  phone: string;
  managerName: string;
  activeVehiclesCount?: number;
  activeDriversCount?: number;
}

export interface BusinessUnit {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  description: string;
  activeContractsCount: number;
  monthlyRevenueSAR: number;
  iconName: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string; // e.g. "BUS-1023"
  plateNumber: string;   // e.g. "1023 KSA" / "أ ب ج 1023"
  plateNumberAr?: string;
  vehicleType: 'Coach Bus' | 'School Bus' | 'Minibus' | 'Heavy Truck' | 'Equipment' | 'Van' | 'Sedan';
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  fuelType: 'Diesel' | 'Gasoline' | 'Electric' | 'Hybrid';
  currentMileage: number;
  branchId: string;
  branchName: string;
  businessUnitId: string;
  projectId?: string;
  projectName?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  status: 'active' | 'idle' | 'maintenance' | 'inactive';
  registrationExpiry: string; // ISO date
  insuranceExpiry: string;    // ISO date
  inspectionExpiry: string;   // MVPI date
  gpsDeviceId?: string;
  gpsStatus?: 'moving' | 'idle' | 'stopped' | 'offline';
  speedKmh?: number;
  lastGpsUpdate?: string;
}

export interface Driver {
  id: string;
  driverCode: string; // e.g. "DRV-104"
  employeeId?: string;
  name: string;
  nameAr?: string;
  phone: string;
  email?: string;
  nationality: string;
  iqamaNumber: string;
  iqamaExpiry: string;
  licenseNumber: string;
  licenseType: 'Heavy Vehicle' | 'Public Bus' | 'Light Commercial' | 'Heavy Equipment';
  licenseExpiry: string;
  medicalExpiry: string;
  assignedVehicleId?: string;
  assignedVehicleNumber?: string;
  assignedProjectId?: string;
  assignedProjectName?: string;
  branchId: string;
  branchName: string;
  experienceYears: number;
  status: 'active' | 'on_leave' | 'suspended' | 'inactive';
  performanceScore: number; // 0 - 100
  completedTripsCount: number;
  violationsCount: number;
}

export interface Contract {
  id: string;
  contractNumber: string; // e.g. "CNT-2026-089"
  title: string;
  customerName: string;
  contractType: 'School' | 'University' | 'Labor' | 'Corporate' | 'Construction' | 'Travel';
  branchId: string;
  branchName: string;
  startDate: string;
  endDate: string;
  contractValueSAR: number;
  billingCycle: 'Monthly' | 'Quarterly' | 'Milestone' | 'Annual';
  activeProjectsCount: number;
  vehiclesAllocated: number;
  status: 'active' | 'pending_approval' | 'expiring_soon' | 'completed' | 'terminated';
  documentsCount: number;
}

export interface Project {
  id: string;
  projectCode: string; // e.g. "PRJ-KSU-2026"
  name: string;
  contractId: string;
  contractNumber: string;
  customerName: string;
  businessUnitId: string;
  businessUnitName: string;
  branchId: string;
  branchName: string;
  startDate: string;
  endDate: string;
  contractValueSAR: number;
  monthlyRevenueSAR: number;
  monthlyExpensesSAR: number;
  profitMarginPercent: number;
  allocatedVehiclesCount: number;
  allocatedDriversCount: number;
  routesCount: number;
  status: 'active' | 'planning' | 'paused' | 'completed';
}

export interface Trip {
  id: string;
  tripNumber: string; // e.g. "TRP-2026-10492"
  routeCode: string;
  routeName: string;
  projectId: string;
  projectName: string;
  businessUnitName: string;
  vehicleNumber: string;
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  passengerCount: number;
  status: 'scheduled' | 'running' | 'completed' | 'cancelled' | 'delayed';
  currentLocationName?: string;
  incidentsReported: number;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  type: 'document_expiry' | 'maintenance_due' | 'contract_expiry' | 'license_expiry' | 'trip_delay' | 'invoice_overdue' | 'system';
  title: string;
  message: string;
  severity: 'urgent' | 'warning' | 'info';
  entityType: 'vehicle' | 'driver' | 'contract' | 'employee' | 'trip' | 'invoice';
  entityId?: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: 'vehicles' | 'drivers' | 'contracts' | 'trips' | 'users' | 'finance' | 'settings' | 'auth';
  entityId: string;
  entityDescription: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0812"
  customerName: string;
  projectName: string;
  issueDate: string;
  dueDate: string;
  subtotalSAR: number;
  vatAmountSAR: number; // 15% KSA VAT
  totalSAR: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
}

export interface DashboardSummary {
  kpis: {
    totalVehicles: number;
    activeVehicles: number;
    vehiclesInMaintenance: number;
    totalDrivers: number;
    activeDrivers: number;
    tripsToday: number;
    completedTripsToday: number;
    runningTripsToday: number;
    activeProjects: number;
    activeContracts: number;
    totalMonthlyRevenueSAR: number;
    totalMonthlyExpensesSAR: number;
    grossProfitSAR: number;
    expiringDocumentsCount: number;
  };
  businessDivisions: Array<{
    code: string;
    name: string;
    nameAr: string;
    activeFleetCount: number;
    tripsToday: number;
    activeContracts: number;
    monthlyRevenueSAR: number;
    status: 'optimal' | 'attention' | 'busy';
  }>;
  fleetStatusDistribution: {
    active: number;
    idle: number;
    maintenance: number;
    inactive: number;
  };
  tripStatusDistribution: {
    scheduled: number;
    running: number;
    completed: number;
    delayed: number;
    cancelled: number;
  };
  monthlyFinancials: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  urgentAlerts: NotificationItem[];
  recentActivities: AuditLog[];
}
