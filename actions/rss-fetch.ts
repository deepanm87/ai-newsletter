"use server"

import { wrapDatabaseOperation } from "@/lib/database/error-handler"
import { prisma } from "@/lib/prisma"
import {
  type ArticleData,
  fetchAndParseFeed,
  validateFeedUrl
} from "@/lib/rss/parser"
import { bulkCreateRssArticles } from "./rss-article"
import { updateFeedLastFetched } from "./rss-feed"

export async function validateAndAddFeed(userId: string, url: string) {
  return wrapDatabaseOperation(async () => {
    const isValid = await validateFeedUrl(url)
    if (!isValid) {
      throw new Error("Invalid RSS feed URL or unable to fetch feed")
    }

    const feed = await prisma.rssFeed.create({
      data: {
        userId,
        url
      }
    })

    try {
      const result = await fetchAndStoreFeed(feed.id)

      await prisma.rssFeed.update({
        where: { id: feed.id },
        data: {
          title: result.metadata.title,
          description: result.metadata.description,
          link: result.metadata.link,
          imageUrl: result.metadata.imageUrl,
          language: result.metadata.language
        }
      })

      return {
        feed,
        articlesCreated: result.created,
        articlesSkipped: result.skipped
      }
    } catch (fetchError) {
      console.error(`Failed to fetch initial articles: ${fetchError}`)
      return {
        feed,
        articlesCreated: 0,
        articlesSkipped: 0,
        error: "Feed created but initial fetch failed"
      }
    }
  }, "add RSS feed")
}

export async function fetchAndStoreFeed(feedId: string) {
  return wrapDatabaseOperation(async () => {
    const feed = await prisma.rssFeed.findUnique({
      where: { id: feedId }
    })

    if (!feed) {
      throw new Error(`Feed with ID ${feedId} not found`)
    }

    const { metadata, articles } = await fetchAndParseFeed(feed.url, feedId)

    const articlesToCreate = articles.map((article: ArticleData) => ({
      feedId: feed.id,
      guid: article.guid,
      title: article.title,
      link: article.link,
      content: article.content,
      summary: article.summary,
      pubDate: new Date(article.pubDate),
      author: article.author,
      categories: article.categories,
      imageUrl: article.imageUrl
    }))

    const result = await bulkCreateRssArticles(articlesToCreate)

    await updateFeedLastFetched(feedId)

    return {
      metadata,
      created: result.created,
      skipped: result.skipped,
      errors: result.errors
    }
  }, "fetch feed")
}
