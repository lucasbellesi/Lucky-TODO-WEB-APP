import { loginUser, registerUser } from '../api/client';
import { setToken, setUser, getState, logout } from '../state';
// LoginForm
export const LoginForm = (onSuccess: () => void) => {
	let email = '', password = '';
	let error = van.state('');
	return form({
		class: 'auth-form',
		onsubmit: async (e: Event) => {
			e.preventDefault();
			error.val = '';
			try {
				const tokens = await loginUser({ email, password });
				setToken(tokens.accessToken);
				setUser({ email });
				onSuccess();
			} catch (e: any) {
				error.val = e?.data?.error?.message || e.message || 'Login failed';
			}
		},
	},
		h2('Login'),
		label('Email:'),
		input({ type: 'email', required: true, oninput: (e: any) => (email = e.target.value) }),
		label('Password:'),
		input({ type: 'password', required: true, oninput: (e: any) => (password = e.target.value) }),
		button({ type: 'submit' }, 'Login'),
		error,
	);
};

// RegisterForm
export const RegisterForm = (onSuccess: () => void) => {
	let email = '', password = '', username = '';
	let error = van.state('');
	return form({
		class: 'auth-form',
		onsubmit: async (e: Event) => {
			e.preventDefault();
			error.val = '';
			try {
				await registerUser({ email, password, username });
				onSuccess();
			} catch (e: any) {
				error.val = e?.data?.error?.message || e.message || 'Register failed';
			}
		},
	},
		h2('Register'),
		label('Email:'),
		input({ type: 'email', required: true, oninput: (e: any) => (email = e.target.value) }),
		label('Username:'),
		input({ type: 'text', required: true, oninput: (e: any) => (username = e.target.value) }),
		label('Password:'),
		input({ type: 'password', required: true, oninput: (e: any) => (password = e.target.value) }),
		button({ type: 'submit' }, 'Register'),
		error,
	);
};

// AuthGate: muestra login/register si no hay token
export const AuthGate = (children: () => any) => {
	const state = getState();
	const showLogin = van.state(true);
	return div(
		!state.auth.token
			? div(
					button({ onclick: () => (showLogin.val = true) }, 'Login'),
					button({ onclick: () => (showLogin.val = false) }, 'Register'),
					showLogin,
					() => (showLogin.val ? LoginForm(children) : RegisterForm(() => (showLogin.val = true)))
				)
			: div(
				children()
			)
	);
};
import van from 'vanjs-core';
import type { Task } from '../api/types';
import { subscribe, setFilter, setSearch } from '../state';

const { div, input, button, label, span, ul, li, form, h2 } = van.tags;

// Escape HTML for XSS safety
function escapeHtml(text: string) {
	return text.replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c] || c));
}

// Toast
export const Toast = (msg: string, type: 'error' | 'success' = 'success') =>
	div({ class: `toast toast-${type}` }, escapeHtml(msg));

// TaskItem
export const TaskItem = (task: Task, { onToggle, onDelete }: { onToggle: () => void; onDelete: () => void }) =>
	li({ class: `task-item${task.status === 'completed' ? ' completed' : ''}` },
		   label(
			   input({
				   type: 'checkbox',
				   checked: task.status === 'completed',
				   oninput: onToggle,
				   disabled: typeof task.id === 'string' && task.id.startsWith('temp-'),
				   tabindex: 0,
				   'aria-label': 'Toggle completed',
			   }),
			   span({ class: 'task-title' }, escapeHtml(task.title)),
			   span({ style: 'color:gray;font-size:0.7em;margin-left:8px;' }, `[${task.id}]`)
		   ),
		   button({ class: 'delete-btn', onclick: onDelete, tabindex: 0, 'aria-label': 'Delete task', disabled: typeof task.id === 'string' && task.id.startsWith('temp-') }, '🗑️')
	);

// TaskList
export const TaskList = (tasks: Task[], { onToggle, onDelete }: { onToggle: (id: string) => void; onDelete: (id: string) => void }) =>
	ul({ class: 'task-list' },
		tasks.map((task) => TaskItem(task, {
			onToggle: () => onToggle(task.id),
			onDelete: () => onDelete(task.id),
		}))
	);

// AddForm
export const AddForm = (onAdd: (title: string) => void) => {
	const value = van.state('');
	return form({
		class: 'add-form',
		onsubmit: (e: Event) => {
			e.preventDefault();
			console.log('AddForm submit', value.val);
			if (value.val.trim()) {
				onAdd(value.val.trim());
				value.val = '';
			}
		},
	},
		label({ for: 'add-task-input' }, 'Add task:'),
		input({
			id: 'add-task-input',
			type: 'text',
			required: true,
			maxlength: 100,
			value,
			oninput: (e: Event) => (value.val = (e.target as HTMLInputElement).value),
			placeholder: 'What needs to be done?',
			autocomplete: 'off',
			tabindex: 0,
		}),
		button({ type: 'submit', tabindex: 0 }, 'Add')
	);
};

// Filters
export const Filters = () => {
	const state = getState();
	return div({},
		div({ class: 'search-container' },
			input({
				type: 'search',
				placeholder: 'Search tasks...',
				value: state.search,
				oninput: (e: Event) => setSearch((e.target as HTMLInputElement).value),
				tabindex: 0,
				'aria-label': 'Search tasks',
			})
		),
		div({ class: 'filters' },
			['all', 'active', 'completed'].map((f) =>
				button({
					class: state.filter === f ? 'active' : '',
					onclick: () => setFilter(f as any),
					tabindex: 0,
				}, f[0].toUpperCase() + f.slice(1))
			)
		)
	);
};

// Stats
export const Stats = () => {
	const state = getState();
	const total = state.tasks.length;
	const remaining = state.tasks.filter((t) => t.status !== 'completed').length;
	return div({ class: 'stats' },
		span({}, `Total: ${total}`),
		span({}, `Remaining: ${remaining}`)
	);
};
