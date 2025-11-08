import { getArticlesByFeedsAndDateRange } from "@/actions/rss-article"
import { fetchAndStoreFeed } from "@/actions/rss-fetch"
import { prisma } from "@/lib/prisma"
import type { PrepareFeedsParams }  from "./types"

export const CACHE_WINDOW = 3 * 60 * 60 * 1000
export const ARTICLE_LIMIT = 100

export async function getFeedsToRefresh(feedIds: string[]): Promise<string[]> {
  const now = new Date()
  const cacheThreshold = new Date(now.getTime() - CACHE_WINDOW)

  const feeds = await prisma.rssFeed.findMany({
    where: {
      id: { in: feedIds }
    },
    select: {
      id: true,
      url: true
    }
  })

  const urlsToCheck = [...new Set((feeds.map(f => f.url)))]

  const recentFetches = await prisma.rssFeed.groupBy({
    by: ["url"],
    where: {
      url: { in: urlsToCheck },
      lastFetched: {
        gte: cacheThreshold
      }
    },
    _max: {
      lastFetched: true
    }
  })

  const recentlyFetchedUrls = new Set(
    recentFetches
      .filter(fetch => fetch._max.lastFetched !== null)
      .map(fetch => fetch.url)
  )

  const feedsToRefresh = feeds
    .filter(feed => !recentlyFetchedUrls.has(feed.url))
    .map(feed => feed.id)

    return feedsToRefresh
}

export async function prepareFeedsAndArticles(params: PrepareFeedsParams) {
  const feedsToRefresh = await getFeedsToRefresh(params.feedIds)

  if (feedsToRefresh.length > 0) {
    console.log(`Refreshing ${feedsToRefresh.length} stale feeds (out of ${params.feedIds.length} total)...`)

    const refreshResults = await Promise.allSettled(
      feedsToRefresh.map(feedId => fetchAndStoreFeed(feedId))
    )

    const successful = refreshResults.filter(
      r => r.status === "fulfilled"
    ).length
    const failed = refreshResults.filter(r => r.status === "rejected").length
    console.log(`Feed refresh complete: ${successful} successful, ${failed} failed`)
  } else {
    console.log(`All ${params.feedIds.length} feeds are fresh (<3 hours old), skipping refresh`)
  }

  const articles = await getArticlesByFeedsAndDateRange(
    params.feedIds,
    params.startDate,
    params.endDate,
    ARTICLE_LIMIT
  )

  if (articles.length === 0) {
    throw new Error("No articles found for the selected feeds and date range")
  }

  return articles
}