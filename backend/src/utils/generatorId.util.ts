import { customAlphabet } from 'nanoid'
export const generateUsername = () => {
  const nanoidNumbers = customAlphabet('0123456789', 10)
  return nanoidNumbers()
}
