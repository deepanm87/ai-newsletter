import type { UserSettings } from "@prisma/client"

export interface ArticleForPrompt {
  title: string
  feed: { title: string | null }
  pubDate: Date
  summary?: string | null
  content?: string | null
  link: string
}

export interface NewsletterPromptParams {
  startDate: Date
  endDate: Date
  articleSummaries: string
  articleCount: number
  userInput?: string
  settings?: UserSettings | null
}