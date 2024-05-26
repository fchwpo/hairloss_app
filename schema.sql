CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  imgur_url TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  prediction TEXT
);
