"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export interface UserSettingsInput {
  newsletterName?: string | null
  description?: string | null
  targetAudience?: string | null
  defaultTone?: string | null

  brandVoice?: string | null
  companyName?: string | null
  industry?: string | null

  disclaimerText?: string | null
  defaultTags?: string[]
  customFooter?: string | null
  senderName?: string | null
  senderEmail?: string  | null
}

export async function getCurrentUserSettings() {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const settings = await prisma.userSettings.findFirst({
      where: {
        user: {
          clerkUserId: userId
        }
      }
    })

    return settings
  } catch (error) {
    console.error(`Failed to fetch user settings ${error}`)
    throw new Error("Failed to fetch user settings")
  }
}

export async function getUserSettingsByUserId(userId: string) {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: {
        userId
      }
    })

    return settings
  } catch (error) {
    console.error(`Failed to fetch user settings by user ID: ${error}`)
    throw new Error("Failed to fetch user settings")
  }
}

export async function upsertUserSettings(
  data: UserSettingsInput
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId}
    })

    if (!user) {
      throw new Error("User not found in database")
    }

    const existingSettings = await prisma.userSettings.findUnique({
      where: {
        userId: user.id
      }
    })

    let settings: Awaited<ReturnType<typeof prisma.userSettings.findUnique>>
    if (existingSettings) {
      settings = await prisma.userSettings.update({
        where: {
          userId: user.id
        },
        data: {
          newsletterName: data.newsletterName,
          description: data.description,
          targetAudience: data.targetAudience,
          defaultTone: data.defaultTone,
          brandVoice: data.brandVoice,
          companyName: data.companyName,
          industry: data.industry,
          disclaimerText: data.disclaimerText,
          customFooter: data.customFooter,
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          updatedAt: new Date()
        }
      })
    } else {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          newsletterName: data.newsletterName,
          description: data.description,
          targetAudience: data.targetAudience,
          defaultTone: data.defaultTone,
          brandVoice: data.brandVoice,
          companyName: data.companyName,
          industry: data.industry,
          disclaimerText: data.disclaimerText,
          defaultTags: data.defaultTags || [],
          customFooter: data.customFooter,
          senderName: data.senderName,
          senderEmail: data.senderEmail
        }
      })
    }

    return settings

  } catch (error) {
    console.error(`Failed to upsert user settings: ${error}`)
    throw new Error("Failed to save user settings")
  }
}

export async function deleteUserSettings(): Promise<void> {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("User not authenticated")
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) {
      throw new Error("User not found in database")
    }

    await prisma.userSettings.deleteMany({
      where: {
        userId: user.id
      }
    })
  } catch (error) {
    console.error(`Failed to delete user settings ${error}`)
    throw new Error("Failed to delete user settings")
  }
}