import type { BlogPost } from './blog'

/** Eight editorial fields; SEO overrides can stay with the existing SEO workflow. */
export type ComparisonTemplateFields = {
  quickAnswer: string
  leftName: string
  leftChooseIf: string
  leftGuideUrl?: string
  rightName: string
  rightChooseIf: string
  rightGuideUrl?: string
  finalVerdict: string
}

export type ComparisonTemplateContent = {
  post: BlogPost
  fields: ComparisonTemplateFields
}
