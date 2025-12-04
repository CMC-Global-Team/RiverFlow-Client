"use client"

import { Filter, ChevronDown, Users } from "lucide-react"
import { useState } from "react"

interface UserFilterBarProps {
    selectedRole: string
    onRoleChange: (role: string) => void
    selectedStatus: string
    onStatusChange: (status: string) => void
    sortBy: string
    onSortChange: (sort: string) => void
}

function CustomSelect({
    value,
    onChange,
    options,
    placeholder
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string
}) {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find(opt => opt.value === value)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-all text-sm min-w-[140px] justify-between"
            >
                <span className="text-foreground">{selectedOption?.label || placeholder}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                                className={`
                  w-full px-4 py-2.5 text-left text-sm transition-colors
                  ${value === option.value
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-foreground hover:bg-muted'
                                    }
                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default function UserFilterBar({
    selectedRole,
    onRoleChange,
    selectedStatus,
    onStatusChange,
    sortBy,
    onSortChange,
}: UserFilterBarProps) {
    const roles = [
        { value: "all", label: "Tất cả vai trò" },
        { value: "ADMIN", label: "Admin" },
        { value: "USER", label: "User" },
    ]

    const statuses = [
        { value: "all", label: "Tất cả trạng thái" },
        { value: "ACTIVE", label: "Đang hoạt động" },
        { value: "INACTIVE", label: "Không hoạt động" },
    ]

    const sortOptions = [
        { value: "createdAt", label: "Ngày tạo" },
        { value: "updatedAt", label: "Cập nhật gần đây" },
        { value: "fullName", label: "Tên" },
        { value: "email", label: "Email" },
    ]

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border shadow-sm">
            <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Lọc:</span>
            </div>

            {/* Role Filter */}
            <CustomSelect
                value={selectedRole}
                onChange={onRoleChange}
                options={roles}
                placeholder="Vai trò"
            />

            {/* Status Filter */}
            <CustomSelect
                value={selectedStatus}
                onChange={onStatusChange}
                options={statuses}
                placeholder="Trạng thái"
            />

            {/* Sort By */}
            <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                <CustomSelect
                    value={sortBy}
                    onChange={onSortChange}
                    options={sortOptions}
                    placeholder="Sắp xếp theo"
                />
            </div>
        </div>
    )
}
