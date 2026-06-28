-- Sprout — seed inicial (idéntico al mock de diseño).
-- Idempotente: limpia y repuebla. Solo para el arranque / demo.

SET NAMES utf8mb4;

DELETE FROM contribs;
DELETE FROM goals;
DELETE FROM users;

-- Cuenta demo: mariana / sprout123 (hash scrypt fijo para el seed).
INSERT INTO users (id, name, username, email, initials, streak, password_hash) VALUES
  (1, 'Mariana Ríos', 'mariana', 'mariana@correo.com', 'MR', 6,
   'scrypt$8da8c02b7d2e2212afe679e02dc83a26$756927b94914c187dde816e82cde91c988b61c86c5eec269614209f0e36067272a89e4d623ef7413bbba08be2a3fa740635e56ca2c85d8275c257e663ea69b8d');

INSERT INTO goals
  (id, user_id, name, cat, icon, target, target_date, created_date, completed_date, recurring_amount, recurring_every, recurring_next)
VALUES
  ('g1', 1, 'Viaje a San Andrés',    'viaje',      'target', 4000000, '2026-12-15', '2026-01-20', NULL,         200000, 'semana', '2026-06-15'),
  ('g2', 1, 'MacBook para diseño',   'equipo',     'wallet', 6500000, '2026-10-01', '2026-02-10', NULL,         NULL,   NULL,     NULL),
  ('g3', 1, 'Fondo de emergencia',   'emergencia', 'flame',  3000000, '2027-03-01', '2026-03-01', NULL,         150000, 'semana', '2026-06-12'),
  ('g4', 1, 'Bici nueva',            'salud',      'repeat', 2200000, '2026-08-20', '2026-04-01', NULL,         NULL,   NULL,     NULL),
  ('g5', 1, 'Curso de fotografía',   'otro',       'note',    900000, '2026-05-01', '2026-01-05', '2026-04-22', NULL,   NULL,     NULL),
  ('g6', 1, 'Regalo de aniversario', 'hogar',      'leaf',    600000, '2026-03-10', '2025-12-15', '2026-03-04', NULL,   NULL,     NULL);

INSERT INTO contribs (id, goal_id, amount, occurred_on, note) VALUES
  ('c1',  'g1', 600000, '2026-02-01', 'Prima de fin de año que guardé'),
  ('c2',  'g1', 500000, '2026-03-05', NULL),
  ('c3',  'g1', 450000, '2026-04-02', 'Vendí la bici vieja'),
  ('c4',  'g1', 550000, '2026-05-01', NULL),
  ('c5',  'g1', 500000, '2026-06-02', 'Aporte de junio'),
  ('c6',  'g2', 800000, '2026-02-15', NULL),
  ('c7',  'g2', 600000, '2026-03-20', 'Freelance del logo'),
  ('c8',  'g2', 550000, '2026-05-10', NULL),
  ('c9',  'g3', 400000, '2026-03-15', NULL),
  ('c10', 'g3', 400000, '2026-04-15', NULL),
  ('c11', 'g3', 400000, '2026-05-15', 'Constante'),
  ('c12', 'g4', 500000, '2026-04-10', NULL),
  ('c13', 'g4', 380000, '2026-05-12', NULL),
  ('c14', 'g5', 300000, '2026-01-20', NULL),
  ('c15', 'g5', 300000, '2026-02-25', NULL),
  ('c16', 'g5', 300000, '2026-04-22', '¡Ya alcanza! Me inscribo.'),
  ('c17', 'g6', 200000, '2025-12-20', NULL),
  ('c18', 'g6', 200000, '2026-01-28', NULL),
  ('c19', 'g6', 200000, '2026-03-04', NULL);
