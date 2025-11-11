"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth/helpers"
import { deleteNewsletter as deleteNewsletterDb } from "./newsletter"

export async function deleteNewsletterAction(newsletterId: string) {
  try {
    const user = await getCurrentUser()

    await deleteNewsletterDb(newsletterId, user.id)

    revalidatePath("/dashboard/history")

    return {
      success: true
    }
  } catch (error) {
    console.error(`Failed to delete newsletter: ${error}`)
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete newsletter"
    )
  }
}