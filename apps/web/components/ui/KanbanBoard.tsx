"use client";

import { useMemo } from "react";

export type KanbanTask = { id: string; title: string; description?: string; status: string };
export type KanbanColumn = { id: string; title: string };

type KanbanBoardProps = {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  loading?: boolean;
  error?: string | null;
  onCreateTask?: () => void;
  onMoveTask?: (taskId: string, toStatus: string) => void;
  onDeleteTask?: (taskId: string) => void;
};

export function KanbanBoard({ columns, tasks, loading, error, onCreateTask, onMoveTask, onDeleteTask }: KanbanBoardProps) {
  const byColumn = useMemo(
    () => columns.map((column) => ({ column, tasks: tasks.filter((t) => t.status === column.id) })),
    [columns, tasks]
  );

  if (loading) return <div className="rounded-xl border bg-white p-3 text-sm text-zinc-500">Cargando tablero...</div>;
  if (error) return <div className="rounded-xl border bg-white p-3 text-sm text-red-600">{error}</div>;
  if (tasks.length === 0) return <div className="rounded-xl border bg-white p-3 text-sm text-zinc-500">Sin tareas.</div>;

  return (
    <section className="rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Kanban</h3>
        {onCreateTask ? <button className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white" onClick={onCreateTask}>Nueva tarea</button> : null}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {byColumn.map(({ column, tasks: columnTasks }) => (
          <div key={column.id} className="rounded-lg border bg-zinc-50 p-2">
            <h4 className="mb-2 text-sm font-medium">{column.title} ({columnTasks.length})</h4>
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <article key={task.id} className="rounded border bg-white p-2 text-sm">
                  <strong>{task.title}</strong>
                  {task.description ? <p className="mt-1 text-xs text-zinc-600">{task.description}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {columns.filter((c) => c.id !== column.id).map((target) => (
                      <button key={target.id} className="rounded border px-2 py-0.5 text-xs" onClick={() => onMoveTask?.(task.id, target.id)}>
                        → {target.title}
                      </button>
                    ))}
                    {onDeleteTask ? <button className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-700" onClick={() => onDeleteTask(task.id)}>Eliminar</button> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
