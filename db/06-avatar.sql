-- Foto de perfil del usuario. Se guarda como data URL (base64) redimensionada
-- a ~256px en el cliente, así que MEDIUMTEXT sobra.
ALTER TABLE users
  ADD COLUMN avatar MEDIUMTEXT NULL AFTER initials;
