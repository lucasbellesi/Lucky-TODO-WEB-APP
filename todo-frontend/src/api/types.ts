// Zod schemas for runtime validation
import { z } from 'zod';

export const TaskSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1).max(100),
	description: z.string().max(500).nullable().optional(),
	status: z.enum(['pending', 'completed']),
	priority: z.enum(['low', 'medium', 'high']).optional(),
	dueDate: z.string().nullable().optional(),
	createdAt: z.string(),
	updatedAt: z.string().nullable().optional(),
	categoryId: z.string().uuid().nullable().optional(),
});

export const PaginatedTasksSchema = z.object({
	tasks: z.array(TaskSchema),
	pagination: z
		.object({
			total: z.number().int().nonnegative().optional(),
			limit: z.number().int().min(1).max(100).optional(),
			offset: z.number().int().nonnegative().optional(),
		})
		.optional(),
});

export const APIErrorSchema = z.object({
	error: z.object({
		code: z.string(),
		message: z.string(),
		details: z.record(z.string(), z.array(z.string())).optional(),
	}),
	timestamp: z.string().datetime().optional(),
	path: z.string().optional(),
});
// Types generated from OpenAPI schemas
export type UUID = string;

export interface ErrorDetail {
	code: string;
	message: string;
	details?: Record<string, string[]>;
}

export interface APIError {
	error: ErrorDetail;
	timestamp?: string;
	path?: string;
}

export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
	id: UUID;
	title: string;
	description?: string | null;
	status: TaskStatus;
	priority?: TaskPriority;
	dueDate?: string | null;
	createdAt: string;
	updatedAt?: string;
	categoryId?: UUID | null;
}

export interface PaginatedTasks {
	tasks: Task[];
	pagination?: {
		total?: number;
		limit?: number;
		offset?: number;
	};
}

export interface CreateTaskRequest {
	title: string;
	description?: string;
	dueDate?: string;
	priority?: TaskPriority;
	categoryId?: UUID;
}

export interface Category {
	id: UUID;
	name: string;
	color?: string;
	createdAt: string;
	updatedAt: string;
}
