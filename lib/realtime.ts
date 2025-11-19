import { io, Socket } from 'socket.io-client'

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL as string

let socket: Socket | null = null

export function getSocket() {
  if (!socket) {
    socket = io(`${REALTIME_URL}/realtime`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || '') : ''
      }
    })
  }
  return socket
}

export function joinMindmap(socket: Socket, payload: { mindmapId?: string; shareToken?: string }) {
  socket.emit('mindmap:join', payload)
}

export function emitNodesChange(socket: Socket, room: string, changes: any[]) {
  socket.emit('mindmap:nodes:change', room, changes)
}

export function emitEdgesChange(socket: Socket, room: string, changes: any[]) {
  socket.emit('mindmap:edges:change', room, changes)
}

export function emitConnect(socket: Socket, room: string, connection: any) {
  socket.emit('mindmap:connect', room, connection)
}

export function emitViewport(socket: Socket, room: string, viewport: any) {
  socket.emit('mindmap:viewport', room, viewport)
}

