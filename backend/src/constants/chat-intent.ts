export const CHAT_INTENTS = ['job_search', 'job_explanation', 'cv_review', 'policy_qa', 'unsupported'] as const

export type ChatIntent = (typeof CHAT_INTENTS)[number]
