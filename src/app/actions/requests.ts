'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { AppRole } from '@prisma/client'

// Helper to get current user and role securely
async function getCurrentUser() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const userId = session.user.id
  
  // Fetch role
  const userRole = await prisma.userRole.findFirst({
    where: { user_id: userId }
  })
  
  return {
    id: userId,
    email: session.user.email,
    role: userRole?.role || 'requestor'
  }
}

export async function getRequests() {
  try {
    const user = await getCurrentUser()
    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

    // Build filter based on role
    const where: any = {}
    
    if (user.role === 'requestor') {
      where.requester_id = user.id
    } else if (user.role === 'technician') {
      where.assigned_to_user_id = user.id
    }
    // admin/hod see all
    
    const requests = await prisma.serviceRequest.findMany({
      where,
      select: {
        id: true,
        request_no: true,
        request_datetime: true,
        title: true,
        description: true,
        priority_level: true,
        status: {
          select: {
            id: true,
            name: true
          }
        },
        service_request_type: {
          select: {
            id: true,
            name: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        request_datetime: 'desc'
      }
    })

    // Convert dates to strings to avoid serialization issues
    const serializedRequests = requests.map(req => ({
        ...req,
        request_datetime: req.request_datetime.toISOString(),
    }))

    return { data: serializedRequests, error: null }
  } catch (error) {
    console.error('Error fetching requests:', error)
    return { data: null, error: 'Failed to fetch requests' }
  }
}

export async function createRequest(data: {
    title: string
    description: string
    priority_level: string
    service_request_type_id: string
}) {
    try {
        const user = await getCurrentUser()
        if (!user) return { error: 'Unauthorized' }

        const defaultStatus = await prisma.serviceRequestStatus.findFirst({
            where: { sequence: 0 } // or system_name: 'new'
        })

        if (!defaultStatus) return { error: 'Default status not found' }

        const request = await prisma.serviceRequest.create({
            data: {
                title: data.title,
                description: data.description,
                priority_level: data.priority_level,
                service_request_type_id: data.service_request_type_id,
                requester_id: user.id,
                status_id: defaultStatus.id,
                request_no: '', // Trigger should handle this
            }
        })
        
        const reloaded = await prisma.serviceRequest.findUnique({
            where: { id: request.id }
        })

        return { data: reloaded, error: null }
    } catch (error) {
        console.error('Create request error', error)
        return { error: 'Failed to create request' }
    }
}

export async function getRequestDetail(id: string) {
    try {
        const request = await prisma.serviceRequest.findUnique({
            where: { id },
            include: {
                status: true,
                requester: {
                    select: { id: true, name: true, email: true }
                },
                assigned_to_user: {
                    select: { id: true, name: true }
                },
                service_request_type: {
                    include: {
                        department: true
                    }
                },
                replies: {
                    include: {
                        user: { select: { name: true } },
                        status: { select: { name: true } }
                    },
                    orderBy: { reply_datetime: 'asc' }
                }
            }
        })
        
        if (!request) return { data: null, error: 'Request not found' }

        // Serialize
        const serialized = {
            ...request,
            request_datetime: request.request_datetime.toISOString(),
            status_datetime: request.status_datetime?.toISOString(),
            approval_datetime: request.approval_datetime?.toISOString(),
            assigned_datetime: request.assigned_datetime?.toISOString(),
            created_at: request.created_at.toISOString(),
            updated_at: request.updated_at.toISOString(),
            replies: request.replies.map(r => ({
                ...r,
                reply_datetime: r.reply_datetime.toISOString(),
                status_datetime: r.status_datetime?.toISOString(),
                created_at: r.created_at.toISOString(),
                updated_at: r.updated_at.toISOString(),
            }))
        }

        return { data: serialized, error: null }
    } catch (error) {
        console.error('Get request detail error', error)
        return { data: null, error: 'Failed to fetch request detail' }
    }
}

export async function addReply(requestId: string, description: string) {
    try {
        const user = await getCurrentUser()
        if (!user) return { error: 'Unauthorized' }
        
        // Get current request status
        const request = await prisma.serviceRequest.findUnique({
             where: { id: requestId },
             select: { status_id: true }
        })

        if (!request) return { error: 'Request not found' }

        const reply = await prisma.serviceRequestReply.create({
            data: {
                service_request_id: requestId,
                user_id: user.id,
                reply_description: description,
                status_id: request.status_id,
                status_by_user_id: user.id
            }
        })

        return { data: reply, error: null }

    } catch (error) {
        console.error('Add reply error', error)
        return { error: 'Failed to add reply' }
    }
}

export async function getDepartmentTechnicians(departmentId: string) {
    try {
        const persons = await prisma.serviceDeptPerson.findMany({
            where: { department_id: departmentId },
            include: {
                user: { select: { id: true, name: true } }
            }
        })
        
        return { data: persons.map(p => p.user), error: null }
    } catch (error) {
        return { data: [], error: 'Failed to fetch technicians' }
    }
}

export async function assignTechnician(requestId: string, technicianId: string) {
    try {
        const user = await getCurrentUser()
        if (!user) return { error: 'Unauthorized' }

        // Fetch request first to check validity and get status
        const request = await prisma.serviceRequest.findUnique({
            where: { id: requestId }
        })
        
        if (!request) return { error: 'Request not found' }

        // Update request
        await prisma.serviceRequest.update({
            where: { id: requestId },
            data: {
                assigned_to_user_id: technicianId,
                assigned_datetime: new Date(),
                assigned_by_user_id: user.id
                // Status update logic could be here (e.g. set to In Progress)
            }
        })
        
        // Add system reply
        const technician = await prisma.profile.findUnique({ where: { id: technicianId }})
        
        await prisma.serviceRequestReply.create({
            data: {
                service_request_id: requestId,
                user_id: user.id,
                reply_description: `Assigned request to ${technician?.name || 'Technician'}`,
                status_id: request.status_id
            }
        })

        return { error: null }
    } catch (error) {
        console.error('Assign technician error', error)
        return { error: 'Failed to assign technician' }
    }
}