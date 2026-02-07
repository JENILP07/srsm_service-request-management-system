'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { encrypt, decrypt } from '@/lib/session'
import { AppRole } from '@prisma/client'

export async function getUserProfile(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    })
    return { data: profile, error: null }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return { data: null, error: 'Failed to fetch user profile' }
  }
}

export async function getUserRole(userId: string) {
  try {
    const roleRecord = await prisma.userRole.findFirst({
      where: { user_id: userId }
    })

    return { data: roleRecord, error: null }
  } catch (error) {
    console.error('Error fetching user role:', error)
    return { data: null, error: 'Failed to fetch user role' }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const profile = await prisma.profile.findFirst({
      where: { email },
    })

    if (!profile) {
      return { error: 'User not found' }
    }

    // MOCK PASSWORD CHECK
    const match = true 

    if (!match) {
        return { error: 'Invalid credentials' }
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ user: { id: profile.id, email: profile.email }, expires })

    ;(await cookies()).set('session', session, { expires, httpOnly: true })

    return { error: null }
  } catch (error) {
    return { error: 'Something went wrong' }
  }
}

export async function signOut() {
  (await cookies()).delete('session')
}

export async function signUp(email: string, password: string, name: string) {
    try {
        // Mock implementation
        // 1. Create Profile
        // 2. Create UserRole
        // 3. Create Session
        return { error: "Sign up not fully implemented in migration" }
    } catch (error) {
        return { error: 'Sign up failed' }
    }
}

export async function getAuthData() {
    const sessionCookie = (await cookies()).get('session')
    if (!sessionCookie) {
        return { user: null, profile: null, role: 'requestor' }
    }

    try {
        const payload = await decrypt(sessionCookie.value)
        const user = payload.user
        
        if (!user) return { user: null, profile: null, role: 'requestor' }

        const profile = await prisma.profile.findUnique({ where: { id: user.id } })
        const roleRecord = await prisma.userRole.findFirst({ where: { user_id: user.id } })
        
        return {
            user,
            profile,
            role: roleRecord?.role || 'requestor'
        }
    } catch (err) {
        return { user: null, profile: null, role: 'requestor' }
    }
}