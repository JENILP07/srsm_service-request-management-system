'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { encrypt, decrypt } from '@/lib/session'
import { AppRole } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const SESSION_COOKIE_NAME = 'session'

function getSessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires,
  }
}

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

    if (!profile?.password_hash) {
      return { error: 'Invalid credentials' }
    }

    const match = await compare(password, profile.password_hash)
    if (!match) {
      return { error: 'Invalid credentials' }
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ user: { id: profile.id, email: profile.email }, expires })

    ;(await cookies()).set(SESSION_COOKIE_NAME, session, getSessionCookieOptions(expires))

    return { error: null }
  } catch (error) {
    return { error: 'Invalid credentials' }
  }
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE_NAME)
}

export async function signUp(email: string, password: string, name: string) {
    try {
        const existing = await prisma.profile.findFirst({ where: { email } })
        if (existing) {
            return { error: 'Email already in use' }
        }

        const passwordHash = await hash(password, 10)
        const profile = await prisma.profile.create({
            data: {
                id: uuidv4(),
                email,
                name,
                password_hash: passwordHash,
            }
        })

        await prisma.userRole.create({
            data: {
                id: uuidv4(),
                user_id: profile.id,
                role: AppRole.requestor
            }
        })

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const session = await encrypt({ user: { id: profile.id, email: profile.email }, expires })
        ;(await cookies()).set(SESSION_COOKIE_NAME, session, getSessionCookieOptions(expires))

        return { error: null }
    } catch (error) {
        return { error: 'Sign up failed' }
    }
}

export async function getAuthData() {
    const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)
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
