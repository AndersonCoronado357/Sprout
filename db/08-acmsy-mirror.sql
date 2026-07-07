-- Espejo de usuarios/logins hacia el formato que lee el panel de acmsy
-- (`GET /api/databases/db-sprout/users` y `.../logins` leen estas tablas).
-- Sprout mantiene su propia tabla `users`; aquí se replican para que acmsy los vea.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS auth_users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255),
  name           VARCHAR(255),
  google_id      VARCHAR(255),
  email_verified TINYINT(1) DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at  DATETIME NULL,
  last_seen_at   DATETIME NULL,
  login_count    INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_logins (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  method     VARCHAR(40),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_auth_logins_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backfill: replica los usuarios que ya existen en `users`.
INSERT INTO auth_users (email, name, password_hash, email_verified, created_at)
SELECT LOWER(email), name, password_hash, 1, created_at FROM users
ON DUPLICATE KEY UPDATE name = VALUES(name);
