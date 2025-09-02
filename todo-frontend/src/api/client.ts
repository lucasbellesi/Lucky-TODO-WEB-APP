import type { Task, PaginatedTasks, CreateTaskRequest } from './types';
import { TaskSchema, PaginatedTasksSchema } from './types';
import { fetchJson } from '../utils/http';
import { getState } from '../state';

const SANDBOX_URL = 'https://sandbox.api.todoapp.com/v1';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || SANDBOX_URL;

// --- Auth ---
export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

// Convierte snake_case a camelCase para objetos y arrays
function toCamel(obj: any): any {
	if (Array.isArray(obj)) return obj.map(toCamel);
	if (obj && typeof obj === 'object') {
		return Object.fromEntries(
			Object.entries(obj).map(([k, v]) => [
				k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
				toCamel(v)
			])
		);
	}
	return obj;
}

export async function registerUser(data: { email: string; password: string; username?: string }): Promise<{ id: string; email: string; username?: string }> {
	const res = await fetchJson(BASE_URL + '/auth/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return res;
}

export async function loginUser(data: { email: string; password: string }): Promise<AuthTokens> {
  const url = BASE_URL + '/auth/login';
  // Try JSON first (common for many APIs)
  try {
    return await fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
  } catch (e: any) {
    // Fallback to form-encoded (username/password) if server rejects JSON format
    if (e && typeof e === 'object' && 'status' in e && [400, 401, 404, 405, 415, 422].includes((e as any).status)) {
      const body = new URLSearchParams({ username: data.email, password: data.password }).toString();
      return await fetchJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body,
      });
    }
    throw e;
  }
}


function getAuthHeaders(token?: string): Record<string, string> {
	const jwt = token || getState().auth.token;
	return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}


export interface GetTasksParams {
	status?: 'pending' | 'completed';
	priority?: 'low' | 'medium' | 'high';
	limit?: number;
	offset?: number;
	token?: string;
}

export async function getTasks(params: GetTasksParams = {}): Promise<PaginatedTasks> {
	const url = new URL(BASE_URL + '/tasks');
	if (params.status) url.searchParams.set('status', params.status);
	if (params.priority) url.searchParams.set('priority', params.priority);
	if (params.limit) url.searchParams.set('limit', String(params.limit));
	if (params.offset) url.searchParams.set('offset', String(params.offset));
	const res = await fetchJson(url.toString(), {
		headers: { ...getAuthHeaders(params.token) },
	});
	return PaginatedTasksSchema.parse(toCamel(res));
}

export async function createTask(data: CreateTaskRequest, token?: string): Promise<Task> {
	const res = await fetchJson(BASE_URL + '/tasks', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...getAuthHeaders(token) },
		body: JSON.stringify(data),
	});
	return TaskSchema.parse(toCamel(res));
}

export async function getTask(id: string, token?: string): Promise<Task> {
	const res = await fetchJson(BASE_URL + `/tasks/${id}` , {
		headers: { ...getAuthHeaders(token) },
	});
	return TaskSchema.parse(toCamel(res));
}

export async function completeTask(id: string, token?: string): Promise<Task> {
	const res = await fetchJson(BASE_URL + `/tasks/${id}/complete`, {
		method: 'PATCH',
		headers: { ...getAuthHeaders(token) },
	});
	return TaskSchema.parse(toCamel(res));
}

export async function deleteTask(id: string, token?: string): Promise<void> {
	const res = await fetch(BASE_URL + `/tasks/${id}`, {
		method: 'DELETE',
		headers: { ...getAuthHeaders(token) },
	});
	if (res.status === 404) {
		// Task already deleted, treat as success
		return;
	}
	if (!res.ok) {
		let data;
		try {
			data = await res.json();
		} catch {
			data = undefined;
		}
		throw { status: res.status, data };
	}
	// If response has content, try to parse, else just return
	const text = await res.text();
	if (text) {
		try {
			JSON.parse(text);
		} catch {
			// ignore, not JSON
		}
	}
	return;
}
