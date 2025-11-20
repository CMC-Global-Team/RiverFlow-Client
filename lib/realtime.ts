import { io, Socket } from 'socket.io-client'

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL as string

let socket: Socket | null = null

export function getSocket() {
  if (!socket) {
    socket = io(`${REALTIME_URL}/realtime`, {
      path: '/socket.io/',
      transports: ['polling'],
      withCredentials: false,
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

export function emitCursorMove(socket: Socket, room: string, cursor: { x: number; y: number }) {
  socket.emit('cursor:move', room, { clientId: socket.id, cursor })
}

export function emitPresenceAnnounce(
  socket: Socket,
  room: string,
  info: { name: string; color: string; userId?: number | string | null }
) {
  socket.emit('presence:announce', room, info)
}

export function emitPresenceActive(
  socket: Socket,
  room: string,
  active: { type: 'node' | 'edge' | 'label' | 'pane'; id?: string }
) {
  socket.emit('presence:active', room, active)
}

export function emitPresenceClear(socket: Socket, room: string) {
  socket.emit('presence:clear', room)
}

