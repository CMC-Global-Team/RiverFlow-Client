"use client"

import { Github, Linkedin, Twitter } from "lucide-react"

interface TeamMemberCardProps {
  name: string
  role: string
  bio: string
  image: string
}

export default function TeamMemberCard({ name, role, bio, image }: TeamMemberCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all group">
      {/* Avatar */}
      <div className="mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
        {image}
      </div>

      {/* Info */}
      <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      <p className="text-sm text-primary font-medium">{role}</p>
      <p className="mt-3 text-sm text-muted-foreground">{bio}</p>

      {/* Social Links */}
      <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="rounded-lg p-2 hover:bg-muted transition-colors">
          <Github className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-muted transition-colors">
          <Linkedin className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-muted transition-colors">
          <Twitter className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </div>
  )
}
