import { useEffect, useState } from 'react';
import { useApp } from '../store/AppStore';
import { newTaskReactions, taskReactionIds, taskSnapshot, type TaskReaction, type TaskSnapshot } from '../domain/taskReactions';

export function useTaskReactions(enabled: boolean, reduceMotion: boolean) {
  const { data, today, state, ready } = useApp();
  const [observer, setObserver] = useState<{ snapshot: TaskSnapshot | null; queue: TaskReaction[] }>({ snapshot: null, queue: [] });
  const next = enabled && ready ? taskSnapshot(data, today, state.mode) : null;
  const changed = next ? !observer.snapshot || observer.snapshot.context !== next.context || next.completed.some((done, i) => done !== observer.snapshot!.completed[i]) : observer.snapshot !== null;
  // Adjust to new task data before committing this render; no effect-driven extra render.
  if (changed) {
    const switched = !next || observer.snapshot?.context !== next.context;
    const added = next ? newTaskReactions(observer.snapshot, next) : [];
    setObserver({ snapshot: next, queue: switched || !next ? [] : [
      ...observer.queue.filter(id => id === 'complete' ? next.completed.every(Boolean) : next.completed[taskReactionIds.indexOf(id)]),
      ...added.filter(id => !observer.queue.includes(id)),
    ] });
  }
  const active = enabled && ready && observer.snapshot?.context === next?.context ? observer.queue[0] ?? null : null;
  const context = next?.context;
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setObserver(current => ({ ...current, queue: current.queue.slice(1) })), reduceMotion ? 1600 : 2800);
    return () => clearTimeout(timer);
  }, [active, context, reduceMotion]);
  return active;
}
