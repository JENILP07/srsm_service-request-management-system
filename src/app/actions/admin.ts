'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { v4 as uuidv4 } from 'uuid'

// Helper to check admin role
async function checkAdmin() {
  const session = await getSession()
  if (!session?.user?.id) return false
  
  const userRole = await prisma.userRole.findFirst({
    where: { user_id: session.user.id }
  })
  
  return userRole?.role === 'admin'
}

// --- Profiles (Users) ---

export async function getProfiles() {
  try {
    const profiles = await prisma.profile.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true }
    })
    return { data: profiles, error: null }
  } catch (error) {
    console.error('Get profiles error:', error)
    return { data: [], error: 'Failed to fetch profiles' }
  }
}

// --- Service Departments ---

export async function getDepartments() {
  try {
    const departments = await prisma.serviceDepartment.findMany({
      orderBy: { name: 'asc' }
    })
    
    // Serialize dates
    const serialized = departments.map(d => ({
        ...d,
        created_at: d.created_at.toISOString(),
        updated_at: d.updated_at.toISOString(),
    }))
    
    return { data: serialized, error: null }
  } catch (error) {
    console.error('Get departments error:', error)
    return { data: [], error: 'Failed to fetch departments' }
  }
}

export async function createDepartment(data: {
    name: string
    description?: string | null
    cc_email?: string | null
    is_request_title_disabled?: boolean
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const dept = await prisma.serviceDepartment.create({
            data: {
                id: uuidv4(),
                name: data.name,
                description: data.description,
                cc_email: data.cc_email,
                is_request_title_disabled: data.is_request_title_disabled
            }
        })
        return { data: dept, error: null }
    } catch (error) {
        console.error('Create department error:', error)
        return { error: 'Failed to create department' }
    }
}

export async function updateDepartment(id: string, data: {
    name: string
    description?: string | null
    cc_email?: string | null
    is_request_title_disabled?: boolean
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const dept = await prisma.serviceDepartment.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                cc_email: data.cc_email,
                is_request_title_disabled: data.is_request_title_disabled
            }
        })
        return { data: dept, error: null }
    } catch (error) {
        console.error('Update department error:', error)
        return { error: 'Failed to update department' }
    }
}

export async function deleteDepartment(id: string) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        await prisma.serviceDepartment.delete({
            where: { id }
        })
        return { error: null }
    } catch (error) {
        console.error('Delete department error:', error)
        return { error: 'Failed to delete department' }
    }
}

// --- Service Types ---

export async function getServiceTypes() {
  try {
    const types = await prisma.serviceType.findMany({
      orderBy: { sequence: 'asc' }
    })
    return { data: types, error: null }
  } catch (error) {
    console.error('Get service types error:', error)
    return { data: [], error: 'Failed to fetch service types' }
  }
}

export async function createServiceType(data: {
    name: string
    description?: string | null
    sequence: number
    is_for_staff: boolean
    is_for_student: boolean
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const type = await prisma.serviceType.create({
            data: {
                id: uuidv4(),
                name: data.name,
                description: data.description,
                sequence: data.sequence,
                is_for_staff: data.is_for_staff,
                is_for_student: data.is_for_student
            }
        })
        return { data: type, error: null }
    } catch (error) {
        console.error('Create service type error:', error)
        return { error: 'Failed to create service type' }
    }
}

export async function updateServiceType(id: string, data: {
    name: string
    description?: string | null
    sequence: number
    is_for_staff: boolean
    is_for_student: boolean
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const type = await prisma.serviceType.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                sequence: data.sequence,
                is_for_staff: data.is_for_staff,
                is_for_student: data.is_for_student
            }
        })
        return { data: type, error: null }
    } catch (error) {
        console.error('Update service type error:', error)
        return { error: 'Failed to update service type' }
    }
}

export async function deleteServiceType(id: string) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        await prisma.serviceType.delete({
            where: { id }
        })
        return { error: null }
    } catch (error) {
        console.error('Delete service type error:', error)
        return { error: 'Failed to delete service type' }
    }
}

// --- Statuses ---

export async function getStatuses() {
  try {
    const statuses = await prisma.serviceRequestStatus.findMany({
      orderBy: { sequence: 'asc' }
    })
    return { data: statuses, error: null }
  } catch (error) {
    console.error('Get statuses error:', error)
    return { data: [], error: 'Failed to fetch statuses' }
  }
}

export async function createStatus(data: {
    name: string
    system_name: string
    sequence: number
    description?: string | null
    css_class?: string | null
    is_open: boolean
    is_no_further_action_required: boolean
    is_allowed_for_technician: boolean
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const status = await prisma.serviceRequestStatus.create({
            data: {
                id: uuidv4(),
                name: data.name,
                system_name: data.system_name,
                sequence: data.sequence,
                description: data.description,
                css_class: data.css_class,
                is_open: data.is_open,
                is_no_further_action_required: data.is_no_further_action_required,
                is_allowed_for_technician: data.is_allowed_for_technician
            }
        })
        return { data: status, error: null }
    } catch (error) {
        console.error('Create status error:', error)
        return { error: 'Failed to create status' }
    }
}

export async function updateStatus(id: string, data: {
    name: string
    system_name: string
    sequence: number
    description?: string | null
    css_class?: string | null
    is_open: boolean
    is_no_further_action_required: boolean
    is_allowed_for_technician: boolean
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const status = await prisma.serviceRequestStatus.update({
            where: { id },
            data: {
                name: data.name,
                system_name: data.system_name,
                sequence: data.sequence,
                description: data.description,
                css_class: data.css_class,
                is_open: data.is_open,
                is_no_further_action_required: data.is_no_further_action_required,
                is_allowed_for_technician: data.is_allowed_for_technician
            }
        })
        return { data: status, error: null }
    } catch (error) {
        console.error('Update status error:', error)
        return { error: 'Failed to update status' }
    }
}

export async function deleteStatus(id: string) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        await prisma.serviceRequestStatus.delete({
            where: { id }
        })
        return { error: null }
    } catch (error) {
        console.error('Delete status error:', error)
        return { error: 'Failed to delete status' }
    }
}

// --- Request Types ---

export async function getRequestTypes() {
  try {
    const requestTypes = await prisma.serviceRequestType.findMany({
      include: {
        service_type: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } }
      },
      orderBy: { sequence: 'asc' }
    })
    return { data: requestTypes, error: null }
  } catch (error) {
    console.error('Get request types error:', error)
    return { data: [], error: 'Failed to fetch request types' }
  }
}

export async function createRequestType(data: {
    name: string
    description?: string | null
    sequence: number
    service_type_id: string
    department_id: string
    default_priority_level?: string | null
    reminder_days_after_assignment?: number | null
    is_visible_resource: boolean
    is_mandatory_resource: boolean
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const type = await prisma.serviceRequestType.create({
            data: {
                id: uuidv4(),
                name: data.name,
                description: data.description,
                sequence: data.sequence,
                service_type_id: data.service_type_id,
                department_id: data.department_id,
                default_priority_level: data.default_priority_level,
                reminder_days_after_assignment: data.reminder_days_after_assignment,
                is_visible_resource: data.is_visible_resource,
                is_mandatory_resource: data.is_mandatory_resource
            }
        })
        return { data: type, error: null }
    } catch (error) {
        console.error('Create request type error:', error)
        return { error: 'Failed to create request type' }
    }
}

export async function updateRequestType(id: string, data: {
    name: string
    description?: string | null
    sequence: number
    service_type_id: string
    department_id: string
    default_priority_level?: string | null
    reminder_days_after_assignment?: number | null
    is_visible_resource: boolean
    is_mandatory_resource: boolean
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const type = await prisma.serviceRequestType.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                sequence: data.sequence,
                service_type_id: data.service_type_id,
                department_id: data.department_id,
                default_priority_level: data.default_priority_level,
                reminder_days_after_assignment: data.reminder_days_after_assignment,
                is_visible_resource: data.is_visible_resource,
                is_mandatory_resource: data.is_mandatory_resource
            }
        })
        return { data: type, error: null }
    } catch (error) {
        console.error('Update request type error:', error)
        return { error: 'Failed to update request type' }
    }
}

export async function deleteRequestType(id: string) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        await prisma.serviceRequestType.delete({
            where: { id }
        })
        return { error: null }
    } catch (error) {
        console.error('Delete request type error:', error)
        return { error: 'Failed to delete request type' }
    }
}

// --- Department Persons ---

export async function getDeptPersons() {
  try {
    const persons = await prisma.serviceDeptPerson.findMany({
      include: {
        department: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { from_date: 'desc' }
    })
    
    // Serialize dates
    const serialized = persons.map(p => ({
        ...p,
        from_date: p.from_date.toISOString(),
        to_date: p.to_date?.toISOString(),
        created_at: p.created_at.toISOString(),
        updated_at: p.updated_at.toISOString(),
    }))
    
    return { data: serialized, error: null }
  } catch (error) {
    console.error('Get dept persons error:', error)
    return { data: [], error: 'Failed to fetch department personnel' }
  }
}

export async function createDeptPerson(data: {
    department_id: string
    user_id: string
    from_date: string // ISO Date string
    to_date?: string | null
    is_hod: boolean
    description?: string | null
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const person = await prisma.serviceDeptPerson.create({
            data: {
                id: uuidv4(),
                department_id: data.department_id,
                user_id: data.user_id,
                from_date: new Date(data.from_date),
                to_date: data.to_date ? new Date(data.to_date) : null,
                is_hod: data.is_hod,
                description: data.description
            }
        })
        return { data: person, error: null }
    } catch (error) {
        console.error('Create dept person error:', error)
        return { error: 'Failed to add person to department' }
    }
}

export async function updateDeptPerson(id: string, data: {
    department_id: string
    user_id: string
    from_date: string
    to_date?: string | null
    is_hod: boolean
    description?: string | null
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const person = await prisma.serviceDeptPerson.update({
            where: { id },
            data: {
                department_id: data.department_id,
                user_id: data.user_id,
                from_date: new Date(data.from_date),
                to_date: data.to_date ? new Date(data.to_date) : null,
                is_hod: data.is_hod,
                description: data.description
            }
        })
        return { data: person, error: null }
    } catch (error) {
        console.error('Update dept person error:', error)
        return { error: 'Failed to update person' }
    }
}

export async function deleteDeptPerson(id: string) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        await prisma.serviceDeptPerson.delete({
            where: { id }
        })
        return { error: null }
    } catch (error) {
        console.error('Delete dept person error:', error)
        return { error: 'Failed to remove person' }
    }
}

// --- Type Person Maps ---

export async function getTypePersonMaps() {
  try {
    const maps = await prisma.serviceRequestTypePerson.findMany({
      include: {
        service_request_type: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } }
      },
      orderBy: { created_at: 'desc' }
    })
    
    // Serialize dates
    const serialized = maps.map(m => ({
        ...m,
        from_date: m.from_date?.toISOString(),
        to_date: m.to_date?.toISOString(),
        created_at: m.created_at.toISOString(),
        updated_at: m.updated_at.toISOString(),
    }))
    
    return { data: serialized, error: null }
  } catch (error) {
    console.error('Get type person maps error:', error)
    return { data: [], error: 'Failed to fetch mappings' }
  }
}

export async function createTypePersonMap(data: {
    service_request_type_id: string
    user_id: string
    from_date?: string | null
    to_date?: string | null
    description?: string | null
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const map = await prisma.serviceRequestTypePerson.create({
            data: {
                id: uuidv4(),
                service_request_type_id: data.service_request_type_id,
                user_id: data.user_id,
                from_date: data.from_date ? new Date(data.from_date) : null,
                to_date: data.to_date ? new Date(data.to_date) : null,
                description: data.description
            }
        })
        return { data: map, error: null }
    } catch (error) {
        console.error('Create type person map error:', error)
        return { error: 'Failed to create mapping' }
    }
}

export async function updateTypePersonMap(id: string, data: {
    service_request_type_id: string
    user_id: string
    from_date?: string | null
    to_date?: string | null
    description?: string | null
}) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        const map = await prisma.serviceRequestTypePerson.update({
            where: { id },
            data: {
                service_request_type_id: data.service_request_type_id,
                user_id: data.user_id,
                from_date: data.from_date ? new Date(data.from_date) : null,
                to_date: data.to_date ? new Date(data.to_date) : null,
                description: data.description
            }
        })
        return { data: map, error: null }
    } catch (error) {
        console.error('Update type person map error:', error)
        return { error: 'Failed to update mapping' }
    }
}

export async function deleteTypePersonMap(id: string) {
    try {
        if (!await checkAdmin()) return { error: 'Unauthorized' }
        
        await prisma.serviceRequestTypePerson.delete({
            where: { id }
        })
        return { error: null }
    } catch (error) {
        console.error('Delete type person map error:', error)
        return { error: 'Failed to delete mapping' }
    }
}
