-- Your SQL goes here

CREATE TABLE clients
(
    id INT UNIQUE NOT NULL PRIMARY KEY,
    firstName VARCHAR NOT NULL ,
    lastName VARCHAR NOT NULL
);