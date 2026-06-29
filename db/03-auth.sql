-- Sprout — columnas de autenticación en users.
SET NAMES utf8mb4;

ALTER TABLE users
  ADD COLUMN username      VARCHAR(40)  NULL AFTER name,
  ADD COLUMN password_hash VARCHAR(255) NULL AFTER email;

-- username único (permite NULL para cuentas solo-Google futuras).
ALTER TABLE users ADD UNIQUE KEY uq_users_username (username);

-- La cuenta demo (Mariana) recibe username; su password se fija por script.
UPDATE users SET username = 'mariana' WHERE id = 1 AND username IS NULL;
