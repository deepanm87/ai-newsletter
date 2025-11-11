"use server"

import { openai } from "@ai-sdk/openai"
import { streamObject } from "ai"
import { z } from "zod"
import { checkIsProUser, getCurrentUser } from "@/lib/auth/helpers"
import {
  buildArticleSummaries,
  buildNewsletterPrompt
} from "@/lib/newsletter/prompt-builder"
import { prepareFeedsAndArticles } from "@/lib/rss/feed-refresh"
import { createNewsletter } from "./newsletter"
import { getUserSettingsByUserId } from "./user-settings"

const NewsletterSchema = z.object({
  suggestedTitles: z.array(z.string()).length(5),
  suggestedSubjectLines: z.array(z.string()).length(5),
  body: z.string(),
  topAnnouncements: z.array(z.string()).length(5),
  additionalInfo: z.string().optional()
})

export type GeneratedNewsletter = z.infer<typeof NewsletterSchema>

export async function generateNewsletterStream(params: {
  feedIds: string[]
  startDate: Date
  endDate: Date
  userInput?: string
}) {
  const user = await getCurrentUser()
  const settings = await getUserSettingsByUserId(user.id)
  const articles = await prepareFeedsAndArticles(params)

  const articleSummaries = buildArticleSummaries(articles)
  const prompt = buildNewsletterPrompt({
    startDate: params.startDate,
    endDate: params.endDate,
    articleSummaries,
    articleCount: articles.length,
    userInput: params.userInput,
    settings
  })

  const { partialObjectStream } = await streamObject({
    model: openai("gpt-4o"),
    schema: NewsletterSchema,
    prompt
  })

  return {
    stream: partialObjectStream,
    articlesAnalyzed: articles.length
  }
}

export async function saveGeneratedNewsletter(params: {
  newsletter: GeneratedNewsletter
  feedIds: string[]
  startDate: Date
  endDate: Date
  userInput?: string
}) {
  const isPro = await checkIsProUser()
  if (!isPro) {
    throw new Error("Pro plan required to save newsletters")
  }

  const user = await getCurrentUser()

  const savedNewsletter = await createNewsletter({
    userId: user.id,
    suggestedTitles: params.newsletter.suggestedTitles,
    suggestedSubjectLines: params.newsletter.suggestedSubjectLines,
    body: params.newsletter.body,
    topAnnouncements: params.newsletter.topAnnouncements,
    additionalInfo: params.newsletter.additionalInfo,
    startDate: params.startDate,
    endDate: params.endDate,
    userInput: params.userInput,
    feedsUsed: params.feedIds
  })

  return savedNewsletter
}

