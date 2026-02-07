import { PrismaClient, AppRole } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { v4 as uuidv4 } from 'uuid'

const connectionString = process.env.DATABASE_URL

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding ...')

  // 1. Clean up existing data (optional, be careful in production)
  // await prisma.serviceRequestReply.deleteMany()
  // await prisma.serviceRequest.deleteMany()
  // await prisma.serviceRequestTypePerson.deleteMany()
  // await prisma.serviceDeptPerson.deleteMany()
  // await prisma.serviceRequestType.deleteMany()
  // await prisma.serviceType.deleteMany()
  // await prisma.serviceRequestStatus.deleteMany()
  // await prisma.serviceDepartment.deleteMany()
  // await prisma.userRole.deleteMany()
  // await prisma.profile.deleteMany()

  // 2. Create Profiles (Users)
  const adminEmail = 'admin@example.com'
  const hodEmail = 'hod@example.com'
  const techEmail = 'tech@example.com'
  const userEmail = 'user@example.com'

  // Helper to get or create user
  async function upsertUser(email: string, name: string, seed: string) {
    const existing = await prisma.profile.findFirst({ where: { email } })
    if (existing) return existing
    
    return prisma.profile.create({
      data: {
        id: uuidv4(),
        email,
        name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
      }
    })
  }

  const admin = await upsertUser(adminEmail, 'System Administrator', 'admin')
  const hod = await upsertUser(hodEmail, 'Department HOD', 'hod')
  const tech = await upsertUser(techEmail, 'Senior Technician', 'tech')
  const user = await upsertUser(userEmail, 'Regular User', 'user')

  console.log('Profiles created.')

  // 3. Assign Roles
  async function assignRole(userId: string, role: AppRole) {
    const existing = await prisma.userRole.findFirst({ 
        where: { user_id: userId, role } 
    })
    if (!existing) {
        await prisma.userRole.create({
            data: {
                id: uuidv4(),
                user_id: userId,
                role
            }
        })
    }
  }

  await assignRole(admin.id, AppRole.admin)
  await assignRole(hod.id, AppRole.hod)
  await assignRole(tech.id, AppRole.technician)
  await assignRole(user.id, AppRole.requestor)

  console.log('Roles assigned.')

  // 4. Create Service Departments
  const deptIT = await prisma.serviceDepartment.upsert({
    where: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0851' },
    update: {},
    create: {
      id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
      name: 'Information Technology',
      description: 'IT Support and Services',
      cc_email: 'it-support@example.com',
    },
  })

  await prisma.serviceDepartment.upsert({
    where: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0852' },
    update: {},
    create: {
      id: 'd290f1ee-6c54-4b01-90e6-d701748f0852',
      name: 'Maintenance',
      description: 'General Facilities Maintenance',
      cc_email: 'maintenance@example.com',
    },
  })
  
  console.log('Departments created.')

  // 5. Assign HOD and Tech to Departments
  // HOD for IT
  const existingHod = await prisma.serviceDeptPerson.findFirst({
      where: { department_id: deptIT.id, user_id: hod.id, is_hod: true }
  })
  if (!existingHod) {
      await prisma.serviceDeptPerson.create({
        data: {
          id: uuidv4(),
          department_id: deptIT.id,
          user_id: hod.id,
          is_hod: true,
          from_date: new Date(),
        }
      })
  }

  // Tech for IT
  const existingTech = await prisma.serviceDeptPerson.findFirst({
      where: { department_id: deptIT.id, user_id: tech.id, is_hod: false }
  })
  if (!existingTech) {
      await prisma.serviceDeptPerson.create({
        data: {
          id: uuidv4(),
          department_id: deptIT.id,
          user_id: tech.id,
          is_hod: false,
          from_date: new Date(),
        }
      })
  }

  console.log('Department staff assigned.')

  // 6. Create Service Request Statuses
  const statuses = [
    { name: 'Open', system_name: 'OPEN', sequence: 10, is_open: true, css_class: 'bg-blue-100 text-blue-800' },
    { name: 'In Progress', system_name: 'IN_PROGRESS', sequence: 20, is_open: true, css_class: 'bg-yellow-100 text-yellow-800' },
    { name: 'Pending Approval', system_name: 'PENDING_APPROVAL', sequence: 30, is_open: true, css_class: 'bg-purple-100 text-purple-800' },
    { name: 'Resolved', system_name: 'RESOLVED', sequence: 40, is_open: false, is_no_further_action_required: true, css_class: 'bg-green-100 text-green-800' },
    { name: 'Closed', system_name: 'CLOSED', sequence: 50, is_open: false, is_no_further_action_required: true, css_class: 'bg-gray-100 text-gray-800' },
  ]

  const statusMap = new Map()

  for (const s of statuses) {
    let status = await prisma.serviceRequestStatus.findFirst({
        where: { system_name: s.system_name }
    })

    if (!status) {
        status = await prisma.serviceRequestStatus.create({
            data: {
                id: uuidv4(),
                ...s
            }
        })
    }
    statusMap.set(s.system_name, status)
  }

  console.log('Statuses created.')

  // 7. Create Service Types
  const typeHardware = await prisma.serviceType.upsert({
      where: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0861' },
      update: {},
      create: {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0861',
        name: 'Hardware',
        description: 'Physical equipment issues',
        sequence: 1,
      }
  })

  const typeSoftware = await prisma.serviceType.upsert({
      where: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0862' },
      update: {},
      create: {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0862',
        name: 'Software',
        description: 'Application and OS issues',
        sequence: 2,
      }
  })

  console.log('Service Types created.')

  // 8. Create Service Request Types
  const reqTypeLaptop = await prisma.serviceRequestType.upsert({
      where: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0871' },
      update: {},
      create: {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0871',
        name: 'New Laptop Request',
        description: 'Request for a new laptop assignment',
        department_id: deptIT.id,
        service_type_id: typeHardware.id,
        default_priority_level: 'Medium',
      }
  })

  // 9. Create a Sample Request
  const openStatus = statusMap.get('OPEN')
  
  if (openStatus) {
    const existingReq = await prisma.serviceRequest.findFirst({ where: { request_no: 'REQ-2024-001' } })
    if (!existingReq) {
        await prisma.serviceRequest.create({
        data: {
            id: uuidv4(),
            request_no: 'REQ-2024-001',
            title: 'Need a new mouse',
            description: 'My mouse left click is not working properly.',
            requester_id: user.id,
            service_request_type_id: reqTypeLaptop.id, 
            status_id: openStatus.id,
            priority_level: 'Low',
        }
        })
        console.log('Sample Request created.')
    }
  }

  // 10. Create Type Person Mappings
  const existingMap = await prisma.serviceRequestTypePerson.findFirst({
      where: {
          service_request_type_id: reqTypeLaptop.id,
          user_id: tech.id
      }
  })

  if (!existingMap) {
      await prisma.serviceRequestTypePerson.create({
          data: {
              id: uuidv4(),
              service_request_type_id: reqTypeLaptop.id,
              user_id: tech.id,
              from_date: new Date(),
              description: 'Primary technician for laptop requests'
          }
      })
      console.log('Type Person Mapping created.')
  }

  // 11. Create a Request assigned to Technician
  const inProgressStatus = statusMap.get('IN_PROGRESS')
  if (inProgressStatus) {
      const existingAssignedReq = await prisma.serviceRequest.findFirst({
          where: { request_no: 'REQ-2024-002' }
      })

      if (!existingAssignedReq) {
          await prisma.serviceRequest.create({
              data: {
                  id: uuidv4(),
                  request_no: 'REQ-2024-002',
                  title: 'Laptop overheating issue',
                  description: 'My laptop gets very hot after 30 minutes of use.',
                  requester_id: user.id,
                  service_request_type_id: reqTypeLaptop.id,
                  status_id: inProgressStatus.id,
                  priority_level: 'High',
                  assigned_to_user_id: tech.id,
                  assigned_datetime: new Date(),
                  assigned_by_user_id: admin.id,
                  assigned_description: 'Assigned to senior technician for diagnostic.'
              }
          })
          console.log('Assigned Request created for Technician.')
      }
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })