import SWR, { SWRConfiguration } from "swr"
import { Block, BlocksResponse, Transaction, transactionResponse } from "../../../common/dist";

export class HttpError extends Error {
  constructor(message?: string, public readonly status?: number) {
    super(message)
  }
}

export function _fetch<T>(path: string, options?: RequestInit) {
  return fetch(path, {
    ...options,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Referrer-Policy': 'no-referrer',
      ...options?.headers,
    },
  }).then<T>(async res => {
    if (res.status === 429) {
        console.error("Rate limited !!!!")
    }
    if (!res.ok) {
      const badResponse = await res.json()
      console.error(badResponse)
      throw new HttpError(badResponse?.message || "Something went wrong.", res.status)
    }

    try {
        const response = await res.text()
        return JSON.parse(response)
    } catch (e) {
      console.error(e)
      throw new HttpError("Failed to parse the received response", res.status)
    }
  })
}

// Local API Server calling endpoint
const API_BASE_URL = "http://localhost:8080"

export function useSWR<T>(
  path: string | null,
  params: Record<string, string> = {},
  swrOptions?: SWRConfiguration
) {
  const url = new URL(`${path ?? ""}`, API_BASE_URL)
  // setting search params which value is NOT undefined
  Object.keys(params).forEach(
    key => params[key] !== undefined && url.searchParams.set(key, params[key])
  )

  // If path is null, then pass directly to SWR, without making url
  const href = path == null ? null : url.href
  return SWR<T>(href, _fetch, {
    onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
      if (error.status === 500) return
      if (retryCount >= 3) return
      setTimeout(() => revalidate({ retryCount }), 1500)
    },
    ...swrOptions,
  })
}

const API = {
  useBlocks: (params: { ps: string, p: string }) => useSWR<BlocksResponse>("/blocks", params),
  useBlock: (block?: string) => useSWR<Block>(block ? `/block/${block}` : null, {}),
  useBlockHash: (blockHash?: string) => useSWR<Block>(blockHash ? `/block_hash/${blockHash}` : null, {}),
  useTransactions: (params: { ps: string, p: string }) => useSWR<transactionResponse>("/transactions", params),
  useTransaction: (transactionHash?: string) => useSWR<Transaction>(transactionHash ? `/transaction/${transactionHash}` : null, {}),
}

export default API
