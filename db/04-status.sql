-- Estado de la meta: activa (normal), pausada (congelada temporalmente) o
-- cancelada (archivada). "completada" no es un estado aquí: se deriva de
-- completed_date / progreso >= objetivo.
ALTER TABLE goals
  ADD COLUMN status ENUM('active', 'paused', 'cancelled') NOT NULL DEFAULT 'active'
  AFTER completed_date;
