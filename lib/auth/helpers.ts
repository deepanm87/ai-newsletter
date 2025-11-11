"use server"

import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/actions/user"

export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  const user = await getUserByClerkId(userId)

  if (!user) {
    throw new Error("User not found in database")
  }

  return user
}

export async function checkIsProUser(): Promise<boolean> {
  const { has } = await auth()

  if (!has) {
    return false
  }

  return await has({ plan: "pro" })
}