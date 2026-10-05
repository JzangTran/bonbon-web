import { useEffect, useRef, useState } from 'react'
import { env } from '@/shared/config/env'

export type OrderEvent = {
  type: 'order'
  channel: 'customer' | 'shop'
  orderId: string
  number: number
  from: string | null
  to: string
}

export type SocketState = 'connecting' | 'live' | 'offline'

function socketUrl(): string {
  if (env.apiUrl) return env.apiUrl.replace(/^http/, 'ws') + '/ws/orders'
  return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/orders`
}

/**
 * Live order updates (track-order.md): connects, authenticates with the access token in the first message, and
 * reconnects with a growing pause. The event is only a hint; the caller re-fetches. While the state is not
 * {@code live} the caller should poll, so a dropped connection never leaves a screen stale.
 */
export function useOrderSocket(accessToken: string | null, onEvent: (event: OrderEvent) => void): SocketState {
  const [state, setState] = useState<SocketState>('connecting')
  const handler = useRef(onEvent)
  useEffect(() => {
    handler.current = onEvent
  })

  useEffect(() => {
    if (!accessToken) return
    let socket: WebSocket | null = null
    let retry: ReturnType<typeof setTimeout> | undefined
    let attempt = 0
    let stopped = false

    const connect = () => {
      socket = new WebSocket(socketUrl())
      socket.onopen = () => socket?.send(JSON.stringify({ type: 'auth', token: accessToken }))
      socket.onmessage = (message) => {
        try {
          const body = JSON.parse(String(message.data)) as { type?: string }
          if (body.type === 'ready') {
            attempt = 0
            setState('live')
          } else if (body.type === 'order') {
            handler.current(body as OrderEvent)
          }
        } catch {
          // A malformed message is ignored: the next fetch tells the truth anyway.
        }
      }
      socket.onclose = () => {
        if (stopped) return
        setState('offline')
        attempt += 1
        retry = setTimeout(connect, Math.min(15_000, 1_000 * 2 ** Math.min(attempt, 4)))
      }
    }
    connect()

    return () => {
      stopped = true
      clearTimeout(retry)
      socket?.close()
    }
  }, [accessToken])

  return state
}
