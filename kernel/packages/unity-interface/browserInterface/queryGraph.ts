export async function queryGraph(query: string, variables: any) {
  const url = 'https://api.thegraph.com/subgraphs/name/decentraland/marketplace'
  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }
  const res = await fetch(url, opts)
  return res.json()
}
