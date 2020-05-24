import { defaultLogger } from 'shared/logger'
import { queryGraph } from './queryGraph'

export async function fetchOwner(name: string) {
  const query = `
    query GetOwner($name: String!) {
      nfts(first: 1, where: { searchText: $name }) {
        owner{
          address
        }
      }
    }`
  const variables = { name: name.toLowerCase() }
  try {
    const resp = await queryGraph(query, variables)
    return resp.data.nfts.length === 1 ? (resp.data.nfts[0].owner.address as string) : null
  } catch (error) {
    defaultLogger.error(`Error querying graph`, error)
    throw error
  }
}
