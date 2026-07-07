const UPLOADTHING_PUBLIC_BASE_URL = 'https://utfs.io/f'

export const buildUploadThingFileUrl = (fileKey?: string | null) => {
  const normalizedKey = String(fileKey || '').trim()
  return normalizedKey ? `${UPLOADTHING_PUBLIC_BASE_URL}/${normalizedKey}` : ''
}

export const attachUserAvatarUrl = <T extends { avatar_file_key?: string | null; avatar?: string } | null>(user: T) => {
  if (!user) return user
  const { avatar_file_key: _avatarFileKey, ...publicUser } = user
  return {
    ...publicUser,
    avatar: buildUploadThingFileUrl(user.avatar_file_key)
  }
}
