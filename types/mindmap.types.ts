/**
 * Types for Mindmap API
 */

// Viewport settings for ReactFlow
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// Mindmap canvas settings
export interface MindmapSettings {
  fitView?: boolean;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  elementsSelectable?: boolean;
  panOnDrag?: boolean;
  panOnScroll?: boolean;
  zoomOnScroll?: boolean;
  zoomOnPinch?: boolean;
  zoomOnDoubleClick?: boolean;
  defaultEdgeOptions?: Record<string, any>;
  connectionMode?: 'strict' | 'loose';
}

// Collaborator info
export interface Collaborator {
  mysqlUserId?: number;
  email?: string;
  role: "EDITOR" | "VIEWER" | "owner";
  addedAt?: string;
  invitedAt?: string;
  acceptedAt?: string;
  status?: "pending" | "accepted" | "rejected" | "removed";
  invitedBy?: string;
}

// Mindmap metadata
export interface MindmapMetadata {
  viewCount?: number;
  lastViewedAt?: string;
  totalEdits?: number;
  [key: string]: any;
}

// Full mindmap response
export interface MindmapResponse {
  id: string;
  mysqlUserId: number;
  title: string;
  description?: string;
  thumbnail?: string;
  nodes: any[];
  edges: any[];
  viewport?: Viewport;
  settings?: MindmapSettings;
  isPublic: boolean;
  publicAccessLevel?: "view" | "edit" | "private";
  shareToken?: string;
  collaborators: Collaborator[];
  tags?: string[];
  category?: string;
  isFavorite: boolean;
  isTemplate: boolean;
  status: string;
  aiGenerated: boolean;
  aiWorkflowId?: number;
  aiMetadata?: Record<string, any>;
  metadata?: MindmapMetadata;
  createdAt: string;
  updatedAt: string;
  canUndo: boolean;
  canRedo: boolean;
}

// Mindmap summary (for list views)
export interface MindmapSummary {
  id: string;
  mysqlUserId: number;
  title: string;
  description?: string;
  thumbnail?: string;
  nodeCount: number;
  edgeCount: number;
  tags?: string[];
  category?: string;
  isFavorite: boolean;
  isTemplate: boolean;
  isPublic: boolean;
  status: string;
  aiGenerated: boolean;
  aiWorkflowId?: number;
  createdAt: string;
  updatedAt: string;
}

// Create mindmap request
export interface CreateMindmapRequest {
  title: string;
  description?: string;
  thumbnail?: string;
  nodes?: any[];
  edges?: any[];
  viewport?: Viewport;
  settings?: MindmapSettings;
  tags?: string[];
  category?: string;
  isPublic?: boolean;
  publicAccessLevel?: "view" | "edit" | "private";
  isFavorite?: boolean;
  isTemplate?: boolean;
  aiGenerated?: boolean;
  aiWorkflowId?: number;
  aiMetadata?: Record<string, any>;
}

// Update mindmap request
export interface UpdateMindmapRequest {
  title?: string;
  description?: string;
  thumbnail?: string;
  nodes?: any[];
  edges?: any[];
  viewport?: Viewport;
  settings?: MindmapSettings;
  tags?: string[];
  category?: string;
  isPublic?: boolean;
  publicAccessLevel?: "view" | "edit" | "private";
  isFavorite?: boolean;
  isTemplate?: boolean;
  status?: string;
  aiMetadata?: Record<string, any>;
}

export interface MessageResponse {
  message: string;
}

