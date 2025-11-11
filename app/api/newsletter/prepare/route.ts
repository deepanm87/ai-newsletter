import type { NextRequest } from "next/server"
import { getArticlesByFeedsAndDateRange } from "@/actions/rss-article"
import { getCurrentUser } from "@/lib/auth/helpers"
import { getFeedsToRefresh } from "@/lib/rss/feed-refresh"

export const maxDuration = 40

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { feedIds, startDate, endDate } = body
    
    if (!feedIds || !Array.isArray(feedIds) || feedIds.length === 0) {
      return Response.json(
        { error: "feedIds is required and must be a non-empty error" },
        { status: 400 }
      )
    }

    if (!startDate || !endDate) {
      return Response.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      )
    }

    await getCurrentUser()

    const feedsToRefresh = await getFeedsToRefresh(feedIds)

    const articles = await getArticlesByFeedsAndDateRange(
      feedIds,
      new Date(startDate),
      new Date(endDate),
      100
    )

    return Response.json({
      feedsToRefresh: feedsToRefresh.length,
      articlesFound: articles.length
    })
  } catch (error) {
    console.error(`Error in prepare: ${error}`)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return Response.json(
      { error: `Failed to prepare newsletter: ${errorMessage}`},
      { status: 500 }
    )
  }
}