'use server'

import prisma from '@/lib/prisma'

export async function getStatuses() {
  try {
    const statuses = await prisma.serviceRequestStatus.findMany({
      orderBy: { sequence: 'asc' }
    })
    return { data: statuses, error: null }
  } catch (error) {
    console.error('Error fetching statuses:', error)
    return { data: [], error: 'Failed to fetch statuses' }
  }
}

export async function getDepartments() {
  try {
    const departments = await prisma.serviceDepartment.findMany({
      orderBy: { name: 'asc' }
    })
    return { data: departments, error: null }
  } catch (error) {
    console.error('Error fetching departments:', error)
    return { data: [], error: 'Failed to fetch departments' }
  }
}

export async function getServiceTypes() {
  try {
    const types = await prisma.serviceType.findMany({
      orderBy: { sequence: 'asc' }
    })
    return { data: types, error: null }
  } catch (error) {
    console.error('Error fetching service types:', error)
    return { data: [], error: 'Failed to fetch service types' }
  }
}

export async function getServiceRequestTypes(serviceTypeId?: string) {
  try {
    const where: any = {}
    if (serviceTypeId) {
      where.service_type_id = serviceTypeId
    }

    const types = await prisma.serviceRequestType.findMany({
      where,
      orderBy: { sequence: 'asc' },
      include: {
        department: true
      }
    })
    return { data: types, error: null }
  } catch (error) {
    console.error('Error fetching request types:', error)
    return { data: [], error: 'Failed to fetch request types' }
  }
}

export async function getAdminData() {
    // Placeholder for Admin Views migration
    // Implement getAllServiceRequestTypes, getAllServiceTypes etc.
    return { data: null, error: 'Not implemented' }
}
