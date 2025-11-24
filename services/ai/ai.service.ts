import apiClient from '@/lib/apiClient'

// ===== Types =====
export type DetailLevel = 'brief' | 'normal' | 'deep'

export interface GenerateMindmapBody {
  topic: string
  goalOrContext?: string
  audience?: string
  detailLevel?: DetailLevel
  lang?: string
  maxNodes?: number
  maxDepth?: number
  includeSources?: boolean
  nowIso?: string
}

export interface UpdateMindmapBody {
  currentMindmap: AIMindmapV1
  changeRequests: string
  constraints?: {
    lang?: string
    maxNodes?: number
    maxDepth?: number
    includeSources?: boolean
  }
}

export interface ValidateMindmapBody {
  mindmap: AIMindmapV1
}

export interface AIModelInfo {
  provider: string
  model: string
  supportsJsonMode?: boolean
}

export interface AIHealthInfo {
  status: 'UP' | 'DOWN'
  provider?: string
  model?: string
  message?: string
}

export interface AIErrorResponse {
  error: {
    code: string
    message: string
    hints?: string[]
  }
}

// Minimal mindmap.v1 shape (keep flexible to avoid compile-time coupling)
export interface AIMindmapV1 {
  version: string
  generatedAt: string
  topic: string
  lang: string
  rootId: string
  nodes: any[]
  // Optional fields backend may include
  edges?: any[]
  [k: string]: any
}

function idempotencyHeader(id?: string) {
  const key = id || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`)
  return { 'Idempotency-Key': key }
}

// ===== API calls =====

export async function generateAIMindmap(body: GenerateMindmapBody, opts?: { idempotencyKey?: string }): Promise<AIMindmapV1> {
  const res = await apiClient.post<AIMindmapV1>(
    '/api/ai/mindmaps/generate',
    body,
    {
      headers: {
        Accept: 'application/json',
        ...idempotencyHeader(opts?.idempotencyKey),
      },
    }
  )
  return res.data
}

export async function updateAIMindmap(body: UpdateMindmapBody, opts?: { idempotencyKey?: string }): Promise<AIMindmapV1> {
  const res = await apiClient.post<AIMindmapV1>(
    '/api/ai/mindmaps/update',
    body,
    {
      headers: {
        Accept: 'application/json',
        ...idempotencyHeader(opts?.idempotencyKey),
      },
    }
  )
  return res.data
}

export async function validateAIMindmap(body: ValidateMindmapBody): Promise<{ valid: boolean; errors?: Array<{ path: string; code: string; message: string }> }> {
  const res = await apiClient.post<{ valid: boolean; errors?: Array<{ path: string; code: string; message: string }> }>(
    '/api/ai/mindmaps/validate',
    body,
    {
      headers: { Accept: 'application/json' },
    }
  )
  return res.data
}

export async function getAIModels(): Promise<AIModelInfo> {
  const res = await apiClient.get<AIModelInfo>('/api/ai/models', { headers: { Accept: 'application/json' } })
  return res.data
}

export async function getAIHealth(): Promise<AIHealthInfo> {
  const res = await apiClient.get<AIHealthInfo>('/api/ai/health', { headers: { Accept: 'application/json' } })
  return res.data
}

// Optional SSE stream helper (browser only)
export function openGenerateStream(onData: (chunk: any) => void, onEnd?: () => void, onError?: (e: any) => void) {
  if (typeof window === 'undefined') return null
  // Build absolute URL for EventSource
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
  const url = `${base}/api/ai/mindmaps/generate/stream`
  const es = new EventSource(url, { withCredentials: true })
  es.onmessage = (ev) => {
    try { onData(JSON.parse(ev.data)) } catch { /* ignore parse errors */ }
  }
  es.onerror = (e) => { onError?.(e); es.close() }
  es.onopen = () => { /* connected */ }
  ;(es as any).onend = () => { onEnd?.(); es.close() }
  return es
}

