-- Your SQL goes here
CREATE TABLE users
(
    username  VARCHAR NOT NULL PRIMARY KEY,
    firstName VARCHAR NOT NULL,
    lastName  VARCHAR NOT NULL,
    role      VARCHAR NOT NULL CHECK ( role IN ('admin', 'user'))
);

CREATE TABLE books
(
    id     INT UNIQUE PRIMARY KEY NOT NULL,
    title  VARCHAR                NOT NULL,
    author VARCHAR                NOT NULL
);
