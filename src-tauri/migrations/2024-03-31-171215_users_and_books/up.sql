-- Your SQL goes here
-- Your SQL goes here
CREATE TABLE users
(
    username  VARCHAR NOT NULL PRIMARY KEY,
    password  VARCHAR NOT NULL,
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

INSERT INTO users(username, password, firstName, lastName, role)
VALUES ('admin', 'admin', 'admin', 'admin', 'admin');