-- Your SQL goes here
CREATE TABLE users (
    id INT UNIQUE PRIMARY KEY ,
    username VARCHAR NOT NULL ,
    firstName VARCHAR NOT NULL ,
    lastName VARCHAR NOT NULL
);

CREATE TABLE books (
    id INT UNIQUE PRIMARY KEY,
    title VARCHAR NOT NULL ,
    author VARCHAR NOT NULL
);

