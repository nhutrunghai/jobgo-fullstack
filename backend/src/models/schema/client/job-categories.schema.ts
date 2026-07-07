import { ObjectId } from 'mongodb'

interface JobCategoryTypeSchema {
  _id?: ObjectId
  name: string
  slug: string
  parent_id?: ObjectId | null
  description?: string
  is_active?: boolean
  sort_order?: number
  created_at?: Date
  updated_at?: Date
}

export default class JobCategory {
  _id?: ObjectId
  name: string
  slug: string
  parent_id?: ObjectId | null
  description?: string
  is_active: boolean
  sort_order: number
  created_at?: Date
  updated_at?: Date

  constructor(category: JobCategoryTypeSchema) {
    const date = new Date()

    this._id = category._id
    this.name = category.name
    this.slug = category.slug
    this.parent_id = category.parent_id ?? null
    this.description = category.description
    this.is_active = category.is_active ?? true
    this.sort_order = category.sort_order ?? 0
    this.created_at = category.created_at || date
    this.updated_at = category.updated_at || date
  }
}
