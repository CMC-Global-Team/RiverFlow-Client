import apiClient from '@/lib/apiClient'
import type { MindmapResponse } from '@/types/mindmap.types'

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

// ===== Thinking Mode Types =====

export interface ThinkingModeRequest {
  topic: string
  language?: string
  structureType?: 'mindmap' | 'logic' | 'brace' | 'org' | 'tree' | 'timeline' | 'fishbone' | string
  levels?: number
  firstLevelCount?: number
  tags?: string[]
  mode?: 'normal' | 'thinking' | 'max' | string
}

export interface Otmz {
  meta?: any
  promptAnalysis?: any
  propertiesDesign?: any
  optimizedContent?: any
  [k: string]: any
}

export interface ActionList {
  actions: any[]
  [k: string]: any
}

function idempotencyHeader(id?: string) {
  const key = id || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`)
  return { 'Idempotency-Key': key }
}

// ===== API calls =====

export async function generateAIMindmap(body: GenerateMindmapBody, opts?: { idempotencyKey?: string }): Promise<AIMindmapV1> {
  try {
    const res = await apiClient.post<AIMindmapV1>(
      '/ai/mindmaps/generate',
      body,
      {
        headers: {
          Accept: 'application/json',
          ...idempotencyHeader(opts?.idempotencyKey),
        },
      }
    )
    return res.data
  } catch (err: any) {
    // Fallback for legacy route if new route not found
    if (err?.response?.status === 404) {
      const res2 = await apiClient.post<AIMindmapV1>(
        '/mindmaps/ai/generate',
        body,
        {
          headers: {
            Accept: 'application/json',
            ...idempotencyHeader(opts?.idempotencyKey),
          },
        }
      )
      return res2.data
    }
    throw err
  }
}

export async function updateAIMindmap(body: UpdateMindmapBody, opts?: { idempotencyKey?: string }): Promise<AIMindmapV1> {
  const res = await apiClient.post<AIMindmapV1>(
    '/ai/mindmaps/update',
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
    '/ai/mindmaps/validate',
    body,
    {
      headers: { Accept: 'application/json' },
    }
  )
  return res.data
}

export async function getAIModels(): Promise<AIModelInfo> {
  const res = await apiClient.get<AIModelInfo>('/ai/models', { headers: { Accept: 'application/json' } })
  return res.data
}

export async function getAIHealth(): Promise<AIHealthInfo> {
  const res = await apiClient.get<AIHealthInfo>('/ai/health', { headers: { Accept: 'application/json' } })
  return res.data
}

// Optional SSE stream helper (browser only)
export function openGenerateStream(onData: (chunk: any) => void, onEnd?: () => void, onError?: (e: any) => void) {
  if (typeof window === 'undefined') return null
  // Build absolute URL for EventSource
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
  const url = `${base}/ai/mindmaps/generate/stream`
  const es = new EventSource(url, { withCredentials: true })
  es.onmessage = (ev) => {
    try { onData(JSON.parse(ev.data)) } catch { /* ignore parse errors */ }
  }
  es.onerror = (e) => { onError?.(e); es.close() }
  es.onopen = () => { /* connected */ }
  ;(es as any).onend = () => { onEnd?.(); es.close() }
  return es
}

export async function generateMindmapProject(payload: { topic: string; mode?: string; language?: string; levels?: number; firstLevelCount?: number; tags?: string[] }): Promise<MindmapResponse> {
  const res = await apiClient.post<MindmapResponse>('/mindmaps/ai/generate', payload, { headers: { Accept: 'application/json' } })
  return res.data
}

// ===== Thinking Mode API calls =====

// POST /api/ai/thinking/otmz
export async function createThinkingOtmz(body: ThinkingModeRequest): Promise<Otmz> {
  const res = await apiClient.post<Otmz>('/ai/thinking/otmz', body, {
    headers: {
      Accept: 'application/json',
    },
  })
  return res.data
}

// GET /api/ai/thinking/otmz/prompt
// Trả về payload prompt (systemInstruction, contents, generationConfig) để debug, không gọi AI
export async function getThinkingPrompt(query: ThinkingModeRequest): Promise<any> {
  const res = await apiClient.get<any>('/ai/thinking/otmz/prompt', {
    headers: {
      Accept: 'application/json',
    },
    params: query,
  })
  return res.data
}

// POST /api/ai/thinking/actions
// Body: Otmz, Query: language?
export async function getThinkingActions(otmz: Otmz, language?: string): Promise<ActionList> {
  const res = await apiClient.post<ActionList>('/ai/thinking/actions', otmz, {
    headers: {
      Accept: 'application/json',
    },
    params: language ? { language } : undefined,
  })
  return res.data
}

