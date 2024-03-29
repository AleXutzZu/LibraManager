-- Your SQL goes here
CREATE TABLE users (
    id SERIAL PRIMARY KEY ,
    username VARCHAR NOT NULL ,
    firstName VARCHAR NOT NULL ,
    lastName VARCHAR NOT NULL
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL ,
    author VARCHAR NOT NULL
);

