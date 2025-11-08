"use server"

import { wrapDatabaseOperation } from "@/lib/database/error-handler"
import {
  FEED_ORDER_BY_CREATED_DESC,
  FEED_WITH_COUNT_INCLUDE,
} from "@/lib/database/prisma-helpers"
import { prisma } from "@/lib/prisma"

export async function getRssFeedsByUserId(userId: string) {
  return wrapDatabaseOperation(async () => {
    return await prisma.rssFeed.findMany({
      where: {
        userId
      },
      include: FEED_WITH_COUNT_INCLUDE,
      orderBy: FEED_ORDER_BY_CREATED_DESC
    })
  }, "fetch RSS feeds")
}

export async function updateFeedLastFetched(feedId: string) {
  return wrapDatabaseOperation(async () => {
    return await prisma.rssFeed.update({
      where: { id: feedId },
      data: {
        lastFetched: new Date()
      }
    })
  }, "update feed last fetched")
}

export async function deleteRssFeed(feedId: string) {
  return wrapDatabaseOperation(async () => {
    await prisma.$runCommandRaw({
      update: "RssArticle",
      updates: [
        {
          q: { sourceFeedIds: feedId },
          u: { $pull: { sourceFeedIds: feedId }},
          multi: true
        }
      ]
    })

    await prisma.rssFeed.delete({
      where: { id: feedId }
    })

    return { success: true }
  }, "delete RSS feed")
}