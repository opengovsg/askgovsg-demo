-- Initializes the app data models in the database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE account
(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text
);