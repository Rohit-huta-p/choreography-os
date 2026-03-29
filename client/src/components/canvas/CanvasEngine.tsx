import { useRef, useCallback, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useCanvasStore } from '../../stores/canvasStore';
import PerformanceBlock from './PerformanceBlock';
import RosterBlock from './RosterBlock';
import PropsBlock from './PropsBlock';
import ShowFlowBlock from './ShowFlowBlock';
import TaskBlockComponent from './TaskBlock';
import type Konva from 'konva';

export default function CanvasEngine() {
  const stageRef = useRef<Konva.Stage>(null);
  const {
    viewport,
    setViewport,
    canvasObjects,
    performances,
    tasks,
    setSelectedIds,
    setHighlightedIds,
    undo,
    redo,
  } = useCanvasStore();

  const objects = Object.values(canvasObjects);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = viewport.scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scaleBy = 1.08;
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = Math.min(2, Math.max(0.25, direction > 0 ? oldScale * scaleBy : oldScale / scaleBy));

      const mousePointTo = {
        x: (pointer.x - viewport.x) / oldScale,
        y: (pointer.y - viewport.y) / oldScale,
      };

      setViewport({
        scale: newScale,
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [viewport, setViewport]
  );

  // Handle stage drag for panning
  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target === stageRef.current) {
        setViewport({ x: e.target.x(), y: e.target.y() });
      }
    },
    [setViewport]
  );

  // Click empty area to deselect
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === stageRef.current) {
        setSelectedIds([]);
        setHighlightedIds([]);
      }
    },
    [setSelectedIds, setHighlightedIds]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if (e.key === 'Escape') {
        setSelectedIds([]);
        setHighlightedIds([]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, setSelectedIds, setHighlightedIds]);

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight - 56}
      draggable
      x={viewport.x}
      y={viewport.y}
      scaleX={viewport.scale}
      scaleY={viewport.scale}
      onWheel={handleWheel}
      onDragEnd={handleDragEnd}
      onClick={handleStageClick}
      onTap={handleStageClick}
      style={{ background: '#0B1120' }}
    >
      <Layer>
        {objects.map((co) => {
          switch (co.type) {
            case 'performance': {
              const perf = performances[co.reference_id];
              if (!perf) return null;
              return <PerformanceBlock key={co._id} canvasObject={co} performance={perf} />;
            }
            case 'roster':
              return <RosterBlock key={co._id} canvasObject={co} />;
            case 'props_board':
              return <PropsBlock key={co._id} canvasObject={co} />;
            case 'show_flow':
              return <ShowFlowBlock key={co._id} canvasObject={co} />;
            case 'task': {
              const task = tasks[co.reference_id];
              if (!task) return null;
              return <TaskBlockComponent key={co._id} canvasObject={co} task={task} />;
            }
            default:
              return null;
          }
        })}
      </Layer>
    </Stage>
  );
}
