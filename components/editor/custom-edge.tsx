import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath } from 'reactflow';

// Helper to get path based on type
const getEdgePath = (type: string, props: any) => {
    switch (type) {
        case 'straight':
            return getStraightPath(props);
        case 'step':
            return getSmoothStepPath({ ...props, borderRadius: 0 });
        case 'smoothstep':
            return getSmoothStepPath(props);
        default:
            return getBezierPath(props);
    }
};

const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    labelStyle,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    pathType = 'bezier', // Default to bezier
}: EdgeProps & { pathType?: string }) => {

    const [edgePath, labelX, labelY] = getEdgePath(pathType, {
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: labelStyle?.fontSize || 12,
                            fontWeight: labelStyle?.fontWeight || 500,
                            color: labelStyle?.fill || '#000',
                            pointerEvents: 'all',
                        }}
                        className="nopan nodrag"
                    >
                        <div
                            className="px-2 py-1 rounded shadow-sm border whitespace-pre-wrap text-center"
                            style={{
                                backgroundColor: labelBgStyle?.fill || '#ffffff',
                                opacity: labelBgStyle?.fillOpacity || 0.9,
                                borderColor: 'transparent', // Can expose this prop if needed
                                borderRadius: labelBgBorderRadius || 4,
                                minWidth: 'max-content',
                                maxWidth: '250px', // Wider max width for better wrapping
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word'
                            }}
                        >
                            {label}
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default memo(CustomEdge);
