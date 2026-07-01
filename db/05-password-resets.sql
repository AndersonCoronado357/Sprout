-- Tokens de recuperación de contraseña. Se guarda el SHA-256 del token
-- (no el token en claro); el enlace del correo lleva el token en claro.
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash  CHAR(64)     NOT NULL,   -- sha256 hex del token enviado
  user_id     INT UNSIGNED NOT NULL,
  expires_at  DATETIME     NOT NULL,
  used_at     DATETIME     NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token_hash),
  KEY idx_pr_user (user_id),
  CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
