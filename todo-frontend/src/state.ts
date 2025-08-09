import type { Task } from './api/types';


type Filter = 'all' | 'active' | 'completed';

interface AuthState {
	token: string | null;
	user: { email: string; username?: string } | null;
}


interface State {
	tasks: Task[];
	filter: Filter;
	search: string;
	loading: boolean;
	error: string | null;
	auth: AuthState;
}

type Listener = (state: State) => void;


const initialState: State = {
	tasks: [],
	filter: 'all',
	search: '',
	loading: false,
	error: null,
	auth: {
		token: localStorage.getItem('jwt') || null,
		user: null,
	},
};
// Auth helpers
export function setToken(token: string | null) {
	state.auth.token = token;
	if (token) localStorage.setItem('jwt', token);
	else localStorage.removeItem('jwt');
	notify();
}

export function setUser(user: { email: string; username?: string } | null) {
	state.auth.user = user;
	notify();
}

export function logout() {
	setToken(null);
	setUser(null);
}

let state = { ...initialState };
const listeners: Listener[] = [];

export function subscribe(listener: Listener) {
	listeners.push(listener);
	listener(state);
	return () => {
		const idx = listeners.indexOf(listener);
		if (idx >= 0) listeners.splice(idx, 1);
	};
}

function notify() {
	listeners.forEach((l) => l(state));
}

export function setState(partial: Partial<State>) {
	state = { ...state, ...partial };
	notify();
}

export function getState(): State {
	return state;
}

// Task operations
export function setTasks(tasks: Task[]) {
	setState({ tasks });
}

export function addTask(task: Task) {
	setState({ tasks: [task, ...state.tasks] });
}

export function updateTask(task: Task) {
	setState({
		tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
	});
}

export function removeTask(id: string) {
	setState({ tasks: state.tasks.filter((t) => t.id !== id) });
}

export function setFilter(filter: Filter) {
	setState({ filter });
}

export function setSearch(search: string) {
	setState({ search });
}
