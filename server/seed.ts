import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { DEFAULT_ROLES, SYSTEM_PERMISSIONS } from '../src/types/roles.js';

export async function seedDatabase(force = false): Promise<void> {
  const usersCount = await db.users.countDocuments();
  if (usersCount > 0 && !force) {
    return; // Database already seeded
  }

  // Clear existing collections if force re-seed
  if (force) {
    await db.users.clear();
    await db.roles.clear();
    await db.permissions.clear();
    await db.branches.clear();
    await db.businessUnits.clear();
    await db.vehicles.clear();
    await db.drivers.clear();
    await db.contracts.clear();
    await db.projects.clear();
    await db.trips.clear();
    await db.invoices.clear();
    await db.expenses.clear();
    await db.notifications.clear();
    await db.auditLogs.clear();
  }

  // 1. Permissions & Roles
  await db.permissions.insertMany(SYSTEM_PERMISSIONS);
  await db.roles.insertMany(DEFAULT_ROLES);

  // 2. Branches in Saudi Arabia
  const branches = [
    {
      id: 'br-riyadh',
      code: 'RUH-HQ',
      name: 'Riyadh Central HQ',
      nameAr: 'المقر الرئيسي - الرياض',
      city: 'Riyadh',
      region: 'Central Province',
      address: 'King Fahd Road, Al-Olaya, Riyadh',
      phone: '+966 11 482 9000',
      managerName: 'Eng. Fahad Al-Subaie',
    },
    {
      id: 'br-jeddah',
      code: 'JED-OPS',
      name: 'Jeddah Western Hub',
      nameAr: 'فرع المنطقة الغربية - جدة',
      city: 'Jeddah',
      region: 'Makkah Province',
      address: 'Madinah Road, Al-Andalus, Jeddah',
      phone: '+966 12 654 3200',
      managerName: 'Sultan Al-Ghamdi',
    },
    {
      id: 'br-dammam',
      code: 'DMM-LOG',
      name: 'Dammam Eastern Hub',
      nameAr: 'فرع المنطقة الشرقية - الدمام',
      city: 'Dammam',
      region: 'Eastern Province',
      address: 'Dhahran Expressway, Al-Khobar / Dammam',
      phone: '+966 13 898 7700',
      managerName: 'Ziyad Al-Dosari',
    },
    {
      id: 'br-makkah',
      code: 'MAK-SRV',
      name: 'Makkah & Holy Sites Ops',
      nameAr: 'فرع مكة المكرمة والمشاعر',
      city: 'Makkah',
      region: 'Makkah Province',
      address: 'Al-Haram Road, Al-Kakiyyah, Makkah',
      phone: '+966 12 550 1122',
      managerName: 'Omar Al-Harthi',
    },
    {
      id: 'br-madinah',
      code: 'MED-EXP',
      name: 'Madinah Northern Terminal',
      nameAr: 'فرع المدينة المنورة',
      city: 'Madinah',
      region: 'Madinah Province',
      address: 'King Abdulaziz Road, Madinah',
      phone: '+966 14 840 4455',
      managerName: 'Ibrahim Al-Madani',
    },
  ];
  await db.branches.insertMany(branches);

  // 3. Business Units
  const businessUnits = [
    {
      id: 'bu-school',
      code: 'SCH-TRN',
      name: 'School Transportation',
      nameAr: 'النقل المدرسي',
      description: 'Daily safe K-12 student transit fleet with automated stop tracking and parent alerts',
      activeContractsCount: 14,
      monthlyRevenueSAR: 2850000,
      iconName: 'GraduationCap',
    },
    {
      id: 'bu-university',
      code: 'UNI-TRN',
      name: 'University Transportation',
      nameAr: 'النقل الجامعي',
      description: 'Campus-to-campus and student inter-city shuttles with scheduled high-capacity coach buses',
      activeContractsCount: 8,
      monthlyRevenueSAR: 3420000,
      iconName: 'Building2',
    },
    {
      id: 'bu-labor',
      code: 'LBR-TRN',
      name: 'Labor & Staff Transportation',
      nameAr: 'نقل العمال والموظفين',
      description: 'Industrial zone and residential compound workforce transport for major contractors',
      activeContractsCount: 22,
      monthlyRevenueSAR: 4190000,
      iconName: 'Users',
    },
    {
      id: 'bu-corporate',
      code: 'CRP-TRN',
      name: 'Corporate Transportation',
      nameAr: 'النقل المؤسسي والتنفيذي',
      description: 'VIP executive shuttles, corporate headquarters commuter lines, and airport transfers',
      activeContractsCount: 11,
      monthlyRevenueSAR: 1980000,
      iconName: 'Briefcase',
    },
    {
      id: 'bu-construction',
      code: 'CNS-TRN',
      name: 'Construction Logistics',
      nameAr: 'نقل المشاريع الإنشائية',
      description: 'Heavy equipment haulage, tippers, on-site personnel mobility, and mega-project logistics',
      activeContractsCount: 7,
      monthlyRevenueSAR: 3750000,
      iconName: 'HardHat',
    },
    {
      id: 'bu-travel',
      code: 'TRV-AGY',
      name: 'Travel Agency & Tourism',
      nameAr: 'وكالة السفر والسياحة',
      description: 'Umrah & Hajj chartered transport, domestic VIP luxury tours, and customized travel packages',
      activeContractsCount: 5,
      monthlyRevenueSAR: 1650000,
      iconName: 'Plane',
    },
  ];
  await db.businessUnits.insertMany(businessUnits);

  // 4. Seed Users with Hashed Passwords
  const devPasswordHash = await bcrypt.hash('password123', 10);
  const users = [
    {
      id: 'usr-admin',
      employeeId: 'NGTC-0001',
      name: 'MR Abbas Khan',
      email: 'admin@ngtc.sa',
      phone: '+966 50 123 4567',
      passwordHash: devPasswordHash,
      roleId: 'role-super-admin',
      roleName: 'Super Admin',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      departmentId: 'Executive Management',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      lastLogin: new Date().toISOString(),
      createdAt: '2025-01-01T08:00:00.000Z',
    },
    {
      id: 'usr-gm',
      employeeId: 'NGTC-0002',
      name: 'Saad Al-Qahtani',
      email: 'manager@ngtc.sa',
      phone: '+966 55 987 6543',
      passwordHash: devPasswordHash,
      roleId: 'role-gm',
      roleName: 'General Manager / CEO',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      departmentId: 'Executive Operations',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2025-01-05T08:00:00.000Z',
    },
    {
      id: 'usr-fleet',
      employeeId: 'NGTC-0015',
      name: 'Eng. Tariq Al-Ghamdi',
      email: 'fleet@ngtc.sa',
      phone: '+966 54 222 3344',
      passwordHash: devPasswordHash,
      roleId: 'role-fleet-mgr',
      roleName: 'Fleet Manager',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      departmentId: 'Fleet & Maintenance',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2025-02-01T08:00:00.000Z',
    },
    {
      id: 'usr-ops',
      employeeId: 'NGTC-0018',
      name: 'Yousef Al-Harbi',
      email: 'operations@ngtc.sa',
      phone: '+966 56 333 4455',
      passwordHash: devPasswordHash,
      roleId: 'role-ops-mgr',
      roleName: 'Operations Manager',
      branchId: 'br-jeddah',
      branchName: 'Jeddah Western Hub',
      departmentId: 'Transport Dispatch',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2025-02-10T08:00:00.000Z',
    },
    {
      id: 'usr-finance',
      employeeId: 'NGTC-0024',
      name: 'Reem Al-Shammari',
      email: 'finance@ngtc.sa',
      phone: '+966 50 444 5566',
      passwordHash: devPasswordHash,
      roleId: 'role-finance-mgr',
      roleName: 'Finance Manager',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      departmentId: 'Financial Control',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2025-02-15T08:00:00.000Z',
    },
    {
      id: 'usr-hr',
      employeeId: 'NGTC-0030',
      name: 'Nouf Al-Otaibi',
      email: 'hr@ngtc.sa',
      phone: '+966 53 555 6677',
      passwordHash: devPasswordHash,
      roleId: 'role-hr-mgr',
      roleName: 'HR Manager',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      departmentId: 'Human Resources',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2025-03-01T08:00:00.000Z',
    },
    {
      id: 'usr-driver',
      employeeId: 'NGTC-0104',
      name: 'Ahmed Al-Mutairi',
      email: 'driver@ngtc.sa',
      phone: '+966 50 888 9911',
      passwordHash: devPasswordHash,
      roleId: 'role-driver',
      roleName: 'Driver',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      departmentId: 'Transportation Fleet',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2025-03-15T08:00:00.000Z',
    },
  ];
  await db.users.insertMany(users);

  // 5. Contracts & Projects
  const contracts = [
    {
      id: 'cnt-ksu',
      contractNumber: 'CNT-2025-KSU',
      title: 'King Saud University Comprehensive Campus Transit',
      customerName: 'King Saud University (Riyadh)',
      contractType: 'University',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      startDate: '2025-09-01',
      endDate: '2027-08-31',
      contractValueSAR: 22400000,
      billingCycle: 'Monthly',
      activeProjectsCount: 2,
      vehiclesAllocated: 24,
      status: 'active',
      documentsCount: 6,
    },
    {
      id: 'cnt-rcs',
      contractNumber: 'CNT-2026-RCS',
      title: 'Royal Commission Riyadh Schools Transport Package B',
      customerName: 'Royal Commission for Riyadh City',
      contractType: 'School',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      startDate: '2026-01-15',
      endDate: '2028-06-30',
      contractValueSAR: 18600000,
      billingCycle: 'Monthly',
      activeProjectsCount: 1,
      vehiclesAllocated: 30,
      status: 'active',
      documentsCount: 8,
    },
    {
      id: 'cnt-redsea',
      contractNumber: 'CNT-2026-RSG',
      title: 'Red Sea Global Southern Dunes Workforce Transit',
      customerName: 'Red Sea Global Co.',
      contractType: 'Construction',
      branchId: 'br-jeddah',
      branchName: 'Jeddah Western Hub',
      startDate: '2026-02-01',
      endDate: '2027-01-31',
      contractValueSAR: 29500000,
      billingCycle: 'Monthly',
      activeProjectsCount: 2,
      vehiclesAllocated: 35,
      status: 'active',
      documentsCount: 5,
    },
    {
      id: 'cnt-aramco',
      contractNumber: 'CNT-2025-ARM',
      title: 'Saudi Aramco Dhahran Complex Executive Shuttles',
      customerName: 'Saudi Aramco Logistics Services',
      contractType: 'Corporate',
      branchId: 'br-dammam',
      branchName: 'Dammam Eastern Hub',
      startDate: '2025-06-01',
      endDate: '2027-05-31',
      contractValueSAR: 14200000,
      billingCycle: 'Monthly',
      activeProjectsCount: 1,
      vehiclesAllocated: 16,
      status: 'active',
      documentsCount: 4,
    },
    {
      id: 'cnt-neom',
      contractNumber: 'CNT-2024-NEOM',
      title: 'NEOM Oxagon Phase-1 Field Crew Transport',
      customerName: 'NEOM Development Authority',
      contractType: 'Labor',
      branchId: 'br-madinah',
      branchName: 'Madinah Northern Terminal',
      startDate: '2024-11-01',
      endDate: '2026-11-15', // Expiring in ~43 days
      contractValueSAR: 38000000,
      billingCycle: 'Monthly',
      activeProjectsCount: 2,
      vehiclesAllocated: 40,
      status: 'expiring_soon',
      documentsCount: 12,
    },
  ];
  await db.contracts.insertMany(contracts);

  const projects = [
    {
      id: 'prj-ksu-main',
      projectCode: 'PRJ-KSU-01',
      name: 'KSU Female Campus Dedicated Shuttles',
      contractId: 'cnt-ksu',
      contractNumber: 'CNT-2025-KSU',
      customerName: 'King Saud University',
      businessUnitId: 'bu-university',
      businessUnitName: 'University Transportation',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      startDate: '2025-09-01',
      endDate: '2027-08-31',
      contractValueSAR: 12000000,
      monthlyRevenueSAR: 1000000,
      monthlyExpensesSAR: 680000,
      profitMarginPercent: 32.0,
      allocatedVehiclesCount: 14,
      allocatedDriversCount: 16,
      routesCount: 8,
      status: 'active',
    },
    {
      id: 'prj-rcs-north',
      projectCode: 'PRJ-RCS-02',
      name: 'Riyadh North International Schools Transport',
      contractId: 'cnt-rcs',
      contractNumber: 'CNT-2026-RCS',
      customerName: 'Royal Commission for Riyadh City',
      businessUnitId: 'bu-school',
      businessUnitName: 'School Transportation',
      branchId: 'br-riyadh',
      branchName: 'Riyadh Central HQ',
      startDate: '2026-01-15',
      endDate: '2028-06-30',
      contractValueSAR: 18600000,
      monthlyRevenueSAR: 1550000,
      monthlyExpensesSAR: 1020000,
      profitMarginPercent: 34.2,
      allocatedVehiclesCount: 30,
      allocatedDriversCount: 32,
      routesCount: 18,
      status: 'active',
    },
    {
      id: 'prj-redsea-dunes',
      projectCode: 'PRJ-RSG-01',
      name: 'Southern Dunes Resort Construction Logistics',
      contractId: 'cnt-redsea',
      contractNumber: 'CNT-2026-RSG',
      customerName: 'Red Sea Global Co.',
      businessUnitId: 'bu-construction',
      businessUnitName: 'Construction Logistics',
      branchId: 'br-jeddah',
      branchName: 'Jeddah Western Hub',
      startDate: '2026-02-01',
      endDate: '2027-01-31',
      contractValueSAR: 29500000,
      monthlyRevenueSAR: 2450000,
      monthlyExpensesSAR: 1715000,
      profitMarginPercent: 30.0,
      allocatedVehiclesCount: 35,
      allocatedDriversCount: 38,
      routesCount: 6,
      status: 'active',
    },
  ];
  await db.projects.insertMany(projects);

  // 6. 24 Sample Vehicles (Realistic Saudi Fleet)
  const vehicleMakes = [
    { type: 'Coach Bus', make: 'Mercedes-Benz', model: 'Travego 15 RHD', seats: 49 },
    { type: 'School Bus', make: 'Ashok Leyland', model: 'Falcon 55S', seats: 55 },
    { type: 'School Bus', make: 'King Long', model: 'XMQ6900K', seats: 45 },
    { type: 'Minibus', make: 'Toyota', model: 'Coaster High Roof', seats: 23 },
    { type: 'Heavy Truck', make: 'MAN', model: 'TGS 33.400 6x4 Tipper', seats: 2 },
    { type: 'Heavy Truck', make: 'Mercedes-Benz', model: 'Actros 2040 Tractor', seats: 2 },
    { type: 'Van', make: 'Ford', model: 'Transit Passenger High-Spec', seats: 15 },
    { type: 'Sedan', make: 'Toyota', model: 'Camry Hybrid Executive', seats: 4 },
  ];

  const vehicles = [];
  const saudiLetterCombos = ['KSA', 'RYD', 'JED', 'DMM', 'MAK', 'MED', 'NGT'];
  
  for (let i = 1; i <= 24; i++) {
    const num = 1000 + i;
    const vType = vehicleMakes[i % vehicleMakes.length];
    const letter = saudiLetterCombos[i % saudiLetterCombos.length];
    const statusRand = i === 4 ? 'maintenance' : i === 7 ? 'maintenance' : i === 12 ? 'idle' : i === 19 ? 'idle' : 'active';
    const branch = branches[i % branches.length];
    
    // Set some expiry dates within 7 or 30 days to demonstrate automated expiry alerts
    const now = new Date('2026-10-03T08:00:00Z');
    let insDays = 90 + i * 15;
    if (i === 3) insDays = 6;  // Urgent: 6 days remaining
    if (i === 9) insDays = 21; // Warning: 21 days remaining
    if (i === 14) insDays = 4; // Urgent: 4 days remaining

    const insExpiry = new Date(now.getTime() + insDays * 86400000).toISOString().split('T')[0];
    const regExpiry = new Date(now.getTime() + (insDays + 120) * 86400000).toISOString().split('T')[0];
    const mvpiExpiry = new Date(now.getTime() + (insDays + 60) * 86400000).toISOString().split('T')[0];

    vehicles.push({
      id: `veh-${num}`,
      vehicleNumber: `BUS-${num}`,
      plateNumber: `${num} ${letter}`,
      plateNumberAr: `${letter} ${num}`,
      vehicleType: vType.type,
      make: vType.make,
      model: vType.model,
      year: 2022 + (i % 4),
      vin: `WDB6490${num}X7A9821`,
      color: i % 2 === 0 ? 'Pure White' : 'NGTC Corporate Pearl Green',
      fuelType: vType.type === 'Sedan' ? 'Hybrid' : 'Diesel',
      currentMileage: 42000 + i * 4800,
      branchId: branch.id,
      branchName: branch.name,
      businessUnitId: businessUnits[i % businessUnits.length].id,
      projectId: i <= 10 ? 'prj-ksu-main' : i <= 18 ? 'prj-rcs-north' : 'prj-redsea-dunes',
      projectName: i <= 10 ? 'KSU Campus Shuttles' : i <= 18 ? 'Riyadh North Schools' : 'Red Sea Dunes Logistics',
      assignedDriverId: `drv-${100 + i}`,
      assignedDriverName: `Captain Driver ${100 + i}`,
      status: statusRand,
      registrationExpiry: regExpiry,
      insuranceExpiry: insExpiry,
      inspectionExpiry: mvpiExpiry,
      gpsDeviceId: `GPS-NGTC-${num}`,
      gpsStatus: statusRand === 'active' ? (i % 3 === 0 ? 'moving' : 'idle') : 'stopped',
      speedKmh: statusRand === 'active' && i % 3 === 0 ? 58 + (i % 25) : 0,
      lastGpsUpdate: new Date().toISOString(),
    });
  }
  await db.vehicles.insertMany(vehicles);

  // 7. 24 Sample Drivers
  const driverNames = [
    { en: 'Ahmed Al-Mutairi', ar: 'أحمد المطيري', nat: 'Saudi' },
    { en: 'Mohammed Al-Ghamdi', ar: 'محمد الغامدي', nat: 'Saudi' },
    { en: 'Faisal Al-Otaibi', ar: 'فيصل العتيبي', nat: 'Saudi' },
    { en: 'Tariq Mansoor', ar: 'طارق منصور', nat: 'Egyptian' },
    { en: 'Khalid Al-Zahrani', ar: 'خالد الزهراني', nat: 'Saudi' },
    { en: 'Saeed Khan', ar: 'سعيد خان', nat: 'Pakistani' },
    { en: 'Abdulrahman Al-Dosari', ar: 'عبدالرحمن الدوسري', nat: 'Saudi' },
    { en: 'Omar Farooq', ar: 'عمر فاروق', nat: 'Jordanian' },
    { en: 'Bandar Al-Harbi', ar: 'بندر الحربي', nat: 'Saudi' },
    { en: 'Mustafa Hassan', ar: 'مصطفى حسن', nat: 'Sudanese' },
    { en: 'Salman Al-Shehri', ar: 'سلمان الشهري', nat: 'Saudi' },
    { en: 'Nasser Al-Subaie', ar: 'ناصر السبيعي', nat: 'Saudi' },
    { en: 'Rashid Ali', ar: 'راشد علي', nat: 'Yemeni' },
    { en: 'Zaid Al-Baqami', ar: 'زيد البقمي', nat: 'Saudi' },
    { en: 'Hussain Al-Khaldi', ar: 'حسين الخالدي', nat: 'Saudi' },
    { en: 'Majed Al-Enezi', ar: 'ماجد العنزي', nat: 'Saudi' },
    { en: 'Bilal Ahmad', ar: 'بلال أحمد', nat: 'Indian' },
    { en: 'Turki Al-Hajri', ar: 'تركي الهاجري', nat: 'Saudi' },
    { en: 'Waleed Al-Malki', ar: 'وليد المالكي', nat: 'Saudi' },
    { en: 'Ibrahim Al-Ruwaili', ar: 'إبراهيم الرويلي', nat: 'Saudi' },
    { en: 'Sultan Al-Shahrani', ar: 'سلطان الشهراني', nat: 'Saudi' },
    { en: 'Farhan Al-Qarni', ar: 'فرحان القرني', nat: 'Saudi' },
    { en: 'Nawaf Al-Shamrani', ar: 'نواف الشمراني', nat: 'Saudi' },
    { en: 'Rakan Al-Khaibari', ar: 'راكان الخيبري', nat: 'Saudi' },
  ];

  const drivers = [];
  for (let i = 1; i <= 24; i++) {
    const drvCode = `DRV-${100 + i}`;
    const nameData = driverNames[(i - 1) % driverNames.length];
    const branch = branches[i % branches.length];
    const now = new Date('2026-10-03T08:00:00Z');
    
    // Set some license expiry dates soon
    let licDays = 120 + i * 14;
    if (i === 5) licDays = 5;  // Urgent: 5 days remaining
    if (i === 11) licDays = 18; // Warning: 18 days remaining

    const licExpiry = new Date(now.getTime() + licDays * 86400000).toISOString().split('T')[0];
    const iqamaExpiry = new Date(now.getTime() + (licDays + 180) * 86400000).toISOString().split('T')[0];
    const medExpiry = new Date(now.getTime() + (licDays + 90) * 86400000).toISOString().split('T')[0];

    drivers.push({
      id: `drv-${100 + i}`,
      driverCode: drvCode,
      employeeId: `EMP-${900 + i}`,
      name: nameData.en,
      nameAr: nameData.ar,
      phone: `+966 5${(i % 9)} ${100 + i} ${7000 + i}`,
      email: `${nameData.en.toLowerCase().replace(/[^a-z]/g, '')}@ngtc.sa`,
      nationality: nameData.nat,
      iqamaNumber: `24${10000000 + i * 3421}`,
      iqamaExpiry: iqamaExpiry,
      licenseNumber: `SA-LIC-${88000 + i}`,
      licenseType: i % 3 === 0 ? 'Public Bus' : 'Heavy Vehicle',
      licenseExpiry: licExpiry,
      medicalExpiry: medExpiry,
      assignedVehicleId: `veh-${1000 + i}`,
      assignedVehicleNumber: `BUS-${1000 + i}`,
      assignedProjectId: i <= 10 ? 'prj-ksu-main' : 'prj-rcs-north',
      assignedProjectName: i <= 10 ? 'KSU Campus Shuttles' : 'Riyadh North Schools',
      branchId: branch.id,
      branchName: branch.name,
      experienceYears: 5 + (i % 12),
      status: i === 6 ? 'on_leave' : 'active',
      performanceScore: 88 + (i % 12),
      completedTripsCount: 240 + i * 18,
      violationsCount: i === 5 ? 2 : i === 15 ? 1 : 0,
    });
  }
  await db.drivers.insertMany(drivers);

  // 8. Trips Scheduled for Today (Saturday, 3 October 2026)
  const trips = [
    {
      id: 'trp-01',
      tripNumber: 'TRP-2026-10491',
      routeCode: 'RT-KSU-01',
      routeName: 'Diriyah to KSU Science College',
      projectId: 'prj-ksu-main',
      projectName: 'KSU Campus Shuttles',
      businessUnitName: 'University Transportation',
      vehicleNumber: 'BUS-1001',
      vehiclePlate: '1001 KSA',
      driverName: 'Ahmed Al-Mutairi',
      driverPhone: '+966 50 101 7001',
      date: '2026-10-03',
      scheduledStart: '06:30',
      scheduledEnd: '07:45',
      actualStart: '06:32',
      actualEnd: '07:42',
      passengerCount: 46,
      status: 'completed',
      currentLocationName: 'KSU Gate 4 Terminal',
      incidentsReported: 0,
    },
    {
      id: 'trp-02',
      tripNumber: 'TRP-2026-10492',
      routeCode: 'RT-KSU-02',
      routeName: 'Al-Nakheel District to KSU Medical City',
      projectId: 'prj-ksu-main',
      projectName: 'KSU Campus Shuttles',
      businessUnitName: 'University Transportation',
      vehicleNumber: 'BUS-1002',
      vehiclePlate: '1002 RYD',
      driverName: 'Mohammed Al-Ghamdi',
      driverPhone: '+966 51 102 7002',
      date: '2026-10-03',
      scheduledStart: '07:15',
      scheduledEnd: '08:15',
      actualStart: '07:18',
      actualEnd: undefined,
      passengerCount: 48,
      status: 'running',
      currentLocationName: 'King Khalid Rd, Exit 2',
      incidentsReported: 0,
    },
    {
      id: 'trp-03',
      tripNumber: 'TRP-2026-10493',
      routeCode: 'RT-SCH-08',
      routeName: 'Al-Malqa to Royal International Academy',
      projectId: 'prj-rcs-north',
      projectName: 'Riyadh North Schools',
      businessUnitName: 'School Transportation',
      vehicleNumber: 'BUS-1003',
      vehiclePlate: '1003 JED',
      driverName: 'Faisal Al-Otaibi',
      driverPhone: '+966 52 103 7003',
      date: '2026-10-03',
      scheduledStart: '06:45',
      scheduledEnd: '07:40',
      actualStart: '06:46',
      actualEnd: '07:38',
      passengerCount: 42,
      status: 'completed',
      currentLocationName: 'School Depot East',
      incidentsReported: 0,
    },
    {
      id: 'trp-04',
      tripNumber: 'TRP-2026-10494',
      routeCode: 'RT-SCH-12',
      routeName: 'Al-Yasmin to Kingdom Schools Complex',
      projectId: 'prj-rcs-north',
      projectName: 'Riyadh North Schools',
      businessUnitName: 'School Transportation',
      vehicleNumber: 'BUS-1005',
      vehiclePlate: '1005 MAK',
      driverName: 'Khalid Al-Zahrani',
      driverPhone: '+966 54 105 7005',
      date: '2026-10-03',
      scheduledStart: '07:00',
      scheduledEnd: '08:00',
      actualStart: '07:22',
      actualEnd: undefined,
      passengerCount: 38,
      status: 'delayed',
      currentLocationName: 'Anas Ibn Malik Rd (Heavy Traffic)',
      incidentsReported: 1,
    },
    {
      id: 'trp-05',
      tripNumber: 'TRP-2026-10495',
      routeCode: 'RT-RSG-04',
      routeName: 'Al-Wajh Base Camp to Southern Dunes Site',
      projectId: 'prj-redsea-dunes',
      projectName: 'Red Sea Dunes Logistics',
      businessUnitName: 'Construction Logistics',
      vehicleNumber: 'BUS-1008',
      vehiclePlate: '1008 KSA',
      driverName: 'Omar Farooq',
      driverPhone: '+966 57 108 7008',
      date: '2026-10-03',
      scheduledStart: '05:30',
      scheduledEnd: '07:00',
      actualStart: '05:30',
      actualEnd: '06:55',
      passengerCount: 50,
      status: 'completed',
      currentLocationName: 'Southern Dunes Site Terminal',
      incidentsReported: 0,
    },
    {
      id: 'trp-06',
      tripNumber: 'TRP-2026-10496',
      routeCode: 'RT-KSU-05',
      routeName: 'KSU Return Midday Shuttle - Route 3',
      projectId: 'prj-ksu-main',
      projectName: 'KSU Campus Shuttles',
      businessUnitName: 'University Transportation',
      vehicleNumber: 'BUS-1006',
      vehiclePlate: '1006 MED',
      driverName: 'Abdulrahman Al-Dosari',
      driverPhone: '+966 56 107 7007',
      date: '2026-10-03',
      scheduledStart: '13:00',
      scheduledEnd: '14:15',
      actualStart: undefined,
      actualEnd: undefined,
      passengerCount: 45,
      status: 'scheduled',
      currentLocationName: 'KSU Central Depot',
      incidentsReported: 0,
    },
  ];
  await db.trips.insertMany(trips);

  // 9. Finance Records (Invoices & Expenses)
  const invoices = [
    {
      id: 'inv-2026-0810',
      invoiceNumber: 'INV-2026-0810',
      customerName: 'King Saud University',
      projectName: 'KSU Campus Shuttles',
      issueDate: '2026-09-01',
      dueDate: '2026-10-01',
      subtotalSAR: 1000000,
      vatAmountSAR: 150000, // 15% KSA VAT
      totalSAR: 1150000,
      status: 'paid',
    },
    {
      id: 'inv-2026-0811',
      invoiceNumber: 'INV-2026-0811',
      customerName: 'Royal Commission for Riyadh City',
      projectName: 'Riyadh North Schools',
      issueDate: '2026-09-05',
      dueDate: '2026-10-05',
      subtotalSAR: 1550000,
      vatAmountSAR: 232500,
      totalSAR: 1782500,
      status: 'pending',
    },
    {
      id: 'inv-2026-0812',
      invoiceNumber: 'INV-2026-0812',
      customerName: 'Red Sea Global Co.',
      projectName: 'Red Sea Dunes Logistics',
      issueDate: '2026-08-25',
      dueDate: '2026-09-25',
      subtotalSAR: 2450000,
      vatAmountSAR: 367500,
      totalSAR: 2817500,
      status: 'overdue',
    },
  ];
  await db.invoices.insertMany(invoices);

  // 10. Notifications & Compliance Alerts
  const notifications = [
    {
      id: 'notif-1',
      userId: 'usr-admin',
      type: 'document_expiry',
      title: 'Vehicle Insurance Expiring Soon',
      message: 'Comprehensive insurance for Coach Bus BUS-1003 expires in 6 days (2026-10-09). Policy renewal required.',
      severity: 'urgent',
      entityType: 'vehicle',
      entityId: 'veh-1003',
      read: false,
      actionUrl: '/fleet/vehicles/veh-1003',
      createdAt: '2026-10-03T06:15:00.000Z',
    },
    {
      id: 'notif-2',
      userId: 'usr-admin',
      type: 'license_expiry',
      title: 'Driver Heavy Vehicle License Expiry',
      message: 'Captain Khalid Al-Zahrani (DRV-105) driving license expires in 5 days. Schedule Moroor renewal.',
      severity: 'urgent',
      entityType: 'driver',
      entityId: 'drv-105',
      read: false,
      actionUrl: '/drivers/drv-105',
      createdAt: '2026-10-03T07:00:00.000Z',
    },
    {
      id: 'notif-3',
      userId: 'usr-admin',
      type: 'maintenance_due',
      title: 'Scheduled Preventive Maintenance',
      message: 'Bus BUS-1004 has exceeded 60,000 km threshold. Transmission oil & brake pad inspection due at Riyadh Depot.',
      severity: 'warning',
      entityType: 'vehicle',
      entityId: 'veh-1004',
      read: false,
      actionUrl: '/fleet/maintenance',
      createdAt: '2026-10-02T16:30:00.000Z',
    },
    {
      id: 'notif-4',
      userId: 'usr-admin',
      type: 'contract_expiry',
      title: 'Major Enterprise Contract Expiry Notice',
      message: 'NEOM Oxagon Phase-1 contract (CNT-2024-NEOM, 38M SAR) expires in 43 days. Renewal proposal in review.',
      severity: 'warning',
      entityType: 'contract',
      entityId: 'cnt-neom',
      read: false,
      actionUrl: '/contracts/cnt-neom',
      createdAt: '2026-10-01T11:00:00.000Z',
    },
    {
      id: 'notif-5',
      userId: 'usr-admin',
      type: 'invoice_overdue',
      title: 'Client Invoice Overdue',
      message: 'Invoice INV-2026-0812 for Red Sea Global Co. (2,817,500 SAR) is 8 days past due date.',
      severity: 'warning',
      entityType: 'invoice',
      entityId: 'inv-2026-0812',
      read: true,
      actionUrl: '/finance/invoices',
      createdAt: '2026-09-28T09:00:00.000Z',
    },
  ];
  await db.notifications.insertMany(notifications);

  // 11. Audit Logs (Enterprise Trail)
  const auditLogs = [
    {
      id: 'aud-01',
      userId: 'usr-admin',
      userName: 'MR Abbas Khan',
      userRole: 'Super Admin',
      action: 'ALLOCATED_VEHICLE',
      module: 'vehicles',
      entityId: 'veh-1002',
      entityDescription: 'Bus BUS-1002 (1002 RYD)',
      details: 'Assigned to KSU Campus Shuttles project under Captain Mohammed Al-Ghamdi',
      ipAddress: '192.168.10.45',
      timestamp: '2026-10-03T06:45:12.000Z',
    },
    {
      id: 'aud-02',
      userId: 'usr-fleet',
      userName: 'Eng. Tariq Al-Ghamdi',
      userRole: 'Fleet Manager',
      action: 'STATUS_CHANGE',
      module: 'vehicles',
      entityId: 'veh-1004',
      entityDescription: 'Bus BUS-1004 (1004 DMM)',
      details: 'Changed status from Active to Maintenance (Scheduled 60k km inspection)',
      ipAddress: '192.168.10.88',
      timestamp: '2026-10-03T07:10:04.000Z',
    },
    {
      id: 'aud-03',
      userId: 'usr-ops',
      userName: 'Yousef Al-Harbi',
      userRole: 'Operations Manager',
      action: 'DISPATCH_TRIP',
      module: 'trips',
      entityId: 'trp-02',
      entityDescription: 'Trip TRP-2026-10492',
      details: 'Dispatched Morning KSU Medical City shuttle with 48 passengers',
      ipAddress: '192.168.20.12',
      timestamp: '2026-10-03T07:18:30.000Z',
    },
    {
      id: 'aud-04',
      userId: 'usr-finance',
      userName: 'Reem Al-Shammari',
      userRole: 'Finance Manager',
      action: 'RECORDED_PAYMENT',
      module: 'finance',
      entityId: 'inv-2026-0810',
      entityDescription: 'Invoice INV-2026-0810',
      details: 'Confirmed wire transfer receipt of 1,150,000 SAR from King Saud University',
      ipAddress: '192.168.10.62',
      timestamp: '2026-10-02T14:22:15.000Z',
    },
    {
      id: 'aud-05',
      userId: 'usr-admin',
      userName: 'MR Abbas Khan',
      userRole: 'Super Admin',
      action: 'UPDATED_ROLE_PERMISSIONS',
      module: 'users',
      entityId: 'role-ops-mgr',
      entityDescription: 'Role: Operations Manager',
      details: 'Granted trip cancellation and incident override authority',
      ipAddress: '192.168.10.45',
      timestamp: '2026-10-01T10:15:00.000Z',
    },
  ];
  await db.auditLogs.insertMany(auditLogs);
}
