import type { DataSet } from './model.ts';
import { dailyTasks } from './dailyTasks.ts';

export const taskReactionIds = ['workout', 'creatine', 'calories', 'weight', 'target'] as const;
export type TaskReaction = typeof taskReactionIds[number] | 'complete';
export type TaskSnapshot = { context: string; completed: boolean[] };
export function taskSnapshot(data: DataSet, date: string, mode: string): TaskSnapshot {
  return { context: `${mode}:${date}`, completed: dailyTasks(data, date).map(task => task.value === true) };
}
export function newTaskReactions(previous: TaskSnapshot | null, next: TaskSnapshot): TaskReaction[] {
  // Loading history, switching accounts and midnight aren't task completions.
  if (!previous || previous.context !== next.context) return [];
  const reactions: TaskReaction[] = taskReactionIds.filter((_, i) => next.completed[i] && !previous.completed[i]);
  if (next.completed.every(Boolean) && !previous.completed.every(Boolean)) reactions.push('complete');
  return reactions;
}
