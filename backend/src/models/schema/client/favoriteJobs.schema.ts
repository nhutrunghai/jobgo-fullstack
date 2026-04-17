import { ObjectId } from 'mongodb'

interface FavoriteJobType {
  _id?: ObjectId
  user_id: ObjectId
  job_id: ObjectId
  created_at?: Date
}

export default class FavoriteJob {
  _id?: ObjectId
  user_id: ObjectId
  job_id: ObjectId
  created_at: Date

  constructor(favoriteJob: FavoriteJobType) {
    const date = new Date()

    this._id = favoriteJob._id
    this.user_id = favoriteJob.user_id
    this.job_id = favoriteJob.job_id
    this.created_at = favoriteJob.created_at || date
  }
}
