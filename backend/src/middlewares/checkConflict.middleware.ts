import { Collection } from 'mongodb'
import { Request } from 'express'
export const checkConflict = (collection: Collection, field: string) => {
  return async (req: Request) => {
    const value = req.body[field]
    const isConflict = await collection.findOne({ [field]: value })
    if (isConflict) {
      return true
    }
    return false
  }
}
