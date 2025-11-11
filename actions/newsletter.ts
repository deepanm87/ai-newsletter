"use server"

import { wrapDatabaseOperation } from "@/lib/database/error-handler"
import { prisma } from "@/lib/prisma"

export async function createNewsletter(data: {
  userId: string
  suggestedTitles: string[]
  suggestedSubjectLines: string[]
  body: string
  topAnnouncements: string[]
  additionalInfo?: string
  startDate: Date
  endDate: Date
  userInput?: string
  feedsUsed: string[]
}) {
  return wrapDatabaseOperation(async () => {
    return await prisma.newsletter.create({
      data: {
        userId: data.userId,
        suggestedTitles: data.suggestedTitles,
        suggestedSubjectLines: data.suggestedSubjectLines,
        body: data.body,
        topAnnouncements: data.topAnnouncements,
        additionalInfo: data.additionalInfo,
        startDate: data.startDate,
        endDate: data.endDate,
        userInput: data.userInput,
        feedsUsed: data.feedsUsed
      }
    })
  }, "create newsletter")
}

export async function getNewslettersByUserId(
  userId: string,
  options?: {
    limit?: number,
    skip?: number
  }
) {
  return wrapDatabaseOperation(async () => {
    return await prisma.newsletter.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: options?.limit,
      skip: options?.skip
    })
  }, "fetch newsletter by user")
}

export async function getNewsletterById(id: string, userId: string) {
  return wrapDatabaseOperation(async () => {
    const newsletter = await prisma.newsletter.findUnique({
      where: {
        id
      }
    })

    if (!newsletter) {
      return null
    }

    if (newsletter.userId !== userId) {
      throw new Error("Unauthorized: Newsletter does not belog to user")
    }

    return newsletter
  }, "fetch newsletter by ID")
}

export async function getNewslettersCountByUserId(userId: string) {
  return wrapDatabaseOperation(async () => {
    return await prisma.newsletter.count({
      where: {
        userId
      }
    })
  }, "count newsletters by user")
}

export async function deleteNewsletter(id: string, userId: string) {
  return wrapDatabaseOperation(async () => {
    const newsletter = await prisma.newsletter.findUnique({
      where: {
        id
      }
    })

    if (!newsletter) {
      throw new Error("Newsletter not found")
    }

    if (newsletter.userId !== userId) {
      throw new Error("Unauthorized: Newsletter does not belong to user")
    }

    return await prisma.newsletter.delete({
      where: {
        id
      }
    })
  }, "delete newsletter")
}