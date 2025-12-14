"use client"

import { useState, useRef, useEffect } from 'react';
import { X, Keyboard, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface CheatSheetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Define keyboard shortcuts
const shortcuts = [
    { keys: ['Tab'], action: 'addChildNode' },
    { keys: ['Enter'], action: 'addSiblingNode' },
    { keys: ['Delete'], action: 'deleteSelected' },
    { keys: ['Ctrl', 'Z'], action: 'undo' },
    { keys: ['Ctrl', 'Y'], action: 'redo' },
    { keys: ['Ctrl', 'S'], action: 'save' },
    { keys: ['Ctrl', '+'], action: 'zoomIn' },
    { keys: ['Ctrl', '-'], action: 'zoomOut' },
    { keys: ['Ctrl', '0'], action: 'fitView' },
    { keys: ['Escape'], action: 'deselect' },
    { keys: ['Double Click'], action: 'editNode' },
    { keys: ['Drag'], action: 'moveNode' },
    { keys: ['Scroll'], action: 'panCanvas' },
    { keys: ['Ctrl', 'Scroll'], action: 'zoom' },
];

export default function CheatSheetModal({ isOpen, onClose }: CheatSheetModalProps) {
    const { t } = useTranslation('cheatSheet');
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle drag start
    const handleMouseDown = (e: React.MouseEvent) => {
        if (modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            dragOffset.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            setIsDragging(true);
        }
    };

    // Handle drag move and end
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.current.x;
                const newY = e.clientY - dragOffset.current.y;

                // Keep modal within viewport
                const maxX = window.innerWidth - (modalRef.current?.offsetWidth || 300);
                const maxY = window.innerHeight - (modalRef.current?.offsetHeight || 400);

                setPosition({
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY)),
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Reset position when modal opens
    useEffect(() => {
        if (isOpen) {
            setPosition({
                x: Math.max(100, (window.innerWidth - 320) / 2),
                y: Math.max(100, (window.innerHeight - 400) / 2),
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={modalRef}
            className="fixed z-[9999] w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            style={{
                left: position.x,
                top: position.y,
                cursor: isDragging ? 'grabbing' : 'auto',
            }}
        >
            {/* Header - Draggable */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Keyboard className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm text-foreground">
                        {t('title', 'Keyboard Shortcuts')}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, keyIndex) => (
                                    <span key={keyIndex} className="flex items-center">
                                        <kbd className="px-2 py-1 text-xs font-mono font-semibold bg-muted border border-border rounded shadow-sm">
                                            {key}
                                        </kbd>
                                        {keyIndex < shortcut.keys.length - 1 && (
                                            <span className="mx-1 text-muted-foreground text-xs">+</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {t(`actions.${shortcut.action}`, shortcut.action)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 bg-muted/30 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                    {t('dragHint', 'Drag header to move')}
                </p>
            </div>
        </div>
    );
}
