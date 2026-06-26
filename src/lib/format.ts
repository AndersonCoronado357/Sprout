// Formato y cálculo portados 1:1 desde sprout-core.jsx.

export const CURRENCIES = {
	COP: { code: 'COP', symbol: '$', sep: '.', dec: ',', decimals: 0, locale: 'es-CO' },
	USD: { code: 'USD', symbol: 'US$', sep: ',', dec: '.', decimals: 0, locale: 'en-US' },
	PEN: { code: 'PEN', symbol: 'S/', sep: ',', dec: '.', decimals: 0, locale: 'es-PE' },
	MXN: { code: 'MXN', symbol: '$', sep: ',', dec: '.', decimals: 0, locale: 'es-MX' },
	EUR: { code: 'EUR', symbol: '€', sep: '.', dec: ',', decimals: 0, locale: 'es-ES' }
} as const;
export type CurrencyCode = keyof typeof CURRENCIES;

export const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const MES_LARGO = [
	'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
	'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export const TODAY = new Date('2026-06-09T12:00:00');
const MS_DAY = 86400000;

export function parseD(s: string | Date): Date {
	return s instanceof Date ? s : new Date(s + 'T12:00:00');
}

export function fmtMoney(n: number, cur: CurrencyCode = 'COP', opts: { noSymbol?: boolean } = {}): string {
	const c = CURRENCIES[cur] || CURRENCIES.COP;
	const neg = n < 0;
	const v = Math.round(Math.abs(n));
	const s = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, c.sep);
	const sym = opts.noSymbol ? '' : c.symbol + ' ';
	return (neg ? '−' : '') + sym + s;
}

export function fmtCompact(n: number, cur: CurrencyCode = 'COP'): string {
	const c = CURRENCIES[cur] || CURRENCIES.COP;
	const abs = Math.abs(n);
	if (abs >= 1000000) return c.symbol + ' ' + (n / 1000000).toFixed(abs % 1000000 === 0 ? 0 : 1).replace('.', c.dec) + 'M';
	if (abs >= 1000) return c.symbol + ' ' + Math.round(n / 1000) + 'k';
	return fmtMoney(n, cur);
}

export function fmtDate(s: string | Date, long = false): string {
	const d = parseD(s);
	if (long) return `${d.getDate()} de ${MES_LARGO[d.getMonth()]} de ${d.getFullYear()}`;
	return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDateShort(s: string | Date): string {
	const d = parseD(s);
	return `${d.getDate()} ${MES[d.getMonth()]}`;
}

export function daysBetween(a: string | Date, b: string | Date): number {
	return Math.max(0, Math.round((parseD(b).getTime() - parseD(a).getTime()) / MS_DAY));
}

export function relativeDays(target: string | Date): string {
	const d = daysBetween(TODAY, target);
	if (d === 0) return 'hoy';
	if (d < 7) return `en ${d} día${d === 1 ? '' : 's'}`;
	if (d < 31) {
		const w = Math.round(d / 7);
		return `en ${w} semana${w === 1 ? '' : 's'}`;
	}
	const m = Math.round(d / 30.44);
	return `en ${m} mes${m === 1 ? '' : 'es'}`;
}

import type { Goal } from '$lib/data/mock';

export function goalSaved(goal: { contribs?: { amount: number }[] }): number {
	return (goal.contribs || []).reduce((s, c) => s + c.amount, 0);
}

export function goalPct(goal: { contribs?: { amount: number }[]; target: number }): number {
	const s = goalSaved(goal);
	return goal.target > 0 ? Math.min(100, (s / goal.target) * 100) : 0;
}

// Una meta está "finalizada" si alcanzó el objetivo o si el usuario la cerró
// (completedDate se fija tanto al llegar al 100% como al cerrarla incompleta).
export function goalDone(goal: {
	contribs?: { amount: number }[];
	target: number;
	completedDate?: string;
}): boolean {
	return goalPct(goal) >= 100 || !!goal.completedDate;
}

export function suggestion(goal: { target: number; date: string | Date }, saved: number) {
	const remaining = Math.max(0, goal.target - saved);
	const days = daysBetween(TODAY, goal.date);
	const weeks = Math.max(1, days / 7);
	const months = Math.max(1, days / 30.44);
	return {
		remaining,
		perWeek: remaining / weeks,
		perMonth: remaining / months,
		days,
		onTrack: remaining === 0,
		overdue: days <= 0 && remaining > 0
	};
}

export function hueTint(hex: string, a: number): string {
	const h = hex.replace('#', '');
	if (h.length !== 6) return `rgba(31,169,74,${a})`;
	const r = parseInt(h.slice(0, 2), 16),
		g = parseInt(h.slice(2, 4), 16),
		b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r},${g},${b},${a})`;
}
