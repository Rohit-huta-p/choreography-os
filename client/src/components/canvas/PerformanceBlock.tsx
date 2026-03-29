import React, { memo } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { useCanvasStore } from '../../stores/canvasStore';
import { STATUS_BG, STATUS_COLORS } from '../../types';
import type { CanvasObject, Performance } from '../../types';

interface Props {
  canvasObject: CanvasObject;
  performance: Performance;
}

const STATUS_LABELS = { NOT_STARTED: 'Not Started', TEACHING: 'Teaching', ALMOST_DONE: 'Almost Done', DONE: 'Done' };
const STATUS_ORDER: Performance['status'][] = ['NOT_STARTED', 'TEACHING', 'ALMOST_DONE', 'DONE'];

function PerformanceBlock({ canvasObject, performance }: Props) {
  const { moveObject, toggleCollapsed, updatePerformance, highlightedIds, selectedIds } = useCanvasStore();
  const { _id: coId, position, collapsed } = canvasObject;
  const isHighlighted = highlightedIds.includes(coId);
  const isSelected = selectedIds.includes(coId);

  const w = 280;
  const h = collapsed ? 60 : 200;

  const cycleStatus = () => {
    const idx = STATUS_ORDER.indexOf(performance.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    updatePerformance(performance._id, { status: next });
  };

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragEnd={(e) => {
        moveObject(coId, { x: e.target.x(), y: e.target.y() });
      }}
    >
      {/* Highlight ring */}
      {(isHighlighted || isSelected) && (
        <Rect
          x={-3}
          y={-3}
          width={w + 6}
          height={h + 6}
          cornerRadius={10}
          stroke={isHighlighted ? '#6366F1' : '#818CF8'}
          strokeWidth={2}
          dash={isHighlighted ? [6, 3] : undefined}
        />
      )}

      {/* Background */}
      <Rect
        width={w}
        height={h}
        fill={STATUS_BG[performance.status]}
        cornerRadius={8}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={8}
        shadowOffsetY={2}
      />

      {/* Status bar */}
      <Rect width={w} height={4} fill={STATUS_COLORS[performance.status]} cornerRadius={[8, 8, 0, 0]} />

      {/* Title */}
      <Text
        x={12}
        y={14}
        text={performance.title}
        fontSize={14}
        fontStyle="bold"
        fill="#1E293B"
        width={w - 60}
        ellipsis
        wrap="none"
      />

      {/* Collapse button */}
      <Text
        x={w - 30}
        y={12}
        text={collapsed ? '▸' : '▾'}
        fontSize={16}
        fill="#64748B"
        onClick={() => toggleCollapsed(coId)}
        onTap={() => toggleCollapsed(coId)}
      />

      {/* Status badge */}
      <Text
        x={12}
        y={36}
        text={`● ${STATUS_LABELS[performance.status]}`}
        fontSize={11}
        fill={STATUS_COLORS[performance.status]}
        onClick={cycleStatus}
        onTap={cycleStatus}
      />

      {/* Performer count */}
      <Text
        x={w - 70}
        y={36}
        text={`👥 ${performance.performer_ids.length}`}
        fontSize={11}
        fill="#64748B"
      />

      {/* Expanded content */}
      {!collapsed && (
        <>
          {/* Songs */}
          <Text
            x={12}
            y={60}
            text={`Songs: ${performance.songs.length > 0 ? performance.songs.map((s) => s.name).join(', ') : 'None'}`}
            fontSize={11}
            fill="#475569"
            width={w - 24}
            wrap="word"
          />

          {/* Props count */}
          <Text x={12} y={85} text={`Props: ${performance.prop_ids.length}`} fontSize={11} fill="#475569" />

          {/* Notes */}
          {performance.notes && (
            <Text
              x={12}
              y={105}
              text={performance.notes}
              fontSize={10}
              fill="#64748B"
              width={w - 24}
              height={80}
              wrap="word"
              ellipsis
            />
          )}
        </>
      )}
    </Group>
  );
}

export default memo(PerformanceBlock);
