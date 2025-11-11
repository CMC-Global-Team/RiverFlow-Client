"use client"

import { useState, useEffect } from "react"
import { X, Layout, Sparkles, FileText, Network, Workflow, Hexagon, GitBranch } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  thumbnail?: string
  initialNodes: any[]
  initialEdges: any[]
  filePath?: string
}

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

// Template metadata from public/templates folder
const templateMetadata = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with an empty mindmap",
    icon: <Layout className="h-6 w-6" />,
    filePath: null, // Built-in template
  },
  {
    id: "basic-mindmap",
    name: "Basic Mindmap",
    description: "Mindmap mẫu cơ bản với nhiều node",
    icon: <Network className="h-6 w-6" />,
    filePath: "/templates/basic-mindmap.json",
  },
  {
    id: "simple-structure",
    name: "Simple Structure",
    description: "Cấu trúc đơn giản với central node và branches",
    icon: <Network className="h-6 w-6" />,
    filePath: "/templates/simple-structure.json",
  },
  {
    id: "complex-mindmap",
    name: "Complex Mindmap",
    description: "Mindmap phức tạp với nhiều nhánh",
    icon: <Network className="h-6 w-6" />,
    filePath: "/templates/complex-mindmap.json",
  },
  {
    id: "hierarchical-structure",
    name: "Hierarchical Structure",
    description: "Cấu trúc phân cấp rõ ràng",
    icon: <GitBranch className="h-6 w-6" />,
    filePath: "/templates/hierarchical-structure.json",
  },
  {
    id: "radial-mindmap",
    name: "Radial Mindmap",
    description: "Mindmap dạng phóng xạ",
    icon: <Network className="h-6 w-6" />,
    filePath: "/templates/radial-mindmap.json",
  },
  {
    id: "brainstorming",
    name: "Brainstorming",
    description: "Lý tưởng cho các buổi brainstorming sáng tạo",
    icon: <Sparkles className="h-6 w-6" />,
    filePath: "/templates/brainstorming.json",
  },
  {
    id: "project-planning",
    name: "Project Planning",
    description: "Hoàn hảo cho lập kế hoạch dự án",
    icon: <Workflow className="h-6 w-6" />,
    filePath: "/templates/project-planning.json",
  },
  {
    id: "decision-tree",
    name: "Decision Tree",
    description: "Cây quyết định cho phân tích lựa chọn",
    icon: <GitBranch className="h-6 w-6" />,
    filePath: "/templates/decision-tree.json",
  },
  {
    id: "study-notes",
    name: "Study Notes",
    description: "Tổ chức tài liệu học tập của bạn",
    icon: <FileText className="h-6 w-6" />,
    filePath: "/templates/study-notes.json",
  },
]

const builtInTemplates: Template[] = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with an empty mindmap",
    icon: <Layout className="h-6 w-6" />,
    initialNodes: [
      {
        id: "1",
        type: "default",
        position: { x: 250, y: 250 },
        data: { label: "Central Idea" },
      },
    ],
    initialEdges: [],
  },
  {
    id: "basic",
    name: "Basic Structure",
    description: "A simple mindmap with central node and branches",
    icon: <Network className="h-6 w-6" />,
    initialNodes: [
      {
        id: "1",
        type: "default",
        position: { x: 250, y: 200 },
        data: { label: "Main Topic" },
      },
      {
        id: "2",
        type: "default",
        position: { x: 100, y: 100 },
        data: { label: "Subtopic 1" },
      },
      {
        id: "3",
        type: "default",
        position: { x: 400, y: 100 },
        data: { label: "Subtopic 2" },
      },
      {
        id: "4",
        type: "default",
        position: { x: 100, y: 300 },
        data: { label: "Subtopic 3" },
      },
      {
        id: "5",
        type: "default",
        position: { x: 400, y: 300 },
        data: { label: "Subtopic 4" },
      },
    ],
    initialEdges: [
      { id: "e1-2", source: "1", target: "2", animated: true },
      { id: "e1-3", source: "1", target: "3", animated: true },
      { id: "e1-4", source: "1", target: "4", animated: true },
      { id: "e1-5", source: "1", target: "5", animated: true },
    ],
  },
  {
    id: "brainstorm",
    name: "Brainstorming",
    description: "Ideal for creative brainstorming sessions",
    icon: <Sparkles className="h-6 w-6" />,
    initialNodes: [
      {
        id: "1",
        type: "default",
        position: { x: 250, y: 200 },
        data: { label: "Idea" },
      },
      {
        id: "2",
        type: "default",
        position: { x: 100, y: 50 },
        data: { label: "Why?" },
      },
      {
        id: "3",
        type: "default",
        position: { x: 400, y: 50 },
        data: { label: "How?" },
      },
      {
        id: "4",
        type: "default",
        position: { x: 100, y: 350 },
        data: { label: "What?" },
      },
      {
        id: "5",
        type: "default",
        position: { x: 400, y: 350 },
        data: { label: "When?" },
      },
    ],
    initialEdges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e1-3", source: "1", target: "3" },
      { id: "e1-4", source: "1", target: "4" },
      { id: "e1-5", source: "1", target: "5" },
    ],
  },
  {
    id: "workflow",
    name: "Workflow",
    description: "Perfect for process and workflow planning",
    icon: <Workflow className="h-6 w-6" />,
    initialNodes: [
      {
        id: "1",
        type: "input",
        position: { x: 250, y: 50 },
        data: { label: "Start" },
      },
      {
        id: "2",
        type: "default",
        position: { x: 250, y: 150 },
        data: { label: "Step 1" },
      },
      {
        id: "3",
        type: "default",
        position: { x: 250, y: 250 },
        data: { label: "Step 2" },
      },
      {
        id: "4",
        type: "output",
        position: { x: 250, y: 350 },
        data: { label: "End" },
      },
    ],
    initialEdges: [
      { id: "e1-2", source: "1", target: "2", animated: true },
      { id: "e2-3", source: "2", target: "3", animated: true },
      { id: "e3-4", source: "3", target: "4", animated: true },
    ],
  },
  {
    id: "notes",
    name: "Study Notes",
    description: "Organize your learning materials",
    icon: <FileText className="h-6 w-6" />,
    initialNodes: [
      {
        id: "1",
        type: "default",
        position: { x: 250, y: 150 },
        data: { label: "Subject" },
      },
      {
        id: "2",
        type: "default",
        position: { x: 100, y: 50 },
        data: { label: "Chapter 1" },
      },
      {
        id: "3",
        type: "default",
        position: { x: 400, y: 50 },
        data: { label: "Chapter 2" },
      },
      {
        id: "4",
        type: "default",
        position: { x: 100, y: 250 },
        data: { label: "Key Points" },
      },
      {
        id: "5",
        type: "default",
        position: { x: 400, y: 250 },
        data: { label: "Summary" },
      },
    ],
    initialEdges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e1-3", source: "1", target: "3" },
      { id: "e1-4", source: "1", target: "4" },
      { id: "e1-5", source: "1", target: "5" },
    ],
  },
]

export default function TemplateModal({ isOpen, onClose, onSelectTemplate }: TemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templates, setTemplates] = useState<Template[]>(builtInTemplates)
  const [loading, setLoading] = useState<string | null>(null)

  // Load templates from public/templates folder
  useEffect(() => {
    if (!isOpen) return

    const loadTemplates = async () => {
      const loadedTemplates: Template[] = [...builtInTemplates]

      for (const meta of templateMetadata) {
        if (meta.filePath) {
          try {
            const response = await fetch(meta.filePath)
            if (response.ok) {
              const data = await response.json()
              if (data.nodes && data.edges) {
                loadedTemplates.push({
                  id: meta.id,
                  name: meta.name,
                  description: meta.description,
                  icon: meta.icon,
                  initialNodes: data.nodes,
                  initialEdges: data.edges,
                  filePath: meta.filePath,
                })
              }
            }
          } catch (error) {
            console.error(`Failed to load template ${meta.filePath}:`, error)
          }
        }
      }

      setTemplates(loadedTemplates)
    }

    loadTemplates()
  }, [isOpen])

  if (!isOpen) return null

  const handleSelect = async () => {
    if (selectedTemplate) {
      setLoading(selectedTemplate.id)
      try {
        // If template has filePath, reload it to ensure we have the latest data
        if (selectedTemplate.filePath) {
          const response = await fetch(selectedTemplate.filePath)
          if (response.ok) {
            const data = await response.json()
            const updatedTemplate = {
              ...selectedTemplate,
              initialNodes: data.nodes,
              initialEdges: data.edges,
            }
            onSelectTemplate(updatedTemplate)
          } else {
            onSelectTemplate(selectedTemplate)
          }
        } else {
          onSelectTemplate(selectedTemplate)
        }
        onClose()
      } catch (error) {
        console.error("Error loading template:", error)
        onSelectTemplate(selectedTemplate)
        onClose()
      } finally {
        setLoading(null)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl mx-4 bg-card rounded-xl shadow-2xl border border-border animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Choose a Template</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a template to get started or start from blank
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`
                  relative p-6 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    selectedTemplate?.id === template.id
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border hover:border-primary/50 hover:shadow-md"
                  }
                  ${loading === template.id ? "opacity-50 cursor-wait" : ""}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    p-3 rounded-lg
                    ${selectedTemplate?.id === template.id ? "bg-primary text-primary-foreground" : "bg-muted"}
                  `}>
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {template.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </div>
                {selectedTemplate?.id === template.id && (
                  <div className="absolute top-3 right-3">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <svg className="h-4 w-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Mindmap
          </button>
        </div>
      </div>
    </div>
  )
}

