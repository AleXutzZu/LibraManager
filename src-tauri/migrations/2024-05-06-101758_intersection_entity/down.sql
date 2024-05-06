-- This file should undo anything in `up.sql`
DROP TABLE borrows;

DELETE FROM clients WHERE id IS 'ea25ee6d-adaa-4256-9101-6d1e80dbf221';