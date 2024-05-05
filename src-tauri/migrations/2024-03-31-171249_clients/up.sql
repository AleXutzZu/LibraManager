-- Your SQL goes here

CREATE TABLE clients
(
    id        VARCHAR UNIQUE NOT NULL PRIMARY KEY,
    firstName VARCHAR        NOT NULL,
    lastName  VARCHAR        NOT NULL,
    email     VARCHAR UNIQUE NOT NULL,
    phone     VARCHAR UNIQUE NOT NULL
);