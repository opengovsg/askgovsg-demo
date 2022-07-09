-- Initializes the app data models in the database
CREATE TABLE users
(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text
);