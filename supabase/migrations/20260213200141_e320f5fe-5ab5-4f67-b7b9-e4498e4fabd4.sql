-- Remove duplicate trigger causing double profile creation
DROP TRIGGER IF EXISTS auth_on_new_user ON auth.users;