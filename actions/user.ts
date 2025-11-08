"use server"

import { wrapDatabaseOperation } from "@/lib/database/error-handler"
import { prisma } from "@/lib/prisma"

export async function getUserByClerkId(clerkUserId: string) {
  return wrapDatabaseOperation(async () => {
    return await prisma.user.findUnique({
      where: { clerkUserId }
    })
  }, "fetch user by Clerk ID")
}

export async function upsertUserFromClerk(clerkUserId: string) {
  return wrapDatabaseOperation(async () => {
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId }
    })

    if (existingUser) {
      return await prisma.user.update({
        where: { clerkUserId },
        data: {
          updatedAt: new Date()
        }
      })
    }

    return await prisma.user.create({
      data: {
        clerkUserId
      }
    })
  }, "upsert user")
}