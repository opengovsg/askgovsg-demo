-- Initializes the app data models in the database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE account (
  account_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_name text,
  account_password_hash text, -- Salt stored together with hash
  account_created_at timestamp default current_timestamp
);

CREATE TABLE question (
  question_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
  question_owner_id uuid REFERENCES account(account_id),
  question_title text,
  question_description text,
  question_created_at timestamp default current_timestamp
);

CREATE TABLE reply (
  reply_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
  reply_owner_id uuid REFERENCES account(account_id),
  question_id uuid REFERENCES question(question_id),
  reply_content text,
  reply_created_at timestamp default current_timestamp
);