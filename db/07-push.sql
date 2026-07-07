-- Suscripciones Web Push (una por navegador/dispositivo de cada usuario).
-- El endpoint puede ser muy largo, así que se deduplica con su sha256.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id            VARCHAR(36)  NOT NULL,
  user_id       INT UNSIGNED NOT NULL,
  endpoint_hash CHAR(64)     NOT NULL,   -- sha256 hex del endpoint (dedup)
  endpoint      TEXT         NOT NULL,
  p256dh        VARCHAR(255) NOT NULL,
  auth          VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_push_endpoint (endpoint_hash),
  KEY idx_push_user (user_id),
  CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Marca el día en que ya se envió el recordatorio del aporte recurrente,
-- para no mandarlo dos veces el mismo día.
ALTER TABLE goals ADD COLUMN recurring_reminded_on DATE NULL;
