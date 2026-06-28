-- Sprout — esquema MySQL 8 (utf8mb4).
-- Se aplica a la BD `sprout`. Reutilizable en local y en acmsy (db-sprout).

SET NAMES utf8mb4;

-- Usuarios. Por ahora un solo usuario (auth real es fase aparte).
CREATE TABLE IF NOT EXISTS users (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name     VARCHAR(120)  NOT NULL,
  email    VARCHAR(190)  NOT NULL,
  initials VARCHAR(8)    NOT NULL DEFAULT '',
  streak   INT           NOT NULL DEFAULT 0,
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Metas de ahorro.
CREATE TABLE IF NOT EXISTS goals (
  id              VARCHAR(32)  NOT NULL,
  user_id         INT UNSIGNED NOT NULL,
  name            VARCHAR(160) NOT NULL,
  cat             ENUM('viaje','equipo','emergencia','hogar','salud','otro') NOT NULL DEFAULT 'otro',
  icon            VARCHAR(24)  NOT NULL DEFAULT 'target',
  target          BIGINT       NOT NULL,
  target_date     DATE         NOT NULL,
  created_date    DATE         NOT NULL,
  completed_date  DATE         NULL,
  status          ENUM('active','paused','cancelled') NOT NULL DEFAULT 'active',
  recurring_amount BIGINT      NULL,
  recurring_every  VARCHAR(16) NULL,   -- semana | quincena | mes
  recurring_next   DATE        NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_goals_user (user_id),
  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Aportes (positivos) y retiros (negativos) de cada meta.
CREATE TABLE IF NOT EXISTS contribs (
  id           VARCHAR(32)  NOT NULL,
  goal_id      VARCHAR(32)  NOT NULL,
  amount       BIGINT       NOT NULL,   -- puede ser negativo (retiro)
  occurred_on  DATE         NOT NULL,
  note         VARCHAR(255) NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contribs_goal (goal_id),
  CONSTRAINT fk_contribs_goal FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
