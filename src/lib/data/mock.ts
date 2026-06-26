// Datos de ejemplo portados 1:1 del diseño Claude Design (sprout-data.jsx).

export type Contrib = { id: string; amount: number; date: string; note?: string };
export type GoalCategory = 'viaje' | 'equipo' | 'emergencia' | 'hogar' | 'salud' | 'otro';
export type GoalStatus = 'active' | 'paused' | 'cancelled';
export type GoalIcon =
	| 'target'
	| 'wallet'
	| 'leaf'
	| 'flame'
	| 'repeat'
	| 'note'
	| 'coins'
	| 'calendar'
	| 'sprout'
	| 'home';
export type Goal = {
	id: string;
	name: string;
	cat: GoalCategory;
	icon: GoalIcon;
	target: number;
	date: string;
	created: string;
	recurring: { amount: number; every: 'semana' | 'quincena' | 'mes'; next: string } | null;
	completedDate?: string;
	status?: GoalStatus;
	contribs: Contrib[];
};

export const USER = { name: 'Mariana Ríos', email: 'mariana@correo.com', initials: 'MR', streak: 6 };

export const GOALS: Goal[] = [
	{
		id: 'g1',
		name: 'Viaje a San Andrés',
		cat: 'viaje',
		icon: 'target',
		target: 4000000,
		date: '2026-12-15',
		created: '2026-01-20',
		recurring: { amount: 200000, every: 'semana', next: '2026-06-15' },
		contribs: [
			{ id: 'c1', amount: 600000, date: '2026-02-01', note: 'Prima de fin de año que guardé' },
			{ id: 'c2', amount: 500000, date: '2026-03-05' },
			{ id: 'c3', amount: 450000, date: '2026-04-02', note: 'Vendí la bici vieja' },
			{ id: 'c4', amount: 550000, date: '2026-05-01' },
			{ id: 'c5', amount: 500000, date: '2026-06-02', note: 'Aporte de junio' }
		]
	},
	{
		id: 'g2',
		name: 'MacBook para diseño',
		cat: 'equipo',
		icon: 'wallet',
		target: 6500000,
		date: '2026-10-01',
		created: '2026-02-10',
		recurring: null,
		contribs: [
			{ id: 'c6', amount: 800000, date: '2026-02-15' },
			{ id: 'c7', amount: 600000, date: '2026-03-20', note: 'Freelance del logo' },
			{ id: 'c8', amount: 550000, date: '2026-05-10' }
		]
	},
	{
		id: 'g3',
		name: 'Fondo de emergencia',
		cat: 'emergencia',
		icon: 'flame',
		target: 3000000,
		date: '2027-03-01',
		created: '2026-03-01',
		recurring: { amount: 150000, every: 'semana', next: '2026-06-12' },
		contribs: [
			{ id: 'c9', amount: 400000, date: '2026-03-15' },
			{ id: 'c10', amount: 400000, date: '2026-04-15' },
			{ id: 'c11', amount: 400000, date: '2026-05-15', note: 'Constante' }
		]
	},
	{
		id: 'g4',
		name: 'Bici nueva',
		cat: 'salud',
		icon: 'repeat',
		target: 2200000,
		date: '2026-08-20',
		created: '2026-04-01',
		recurring: null,
		contribs: [
			{ id: 'c12', amount: 500000, date: '2026-04-10' },
			{ id: 'c13', amount: 380000, date: '2026-05-12' }
		]
	},
	{
		id: 'g5',
		name: 'Curso de fotografía',
		cat: 'otro',
		icon: 'note',
		target: 900000,
		date: '2026-05-01',
		created: '2026-01-05',
		recurring: null,
		completedDate: '2026-04-22',
		contribs: [
			{ id: 'c14', amount: 300000, date: '2026-01-20' },
			{ id: 'c15', amount: 300000, date: '2026-02-25' },
			{ id: 'c16', amount: 300000, date: '2026-04-22', note: '¡Ya alcanza! Me inscribo.' }
		]
	},
	{
		id: 'g6',
		name: 'Regalo de aniversario',
		cat: 'hogar',
		icon: 'leaf',
		target: 600000,
		date: '2026-03-10',
		created: '2025-12-15',
		recurring: null,
		completedDate: '2026-03-04',
		contribs: [
			{ id: 'c17', amount: 200000, date: '2025-12-20' },
			{ id: 'c18', amount: 200000, date: '2026-01-28' },
			{ id: 'c19', amount: 200000, date: '2026-03-04' }
		]
	}
];

export const CATS: Record<
	GoalCategory,
	{ label: string; hue: string }
> = {
	viaje: { label: 'Viaje', hue: '#2E86C9' },
	equipo: { label: 'Equipo', hue: '#C9663C' },
	emergencia: { label: 'Emergencia', hue: '#C9961A' },
	hogar: { label: 'Hogar', hue: '#8A4F9E' },
	salud: { label: 'Salud', hue: '#1F9E8E' },
	otro: { label: 'Otro', hue: '#6E7D72' }
};
