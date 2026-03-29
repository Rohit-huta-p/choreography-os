import React, { memo } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { useCanvasStore } from '../../stores/canvasStore';
import type { CanvasObject } from '../../types';

interface Props {
  canvasObject: CanvasObject;
}

function PropsBlock({ canvasObject }: Props) {
  const { moveObject, props, performances, updateProp, setHighlightedIds, selectedIds } =
    useCanvasStore();
  const { _id: coId, position, collapsed } = canvasObject;

  const propList = Object.values(props).filter((p) => p.name !== '__props_board__');
  const w = 280;
  const itemH = 30;
  const headerH = 50;
  const h = collapsed ? 50 : Math.max(100, headerH + propList.length * itemH + 20);
  const isSelected = selectedIds.includes(coId);

  const pendingCount = propList.filter((p) => p.status === 'PENDING').length;

  const togglePropStatus = (propId: string) => {
    const prop = props[propId];
    if (!prop) return;
    updateProp(propId, { status: prop.status === 'PENDING' ? 'ACQUIRED' : 'PENDING' });
  };

  const handlePropClick = (propId: string) => {
    const prop = props[propId];
    if (!prop) return;
    const canvasObjects = useCanvasStore.getState().canvasObjects;
    const coIds = Object.values(canvasObjects)
      .filter((co) => co.type === 'performance' && prop.performance_ids.includes(co.reference_id))
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

      <Rect width={w} height={h} fill="#FFF7ED" cornerRadius={8} shadowColor="rgba(0,0,0,0.3)" shadowBlur={8} shadowOffsetY={2} />
      <Rect width={w} height={4} fill="#F97316" cornerRadius={[8, 8, 0, 0]} />

      <Text x={12} y={14} text="PROPS" fontSize={12} fontStyle="bold" fill="#C2410C" letterSpacing={1} />
      <Text x={w - 90} y={14} text={`${pendingCount} pending`} fontSize={11} fill={pendingCount > 0 ? '#DC2626' : '#16A34A'} />

      {!collapsed &&
        propList.map((p, i) => (
          <React.Fragment key={p._id}>
            {/* Status dot */}
            <Circle
              x={22}
              y={headerH + i * itemH + 10}
              radius={5}
              fill={p.status === 'ACQUIRED' ? '#16A34A' : '#DC2626'}
              onClick={() => togglePropStatus(p._id)}
              onTap={() => togglePropStatus(p._id)}
            />
            <Text
              x={34}
              y={headerH + i * itemH + 3}
              text={`${p.name} x${p.quantity}`}
              fontSize={12}
              fill="#334155"
              width={w - 50}
              wrap="none"
              ellipsis
              onClick={() => handlePropClick(p._id)}
              onTap={() => handlePropClick(p._id)}
            />
          </React.Fragment>
        ))}
    </Group>
  );
}

export default memo(PropsBlock);
