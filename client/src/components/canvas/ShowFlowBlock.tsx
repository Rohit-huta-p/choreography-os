import React, { memo } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { useCanvasStore } from '../../stores/canvasStore';
import { STATUS_COLORS } from '../../types';
import type { CanvasObject } from '../../types';

interface Props {
  canvasObject: CanvasObject;
}

function ShowFlowBlock({ canvasObject }: Props) {
  const { moveObject, showFlow, performances, selectedIds } = useCanvasStore();
  const { _id: coId, position, collapsed } = canvasObject;

  const entries = showFlow?.entries || [];
  const w = 300;
  const itemH = 32;
  const headerH = 50;
  const h = collapsed ? 50 : Math.max(100, headerH + entries.length * itemH + 40);
  const isSelected = selectedIds.includes(coId);

  const totalMinutes = entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragEnd={(e) => moveObject(coId, { x: e.target.x(), y: e.target.y() })}
    >
      {isSelected && (
        <Rect x={-3} y={-3} width={w + 6} height={h + 6} cornerRadius={10} stroke="#818CF8" strokeWidth={2} />
      )}

      <Rect width={w} height={h} fill="#F0FDF4" cornerRadius={8} shadowColor="rgba(0,0,0,0.3)" shadowBlur={8} shadowOffsetY={2} />
      <Rect width={w} height={4} fill="#22C55E" cornerRadius={[8, 8, 0, 0]} />

      <Text x={12} y={14} text="SHOW FLOW" fontSize={12} fontStyle="bold" fill="#166534" letterSpacing={1} />
      <Text
        x={w - 100}
        y={14}
        text={`Total: ${totalMinutes}min`}
        fontSize={11}
        fill="#64748B"
      />

      {!collapsed &&
        entries.map((entry, i) => {
          const perf = performances[entry.performance_id];
          const statusColor = perf ? STATUS_COLORS[perf.status] : '#9CA3AF';
          return (
            <React.Fragment key={i}>
              {/* Number */}
              <Text x={12} y={headerH + i * itemH + 6} text={`${i + 1}.`} fontSize={12} fill="#64748B" fontStyle="bold" />

              {/* Status dot */}
              <Rect x={30} y={headerH + i * itemH + 8} width={8} height={8} fill={statusColor} cornerRadius={4} />

              {/* Title */}
              <Text
                x={44}
                y={headerH + i * itemH + 5}
                text={perf?.title || 'Unknown'}
                fontSize={12}
                fill="#334155"
                width={w - 120}
                wrap="none"
                ellipsis
              />

              {/* Duration */}
              <Text
                x={w - 60}
                y={headerH + i * itemH + 5}
                text={`${entry.duration_minutes || 0}min`}
                fontSize={11}
                fill="#64748B"
              />

              {/* Transition notes */}
              {entry.transition_notes && (
                <Text
                  x={44}
                  y={headerH + i * itemH + 20}
                  text={`↳ ${entry.transition_notes}`}
                  fontSize={9}
                  fill="#94A3B8"
                  fontStyle="italic"
                  width={w - 60}
                  wrap="none"
                  ellipsis
                />
              )}
            </React.Fragment>
          );
        })}
    </Group>
  );
}

export default memo(ShowFlowBlock);
