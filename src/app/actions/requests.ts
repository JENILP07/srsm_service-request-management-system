'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { AppRole } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

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
            where: { system_name: 'OPEN' }
        })

        if (!defaultStatus) return { error: 'Default status not found' }

        const request = await prisma.serviceRequest.create({
            data: {
                id: uuidv4(),
                title: data.title,
                description: data.description,
                priority_level: data.priority_level,
                service_request_type_id: data.service_request_type_id,
                requester_id: user.id,
                status_id: defaultStatus.id,
                request_no: `REQ-${Date.now().toString().slice(-6)}`, 
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
                id: uuidv4(),
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
                id: uuidv4(),
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

export async function updateRequestStatus(requestId: string, statusName: string) {
    try {
        const user = await getCurrentUser()
        if (!user) return { error: 'Unauthorized' }

        // Find status by name (e.g. 'In Progress') or system_name (e.g. 'IN_PROGRESS')
        const status = await prisma.serviceRequestStatus.findFirst({
            where: {
                OR: [
                    { name: statusName },
                    { system_name: statusName },
                    { system_name: statusName.toUpperCase().replace(/\s+/g, '_') }
                ]
            }
        })

        if (!status) return { error: `Status '${statusName}' not found` }

        const request = await prisma.serviceRequest.update({
            where: { id: requestId },
            data: {
                status_id: status.id,
                status_datetime: new Date(),
                status_by_user_id: user.id
            }
        })

        // Add system reply
        await prisma.serviceRequestReply.create({
            data: {
                id: uuidv4(),
                service_request_id: requestId,
                user_id: user.id,
                reply_description: `Status changed to ${statusName}`,
                status_id: status.id,
                status_by_user_id: user.id
            }
        })

        return { data: request, error: null }
    } catch (error) {
        console.error('Update status error', error)
        return { error: 'Failed to update status' }
    }
}

export async function getDashboardStats() {
    try {
        const user = await getCurrentUser()
        if (!user) return { error: 'Unauthorized' }

        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        const resolvedStatuses = await prisma.serviceRequestStatus.findMany({
            where: { is_no_further_action_required: true }
        })
        const resolvedIds = resolvedStatuses.map(s => s.id)

        const inProgressStatus = await prisma.serviceRequestStatus.findFirst({
            where: { system_name: 'IN_PROGRESS' }
        })

        const pendingApprovalStatus = await prisma.serviceRequestStatus.findFirst({
            where: { system_name: 'PENDING_APPROVAL' }
        })

        if (user.role === 'admin') {
            const totalRequests = await prisma.serviceRequest.count()
            const departmentsCount = await prisma.serviceDepartment.count()
            const requestTypesCount = await prisma.serviceRequestType.count()
            const resolvedCount = await prisma.serviceRequest.count({
                where: { status_id: { in: resolvedIds } }
            })
            
            const resolutionRate = totalRequests > 0 
                ? Math.round((resolvedCount / totalRequests) * 100) 
                : 0

            return {
                data: {
                    totalRequests,
                    departmentsCount,
                    requestTypesCount,
                    resolutionRate: `${resolutionRate}%`
                },
                error: null
            }
        }

        if (user.role === 'hod') {
            // Find department for HOD
            const deptPerson = await prisma.serviceDeptPerson.findFirst({
                where: { user_id: user.id, is_hod: true }
            })

            if (!deptPerson) return { error: 'HOD Department not found' }

            const deptWhere = {
                service_request_type: {
                    department_id: deptPerson.department_id
                }
            }

            const pendingApproval = await prisma.serviceRequest.count({
                where: { 
                    ...deptWhere,
                    status_id: pendingApprovalStatus?.id
                }
            })

            const inProgress = await prisma.serviceRequest.count({
                where: {
                    ...deptWhere,
                    status_id: inProgressStatus?.id
                }
            })

            const completedToday = await prisma.serviceRequest.count({
                where: {
                    ...deptWhere,
                    status_id: { in: resolvedIds },
                    status_datetime: { gte: startOfToday }
                }
            })

            const teamMembers = await prisma.serviceDeptPerson.count({
                where: { department_id: deptPerson.department_id }
            })

            return {
                data: {
                    pendingApproval,
                    inProgress,
                    completedToday,
                    teamMembers
                },
                error: null
            }
        }

        if (user.role === 'technician') {
            const techWhere = { assigned_to_user_id: user.id }

            const assignedToMe = await prisma.serviceRequest.count({
                where: {
                    ...techWhere,
                    status: { is_no_further_action_required: false }
                }
            })

            const inProgress = await prisma.serviceRequest.count({
                where: {
                    ...techWhere,
                    status_id: inProgressStatus?.id
                }
            })

            const completedToday = await prisma.serviceRequest.count({
                where: {
                    ...techWhere,
                    status_id: { in: resolvedIds },
                    status_datetime: { gte: startOfToday }
                }
            })

            // Avg resolution time for technician
            const resolvedRequests = await prisma.serviceRequest.findMany({
                where: {
                    ...techWhere,
                    status_id: { in: resolvedIds },
                    status_datetime: { not: null }
                },
                select: {
                    request_datetime: true,
                    status_datetime: true
                }
            })

            let avgResolution = 'N/A'
            if (resolvedRequests.length > 0) {
                const totalDiff = resolvedRequests.reduce((acc, req) => {
                    return acc + (req.status_datetime!.getTime() - req.request_datetime.getTime())
                }, 0)
                const avgMs = totalDiff / resolvedRequests.length
                const avgDays = (avgMs / (1000 * 60 * 60 * 24)).toFixed(1)
                avgResolution = `${avgDays} days`
            }

            return {
                data: {
                    assignedToMe,
                    inProgress,
                    completedToday,
                    avgResolution
                },
                error: null
            }
        }

        // Default: Requestor
        const requesterWhere = { requester_id: user.id }

        const totalRequests = await prisma.serviceRequest.count({ where: requesterWhere })
        
        const pending = await prisma.serviceRequest.count({
            where: {
                ...requesterWhere,
                status: { system_name: 'OPEN' }
            }
        })

        const inProgress = await prisma.serviceRequest.count({
            where: {
                ...requesterWhere,
                status_id: inProgressStatus?.id
            }
        })

        const resolved = await prisma.serviceRequest.count({
            where: {
                ...requesterWhere,
                status_id: { in: resolvedIds }
            }
        })

        return {
            data: {
                totalRequests,
                pending,
                inProgress,
                resolved
            },
            error: null
        }

    } catch (error) {
        console.error('Dashboard stats error:', error)
        return { error: 'Failed to fetch dashboard stats' }
    }
}