import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { CheckSquare, AlertCircle, Clock } from 'lucide-react';
import apiClient from '../services/apiClient';

const TASKS_MOCK = [
    { id: '1', title: 'Prepare project documentation', assignee: 'Priya', status: 'TODO', priority: 'HIGH', isAi: true },
    { id: '2', title: 'Setup PostgreSQL with pgvector', assignee: 'Abhed', status: 'IN_PROGRESS', priority: 'URGENT', isAi: false },
    { id: '3', title: 'Review architecture diagram', assignee: 'Rahul', status: 'IN_REVIEW', priority: 'MEDIUM', isAi: true },
    { id: '4', title: 'Implement WebRTC signaling over STOMP', assignee: 'Vinit', status: 'DONE', priority: 'HIGH', isAi: true },
];

const SortableTaskItem = ({ task }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-4 bg-surface border border-border rounded-xl cursor-grab active:cursor-grabbing hover:border-brand-DEFAULT transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-text-primary text-sm">{task.title}</span>
                {task.isAi && <Badge variant="cyan" size="sm">AI</Badge>}
            </div>
            <div className="flex items-center justify-between text-xs text-text-muted mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-hover flex items-center justify-center font-bold text-text-primary">
                        {task.assignee.charAt(0)}
                    </div>
                    <span>{task.assignee}</span>
                </div>
                <Badge variant={task.priority === 'URGENT' ? 'error' : 'default'} size="sm">{task.priority}</Badge>
            </div>
        </div>
    );
};

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>(TASKS_MOCK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiClient.get('/tasks');
        if (res.data && res.data.length > 0) {
          setTasks(res.data);
        }
      } catch (err) {
        // Keep fallback mock data for demo / Vercel deployment
      }
    };
    fetchTasks();
  }, []);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
        const oldIndex = tasks.findIndex(t => t.id === active.id);
        const newIndex = tasks.findIndex(t => t.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
            const newTasks = [...tasks];
            const [moved] = newTasks.splice(oldIndex, 1);
            moved.status = tasks[newIndex].status || 'TODO';
            newTasks.splice(newIndex, 0, moved);
            setTasks(newTasks);
            
            // Persist to backend
            try {
                await apiClient.patch(`/tasks/reorder`, [{
                    id: moved.id,
                    status: moved.status,
                    position: newIndex * 1000 // mock position logic
                }]);
            } catch (err) {
                console.error("Failed to reorder task", err);
            }
        }
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-brand-DEFAULT" /> Task Board
            </h1>
            <p className="text-sm text-text-secondary mt-1">Manage commitments and AI-extracted tasks.</p>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
            <div className="flex gap-6 min-w-max h-full pb-4">
                {columns.map(col => {
                    const columnTasks = tasks.filter(t => t.status === col);
                    return (
                        <div key={col} className="w-80 flex flex-col bg-surface/30 rounded-2xl border border-border p-4">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="font-bold text-text-primary capitalize">{col.replace('_', ' ')}</h3>
                                <Badge variant="default">{columnTasks.length}</Badge>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                    {columnTasks.map(task => (
                                        <SortableTaskItem key={task.id} task={task} />
                                    ))}
                                </SortableContext>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </DndContext>
    </div>
  );
};
