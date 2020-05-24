import { getServerConfigurations } from '../../config'
export function toSocialId(userId: string) {
  return `@${userId.toLowerCase()}:${getServerConfigurations().synapseUrl}`
}
