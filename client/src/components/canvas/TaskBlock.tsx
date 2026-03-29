import React, { memo } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { useCanvasStore } from '../../stores/canvasStore';
import type { CanvasObject, TaskBlock as TaskBlockType } from '../../types';

interface Props {
  canvasObject: CanvasObject;
  task: TaskBlockType;
}

function TaskBlock({ canvasObject, task }: Props) {
  const { moveObject, updateTask, selectedIds } = useCanvasStore();
  const { _id: coId, position, collapsed } = canvasObject;

  const w = 260;
  const itemH = 26;
  const headerH = 50;
  const h = collapsed ? 50 : Math.max(80, headerH + task.tasks.length * itemH + 20);
  const isSelected = selectedIds.includes(coId);
  const completedCount = task.tasks.filter((t) => t.completed).length;

  const toggleTask = (index: number) => {
    const updated = task.tasks.map((t, i) => (i === index ? { ...t, completed: !t.completed } : t));
    updateTask(task._id, { tasks: updated });
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

      <Rect width={w} height={h} fill="#FAF5FF" cornerRadius={8} shadowColor="rgba(0,0,0,0.3)" shadowBlur={8} shadowOffsetY={2} />
      <Rect width={w} height={4} fill="#A855F7" cornerRadius={[8, 8, 0, 0]} />

      <Text x={12} y={14} text={task.title} fontSize={12} fontStyle="bold" fill="#6B21A8" width={w - 80} wrap="none" ellipsis />
      <Text
        x={w - 65}
        y={14}
        text={`${completedCount}/${task.tasks.length}`}
        fontSize={11}
        fill="#64748B"
      />

      {!collapsed &&
        task.tasks.map((item, i) => (
          <React.Fragment key={i}>
            <Text
              x={12}
              y={headerH + i * itemH + 4}
              text={item.completed ? '☑' : '☐'}
              fontSize={14}
              fill={item.completed ? '#16A34A' : '#94A3B8'}
              onClick={() => toggleTask(i)}
              onTap={() => toggleTask(i)}
            />
            <Text
              x={32}
              y={headerH + i * itemH + 5}
              text={item.text}
              fontSize={12}
              fill={item.completed ? '#94A3B8' : '#334155'}
              textDecoration={item.completed ? 'line-through' : undefined}
              width={w - 44}
              wrap="none"
              ellipsis
              onClick={() => toggleTask(i)}
              onTap={() => toggleTask(i)}
            />
          </React.Fragment>
        ))}
    </Group>
  );
}

export default memo(TaskBlock);
