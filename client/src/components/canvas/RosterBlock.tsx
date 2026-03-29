import React, { memo } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { useCanvasStore } from '../../stores/canvasStore';
import type { CanvasObject } from '../../types';

interface Props {
  canvasObject: CanvasObject;
}

function RosterBlock({ canvasObject }: Props) {
  const { moveObject, performers, performances, setHighlightedIds, highlightedIds, selectedIds } =
    useCanvasStore();
  const { _id: coId, position, collapsed } = canvasObject;

  const performerList = Object.values(performers).filter((p) => p.name !== '__roster__');
  const w = 260;
  const itemH = 28;
  const headerH = 50;
  const h = collapsed ? 50 : Math.max(100, headerH + performerList.length * itemH + 20);
  const isSelected = selectedIds.includes(coId);

  const handlePerformerClick = (performerId: string) => {
    // Find all canvas objects for performances that include this performer
    const perfIds = Object.values(performances)
      .filter((p) => p.performer_ids.includes(performerId))
      .map((p) => p._id);

    const canvasObjects = useCanvasStore.getState().canvasObjects;
    const coIds = Object.values(canvasObjects)
      .filter((co) => co.type === 'performance' && perfIds.includes(co.reference_id))
      .map((co) => co._id);

    setHighlightedIds(coIds);
  };

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

      <Rect width={w} height={h} fill="#EFF6FF" cornerRadius={8} shadowColor="rgba(0,0,0,0.3)" shadowBlur={8} shadowOffsetY={2} />
      <Rect width={w} height={4} fill="#3B82F6" cornerRadius={[8, 8, 0, 0]} />

      <Text x={12} y={14} text="ROSTER" fontSize={12} fontStyle="bold" fill="#1E40AF" letterSpacing={1} />
      <Text x={w - 50} y={14} text={`${performerList.length} 👥`} fontSize={11} fill="#64748B" />

      {!collapsed &&
        performerList.map((p, i) => (
          <React.Fragment key={p._id}>
            <Rect
              x={8}
              y={headerH + i * itemH}
              width={w - 16}
              height={itemH - 4}
              fill={highlightedIds.length > 0 ? 'rgba(99,102,241,0.05)' : 'transparent'}
              cornerRadius={4}
              onClick={() => handlePerformerClick(p._id)}
              onTap={() => handlePerformerClick(p._id)}
            />
            <Text
              x={16}
              y={headerH + i * itemH + 6}
              text={`${p.name}${p.role ? ` — ${p.role}` : ''}`}
              fontSize={12}
              fill="#334155"
              width={w - 32}
              wrap="none"
              ellipsis
              onClick={() => handlePerformerClick(p._id)}
              onTap={() => handlePerformerClick(p._id)}
            />
          </React.Fragment>
        ))}
    </Group>
  );
}

export default memo(RosterBlock);
