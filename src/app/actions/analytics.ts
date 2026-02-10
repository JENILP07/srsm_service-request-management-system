'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { startOfMonth, subMonths, endOfMonth, format, startOfDay, endOfDay } from 'date-fns'

async function checkAuthorized() {
    const session = await getSession()
    if (!session?.user?.id) return false
    
    const userRole = await prisma.userRole.findFirst({
        where: { user_id: session.user.id }
    })
    
    return ['admin', 'hod'].includes(userRole?.role || '')
}

export async function getAnalyticsStats(dateRange?: { from?: string, to?: string }) {
    try {
        if (!await checkAuthorized()) return { error: 'Unauthorized' }

        const where: any = {}
        if (dateRange?.from || dateRange?.to) {
            where.request_datetime = {}
            if (dateRange.from) where.request_datetime.gte = new Date(dateRange.from)
            if (dateRange.to) where.request_datetime.lte = new Date(dateRange.to)
        }

        const totalRequests = await prisma.serviceRequest.count({ where })
        
        const pendingStatus = await prisma.serviceRequestStatus.findMany({
            where: { is_open: true, is_no_further_action_required: false }
        })
        const pendingIds = pendingStatus.map(s => s.id)
        const pendingCount = await prisma.serviceRequest.count({
            where: { ...where, status_id: { in: pendingIds } }
        })

        const resolvedStatus = await prisma.serviceRequestStatus.findMany({
            where: { is_no_further_action_required: true }
        })
        const resolvedIds = resolvedStatus.map(s => s.id)
        const resolvedCount = await prisma.serviceRequest.count({
            where: { ...where, status_id: { in: resolvedIds } }
        })

        const resolvedRequests = await prisma.serviceRequest.findMany({
            where: { 
                ...where,
                status_id: { in: resolvedIds },
                status_datetime: { not: null }
            },
            select: {
                request_datetime: true,
                status_datetime: true
            }
        })

        let avgHours = 0
        if (resolvedRequests.length > 0) {
            const totalDiff = resolvedRequests.reduce((acc, req) => {
                const diff = (req.status_datetime!.getTime() - req.request_datetime.getTime()) / (1000 * 60 * 60)
                return acc + diff
            }, 0)
            avgHours = totalDiff / resolvedRequests.length
        }

        return {
            data: {
                totalRequests,
                pendingCount,
                resolvedCount,
                avgHours: parseFloat(avgHours.toFixed(1))
            },
            error: null
        }
    } catch (error) {
        console.error('Analytics stats error:', error)
        return { error: 'Failed to fetch stats' }
    }
}

export async function getMonthlyTrends(dateRange?: { from?: string, to?: string }) {
    try {
        if (!await checkAuthorized()) return { error: 'Unauthorized' }

        const now = new Date()
        let startDate = startOfMonth(subMonths(now, 5))
        let endDate = endOfMonth(now)

        if (dateRange?.from) startDate = startOfDay(new Date(dateRange.from))
        if (dateRange?.to) endDate = endOfDay(new Date(dateRange.to))

        const requests = await prisma.serviceRequest.findMany({
            where: {
                request_datetime: { gte: startDate, lte: endDate }
            },
            select: {
                request_datetime: true,
                status_id: true
            }
        })

        const resolvedStatus = await prisma.serviceRequestStatus.findMany({
            where: { is_no_further_action_required: true },
            select: { id: true }
        })
        const resolvedIds = new Set(resolvedStatus.map(s => s.id))

        // If date range is small (e.g. within 1 month), show daily. Otherwise show monthly.
        const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        
        if (diffDays <= 31) {
            // Daily trends
            const days = []
            let curr = new Date(startDate)
            while (curr <= endDate) {
                const dateStr = format(curr, 'MMM d')
                const dayRequests = requests.filter(r => format(r.request_datetime, 'MMM d') === dateStr)
                days.push({
                    month: dateStr,
                    requests: dayRequests.length,
                    resolved: dayRequests.filter(r => resolvedIds.has(r.status_id)).length
                })
                curr.setDate(curr.getDate() + 1)
            }
            return { data: days, error: null }
        } else {
            // Monthly trends
            const months = []
            let curr = new Date(startDate)
            while (curr <= endDate) {
                const monthStr = format(curr, 'MMM yyyy')
                const monthRequests = requests.filter(r => format(r.request_datetime, 'MMM yyyy') === monthStr)
                months.push({
                    month: monthStr,
                    requests: monthRequests.length,
                    resolved: monthRequests.filter(r => resolvedIds.has(r.status_id)).length
                })
                curr = startOfMonth(new Date(curr.setMonth(curr.getMonth() + 1)))
            }
            return { data: months, error: null }
        }
    } catch (error) {
        console.error('Monthly trends error:', error)
        return { error: 'Failed to fetch trends' }
    }
}

export async function getStatusDistribution(dateRange?: { from?: string, to?: string }) {
    try {
        if (!await checkAuthorized()) return { error: 'Unauthorized' }

        const where: any = {}
        if (dateRange?.from || dateRange?.to) {
            where.request_datetime = {}
            if (dateRange.from) where.request_datetime.gte = new Date(dateRange.from)
            if (dateRange.to) where.request_datetime.lte = new Date(dateRange.to)
        }

        const statusCounts = await prisma.serviceRequest.groupBy({
            where,
            by: ['status_id'],
            _count: { _all: true }
        })

        const statuses = await prisma.serviceRequestStatus.findMany()
        const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

        const data = statusCounts.map((sc, i) => {
            const status = statuses.find(s => s.id === sc.status_id)
            return {
                status: status?.name || 'Unknown',
                value: sc._count._all,
                fill: colors[i % colors.length]
            }
        })

        return { data, error: null }
    } catch (error) {
        return { error: 'Failed to fetch distribution' }
    }
}

export async function getDepartmentLoad(dateRange?: { from?: string, to?: string }) {
    try {
        if (!await checkAuthorized()) return { error: 'Unauthorized' }

        const where: any = {}
        if (dateRange?.from || dateRange?.to) {
            where.request_datetime = {}
            if (dateRange.from) where.request_datetime.gte = new Date(dateRange.from)
            if (dateRange.to) where.request_datetime.lte = new Date(dateRange.to)
        }

        const requests = await prisma.serviceRequest.findMany({
            where,
            include: { service_request_type: { include: { department: true } } }
        })

        const deptCounts: Record<string, number> = {}
        requests.forEach(req => {
            const deptName = req.service_request_type.department?.name || 'Unassigned'
            deptCounts[deptName] = (deptCounts[deptName] || 0) + 1
        })

        const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
        const data = Object.entries(deptCounts).map(([name, count], i) => ({
            department: name,
            tickets: count,
            color: colors[i % colors.length]
        }))

        return { data, error: null }
    } catch (error) {
        return { error: 'Failed to fetch load' }
    }
}

export async function downloadAnalyticsReport(dateRange?: { from?: string, to?: string }) {
    try {
        if (!await checkAuthorized()) return { error: 'Unauthorized' }

        const where: any = {}
        if (dateRange?.from || dateRange?.to) {
            where.request_datetime = {}
            if (dateRange.from) where.request_datetime.gte = new Date(dateRange.from)
            if (dateRange.to) where.request_datetime.lte = new Date(dateRange.to)
        }

        const requests = await prisma.serviceRequest.findMany({
            where,
            include: {
                status: true,
                requester: true,
                service_request_type: { include: { department: true } }
            },
            orderBy: { request_datetime: 'desc' }
        })

        // Format data for CSV
        const header = ["Request No", "Title", "Date", "Status", "Priority", "Department", "Requester"]
        const rows = requests.map(r => [
            r.request_no,
            r.title,
            format(r.request_datetime, 'yyyy-MM-dd HH:mm'),
            r.status.name,
            r.priority_level,
            r.service_request_type.department?.name || 'N/A',
            r.requester.name
        ])

        const csvContent = [header, ...rows].map(e => e.join(",")).join("\n")
        
        return { data: csvContent, error: null }
    } catch (error) {
        return { error: 'Failed to generate report' }
    }
}