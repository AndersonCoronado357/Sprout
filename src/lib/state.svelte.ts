// Estado reactivo de la app. Los datos (goals/user) vienen del servidor (MySQL)
// vía el load de (app)/+layout.server.ts y se hidratan aquí. Las mutaciones
// pegan a la API y luego invalidateAll() refresca los datos.
//
// theme/cur son preferencias de UI y viven en localStorage (no en la BD).

import { invalidateAll } from '$app/navigation';
import type { Goal, GoalCategory, GoalIcon, GoalStatus } from './data/mock';
import type { CurrencyCode } from './format';

export type Theme = 'light' | 'dark';
export type UserInfo = {
	name: string;
	email: string;
	initials: string;
	streak: number;
	avatar?: string | null;
};

function loadTheme(): Theme {
	if (typeof localStorage === 'undefined') return 'dark';
	const saved = localStorage.getItem('sprout-theme');
	return saved === 'light' || saved === 'dark' ? saved : 'dark';
}
function loadCur(): CurrencyCode {
	if (typeof localStorage === 'undefined') return 'COP';
	const saved = localStorage.getItem('sprout-cur');
	if (saved === 'COP' || saved === 'USD' || saved === 'PEN' || saved === 'MXN' || saved === 'EUR')
		return saved;
	return 'COP';
}

let _goals = $state<Goal[]>([]);
let _user = $state<UserInfo>({ name: 'Usuario', email: '', initials: 'U', streak: 0 });
let _theme = $state<Theme>(loadTheme());
let _cur = $state<CurrencyCode>(loadCur());

function syncDocTheme(v: Theme) {
	if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', v);
	if (typeof localStorage !== 'undefined') localStorage.setItem('sprout-theme', v);
}

async function j(url: string, method: string, body?: unknown): Promise<Response> {
	return fetch(url, {
		method,
		headers: body ? { 'content-type': 'application/json' } : undefined,
		body: body ? JSON.stringify(body) : undefined
	});
}

export const appState = {
	get goals() {
		return _goals;
	},
	get user() {
		return _user;
	},

	// Reemplaza los datos con lo que devolvió el servidor.
	hydrate(user: UserInfo, goals: Goal[]) {
		_user = user;
		_goals = goals;
	},

	get theme(): Theme {
		return _theme;
	},
	set theme(v: Theme) {
		_theme = v;
		syncDocTheme(v);
	},
	get cur(): CurrencyCode {
		return _cur;
	},
	set cur(v: CurrencyCode) {
		_cur = v;
		if (typeof localStorage !== 'undefined') localStorage.setItem('sprout-cur', v);
	},

	goalById(id: string): Goal | undefined {
		return _goals.find((g) => g.id === id);
	},

	// ── Mutaciones (persisten en la BD, luego refrescan) ──────────────

	async addContrib(
		goalId: string,
		contrib: { amount: number; date: string; note?: string }
	): Promise<'completed' | true | false> {
		const res = await j(`/api/goals/${goalId}/contribs`, 'POST', contrib);
		if (!res.ok) return false;
		const data = await res.json();
		await invalidateAll();
		return data.completed ? 'completed' : true;
	},

	async addGoal(input: {
		name: string;
		cat: GoalCategory;
		icon: GoalIcon;
		target: number;
		date: string;
	}): Promise<Goal | null> {
		const res = await j('/api/goals', 'POST', input);
		if (!res.ok) return null;
		const data = await res.json();
		await invalidateAll();
		return data.goal ?? null;
	},

	async updateGoal(
		id: string,
		patch: Omit<Partial<Goal>, 'completedDate'> & { completedDate?: string | null }
	): Promise<void> {
		await j(`/api/goals/${id}`, 'PATCH', patch);
		await invalidateAll();
	},

	async deleteGoal(id: string): Promise<void> {
		await j(`/api/goals/${id}`, 'DELETE');
		await invalidateAll();
	},

	// Pausar / cancelar / reactivar una meta.
	async setStatus(id: string, status: GoalStatus): Promise<void> {
		await j(`/api/goals/${id}`, 'PATCH', { status });
		await invalidateAll();
	},

	// Editar perfil: nombre y/o foto (avatar como data URL, o null para quitar).
	async updateProfile(patch: { name?: string; avatar?: string | null }): Promise<boolean> {
		const res = await j('/api/profile', 'PATCH', patch);
		if (res.ok) await invalidateAll();
		return res.ok;
	},

	async setRecurring(
		goalId: string,
		recurring: { amount: number; every: string; next: string } | null
	): Promise<void> {
		await j(`/api/goals/${goalId}/recurring`, 'PUT', { recurring });
		await invalidateAll();
	},

	async updateContrib(
		id: string,
		patch: { amount?: number; date?: string; note?: string | null }
	): Promise<void> {
		await j(`/api/contribs/${id}`, 'PATCH', patch);
		await invalidateAll();
	},

	async deleteContrib(id: string): Promise<void> {
		await j(`/api/contribs/${id}`, 'DELETE');
		await invalidateAll();
	}
};
