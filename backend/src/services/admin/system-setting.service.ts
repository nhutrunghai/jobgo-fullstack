import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import env from '~/configs/env.config.js'
import { SystemSettingKey } from '~/constants/enum.js'
import {
  decryptSystemSecret,
  EncryptedSystemSecret,
  encryptSystemSecret,
  maskSecret
} from '~/utils/systemSettingsSecret.util.js'

export type LlmProvider = 'gemini' | 'openai'

export type RagChatRuntimeConfig = {
  enabled: boolean
  provider: LlmProvider
  intent_model: string
  chat_model: string
  cv_visual_review_model: string
  job_search_top_k: number
  job_explanation_top_k: number
  cv_review_top_k: number
  answer_context_limit: number
  allow_cv_review: boolean
  allow_policy_qa: boolean
  maintenance_message: string | null
}

export type SePayRuntimeConfig = {
  bank_account_id: string | null
  bank_short_name: string
  bank_account_number: string | null
  bank_account_holder_name: string | null
}

type RagChatSecretKey = 'openai_api_key' | 'gemini_api_key'
type SePaySecretKey = 'api_token' | 'webhook_secret'
type SettingWithSecrets = {
  value?: Record<string, unknown>
  secrets?: Record<string, EncryptedSystemSecret>
}

class AdminSystemSettingService {
  getDefaultRagChatConfig(): RagChatRuntimeConfig {
    return {
      enabled: true,
      provider: env.LLM_PROVIDER,
      intent_model: env.LLM_MODEL_INTENT,
      chat_model: env.LLM_MODEL_CHAT,
      cv_visual_review_model: env.OPENAI_MODEL_CV_VISUAL_REVIEW,
      job_search_top_k: 5,
      job_explanation_top_k: 5,
      cv_review_top_k: 6,
      answer_context_limit: 3,
      allow_cv_review: true,
      allow_policy_qa: false,
      maintenance_message: null
    }
  }

  getDefaultSePayConfig(): SePayRuntimeConfig {
    return {
      bank_account_id: env.SEPAY_BANK_ACCOUNT_ID || null,
      bank_short_name: env.SEPAY_BANK_SHORT_NAME,
      bank_account_number: env.SEPAY_BANK_ACCOUNT_NUMBER || null,
      bank_account_holder_name: env.SEPAY_BANK_ACCOUNT_HOLDER_NAME || null
    }
  }

  async getRagChatConfig() {
    const setting = await databaseService.systemSettings.findOne({
      key: SystemSettingKey.RAG_CHAT
    })

    return {
      ...this.getDefaultRagChatConfig(),
      ...this.withoutSecrets(setting?.value || {})
    } as RagChatRuntimeConfig
  }

  async updateRagChatConfig(value: Partial<RagChatRuntimeConfig>, adminId?: ObjectId) {
    return this.upsertSetting(SystemSettingKey.RAG_CHAT, value, adminId)
  }

  async rotateRagChatSecrets(value: Partial<Record<RagChatSecretKey, string>>, adminId?: ObjectId) {
    return this.rotateSecrets(SystemSettingKey.RAG_CHAT, value, adminId)
  }

  async getRagChatSecretStatus() {
    const setting = (await databaseService.systemSettings.findOne({
      key: SystemSettingKey.RAG_CHAT
    })) as SettingWithSecrets | null

    return {
      openai_api_key_configured: Boolean(setting?.secrets?.openai_api_key || env.OPENAI_API_KEY),
      openai_api_key_source: setting?.secrets?.openai_api_key ? 'database' : env.OPENAI_API_KEY ? 'env' : null,
      openai_api_key_preview: setting?.secrets?.openai_api_key?.preview || maskSecret(env.OPENAI_API_KEY),
      gemini_api_key_configured: Boolean(setting?.secrets?.gemini_api_key || env.GEMINI_API_KEY),
      gemini_api_key_source: setting?.secrets?.gemini_api_key ? 'database' : env.GEMINI_API_KEY ? 'env' : null,
      gemini_api_key_preview: setting?.secrets?.gemini_api_key?.preview || maskSecret(env.GEMINI_API_KEY)
    }
  }

  async getOpenAiApiKey() {
    const setting = (await databaseService.systemSettings.findOne({
      key: SystemSettingKey.RAG_CHAT
    })) as SettingWithSecrets | null

    return decryptSystemSecret(setting?.secrets?.openai_api_key) || env.OPENAI_API_KEY
  }

  async getGeminiApiKey() {
    const setting = (await databaseService.systemSettings.findOne({
      key: SystemSettingKey.RAG_CHAT
    })) as SettingWithSecrets | null

    return decryptSystemSecret(setting?.secrets?.gemini_api_key) || env.GEMINI_API_KEY
  }

  async getSePayConfig() {
    const setting = await databaseService.systemSettings.findOne({
      key: SystemSettingKey.SEPAY
    })

    return {
      ...this.getDefaultSePayConfig(),
      ...this.withoutSecrets(setting?.value || {})
    } as SePayRuntimeConfig
  }

  async updateSePayConfig(value: Partial<SePayRuntimeConfig>, adminId?: ObjectId) {
    return this.upsertSetting(SystemSettingKey.SEPAY, value, adminId)
  }

  async rotateSePaySecrets(value: Partial<Record<SePaySecretKey, string>>, adminId?: ObjectId) {
    return this.rotateSecrets(SystemSettingKey.SEPAY, value, adminId)
  }

  async getSePaySecretStatus() {
    const setting = (await databaseService.systemSettings.findOne({
      key: SystemSettingKey.SEPAY
    })) as SettingWithSecrets | null

    return {
      api_token_configured: Boolean(setting?.secrets?.api_token || env.SEPAY_API_TOKEN),
      api_token_source: setting?.secrets?.api_token ? 'database' : env.SEPAY_API_TOKEN ? 'env' : null,
      api_token_preview: setting?.secrets?.api_token?.preview || maskSecret(env.SEPAY_API_TOKEN),
      webhook_secret_configured: Boolean(setting?.secrets?.webhook_secret || env.SEPAY_WEBHOOK_SECRET),
      webhook_secret_source: setting?.secrets?.webhook_secret ? 'database' : env.SEPAY_WEBHOOK_SECRET ? 'env' : null,
      webhook_secret_preview: setting?.secrets?.webhook_secret?.preview || maskSecret(env.SEPAY_WEBHOOK_SECRET)
    }
  }

  async getSePayApiToken() {
    const setting = (await databaseService.systemSettings.findOne({
      key: SystemSettingKey.SEPAY
    })) as SettingWithSecrets | null

    return decryptSystemSecret(setting?.secrets?.api_token) || env.SEPAY_API_TOKEN
  }

  async getSePayWebhookSecret() {
    const setting = (await databaseService.systemSettings.findOne({
      key: SystemSettingKey.SEPAY
    })) as SettingWithSecrets | null

    return decryptSystemSecret(setting?.secrets?.webhook_secret) || env.SEPAY_WEBHOOK_SECRET
  }

  private async upsertSetting(key: SystemSettingKey, value: Record<string, unknown>, adminId?: ObjectId) {
    const existing = await databaseService.systemSettings.findOne({ key })
    const now = new Date()

    return databaseService.systemSettings.findOneAndUpdate(
      { key },
      {
        $set: {
          value: {
            ...(existing?.value || {}),
            ...value
          },
          updated_by: adminId,
          updated_at: now
        },
        $setOnInsert: {
          key,
          created_at: now
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
  }

  private async rotateSecrets(
    key: SystemSettingKey,
    value: Partial<Record<RagChatSecretKey | SePaySecretKey, string>>,
    adminId?: ObjectId
  ) {
    const encryptedSecrets = Object.entries(value).reduce<Record<string, EncryptedSystemSecret>>(
      (result, [secretKey, secretValue]) => {
        if (typeof secretValue === 'string' && secretValue.trim()) {
          result[secretKey] = encryptSystemSecret(secretValue.trim())
        }

        return result
      },
      {}
    )

    const existing = await databaseService.systemSettings.findOne({ key })
    const now = new Date()

    return databaseService.systemSettings.findOneAndUpdate(
      { key },
      {
        $set: {
          secrets: {
            ...((existing as SettingWithSecrets | null)?.secrets || {}),
            ...encryptedSecrets
          },
          updated_by: adminId,
          updated_at: now
        },
        $setOnInsert: {
          key,
          value: existing?.value || {},
          created_at: now
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
  }

  private withoutSecrets(value: Record<string, unknown>) {
    const { secrets, ...safeValue } = value
    return safeValue
  }
}

const adminSystemSettingService = new AdminSystemSettingService()

export default adminSystemSettingService
