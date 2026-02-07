import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Fetching status counts...')
  const profileCount = await prisma.profile.count()
  const deptCount = await prisma.serviceDepartment.count()
  const requestCount = await prisma.serviceRequest.count()
  const statusCount = await prisma.serviceRequestStatus.count()

  console.log({
    profiles: profileCount,
    departments: deptCount,
    requests: requestCount,
    statuses: statusCount
  })

  if (statusCount > 0) {
    const statuses = await prisma.serviceRequestStatus.findMany({
      take: 5,
      orderBy: { sequence: 'asc' }
    })
    console.log('Sample Statuses:', statuses)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })