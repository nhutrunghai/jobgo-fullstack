import { ObjectId } from 'mongodb'
import { SystemSettingKey } from '~/constants/enum.js'

type SystemSettingConstructor = {
  _id?: ObjectId
  key: SystemSettingKey | string
  value: Record<string, unknown>
  updated_by?: ObjectId
  created_at?: Date
  updated_at?: Date
}

export default class SystemSetting {
  _id?: ObjectId
  key: SystemSettingKey | string
  value: Record<string, unknown>
  updated_by?: ObjectId
  created_at: Date
  updated_at: Date

  constructor(setting: SystemSettingConstructor) {
    const now = new Date()

    this._id = setting._id
    this.key = setting.key
    this.value = setting.value
    this.updated_by = setting.updated_by
    this.created_at = setting.created_at || now
    this.updated_at = setting.updated_at || now
  }
}
