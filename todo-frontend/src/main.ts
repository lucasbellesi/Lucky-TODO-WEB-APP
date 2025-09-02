import './style.css'

import van from 'vanjs-core';
import { getTasks, createTask, completeTask, deleteTask } from './api/client';
import { setTasks, addTask, updateTask, removeTask, subscribe, getState, setState, logout, replaceTaskId } from './state';
import { AddForm, TaskList, Filters, Stats, Toast, AuthGate } from './ui/components';

const { div } = van.tags;

const app = document.getElementById('app')!;

let toastTimeout: number | undefined;
function showToast(msg: string, type: 'error' | 'success' = 'success') {
  if (!app) return;
  // Remove any existing toasts to keep only one visible
  document.querySelectorAll('.toast').forEach(el => el.remove());
  const toast = Toast(msg, type);
  // Append to body to avoid containing blocks created by filters/backdrop on #app
  document.body.appendChild(toast);
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function loadTasks() {
  setState({ loading: true, error: null });
  try {
    const data = await getTasks();
    setTasks(data.tasks);
  } catch (e: any) {
    setState({ error: e?.data?.error?.message || e.message || 'Failed to load tasks' });
    showToast('Failed to load tasks', 'error');
  } finally {
    setState({ loading: false });
  }
}

async function handleAdd(title: string) {
  const tempId = 'temp-' + Math.random().toString(36).slice(2);
  const tempTask = { id: tempId, title, status: 'pending', createdAt: new Date().toISOString() };
  addTask(tempTask as any);

  try {
    const task = await createTask({ title }); // el backend devuelve { id, ... } real
    replaceTaskId(tempId, task);              // <- reemplaza el temp por el real
    showToast('Task added!');
  } catch (e: any) {
    removeTask(tempId);                       // rollback si falla
    showToast(e?.data?.error?.message || e.message || 'Failed to add task', 'error');
  }
}

async function handleToggle(id: string) {
  const task = getState().tasks.find((t) => t.id === id);
  if (!task) return;
  // Optimistic UI
  const updated = { ...task, status: task.status === 'completed' ? 'pending' as const : 'completed' as const };
  updateTask(updated);
  try {
    const result = await completeTask(id);
    updateTask(result);
  } catch (e: any) {
    updateTask(task); // rollback
    showToast(e?.data?.error?.message || e.message || 'Failed to update task', 'error');
  }
}

async function handleDelete(id: string) {
  const task = getState().tasks.find((t) => t.id === id);
  if (!task) return;
  removeTask(id);
  showToast('Removing task...');
  try {
    await deleteTask(id);
    showToast('Task deleted!');
  } catch (e: any) {
    addTask(task);
    showToast(e?.data?.error?.message || e.message || 'Failed to delete task', 'error');
  }
}

function render() {
  const state = getState();
  let filtered = state.tasks;
  if (state.filter === 'active') filtered = filtered.filter((t) => t.status !== 'completed');
  if (state.filter === 'completed') filtered = filtered.filter((t) => t.status === 'completed');
  if (state.search) filtered = filtered.filter((t) => t.title.toLowerCase().includes(state.search.toLowerCase()));

  van.add(app,
    AuthGate(() =>
      div({ class: 'todo-app' },
                // Header with logout button
        div({ class: 'app-header' },
          div({ class: 'app-title' }, 'Lucky ToDo'),
          van.tags.button({ class: 'logout-btn logout-absolute', onclick: () => { logout(); location.reload(); } }, 'Logout')
        ),
        div({ class: 'top-controls' },
          div({ class: 'top-controls-left' },
            AddForm(handleAdd),
            Filters()
          )
        ),
        Stats(),
        state.loading ? div({ class: 'loading' }, 'Loading...') :
          filtered.length === 0 ? div({ class: 'empty' }, 'No tasks found.') :
          TaskList(filtered, { onToggle: handleToggle, onDelete: handleDelete }),
        state.error && div({ class: 'error' }, state.error)
      )
    )
  );
}

subscribe(() => {
  app.innerHTML = '';
  render();
});



let loadedTasks = false;
subscribe(() => {
  const state = getState();
  if (state.auth.token && !loadedTasks && !state.loading && !state.error) {
    loadedTasks = true;
    void loadTasks();
  }
  if (!state.auth.token) {
    loadedTasks = false;
  }
});
