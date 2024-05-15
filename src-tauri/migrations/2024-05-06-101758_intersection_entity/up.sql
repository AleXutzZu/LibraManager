-- Your SQL goes here
CREATE TABLE borrows
(
    id        INTEGER     NOT NULL UNIQUE PRIMARY KEY,
    clientID  VARCHAR NOT NULL,
    bookISBN  VARCHAR NOT NULL,
    startDate TEXT    NOT NULL,
    endDate   TEXT    NOT NULL,
    returned  INT     NOT NULL,
    FOREIGN KEY (clientID) REFERENCES clients (id) ON DELETE CASCADE,
    FOREIGN KEY (bookISBN) REFERENCES books (isbn) ON DELETE CASCADE
);