-- Your SQL goes here
CREATE TABLE borrows
(
    id        INT     NOT NULL UNIQUE PRIMARY KEY,
    clientID  VARCHAR NOT NULL,
    bookISBN  VARCHAR NOT NULL,
    startDate TEXT    NOT NULL,
    endDate   TEXT    NOT NULL,
    returned  INT     NOT NULL,
    FOREIGN KEY (clientID) REFERENCES clients (id),
    FOREIGN KEY (bookISBN) REFERENCES books (isbn)
);

INSERT INTO clients(id, firstName, lastName, email, phone)
VALUES ('ea25ee6d-adaa-4256-9101-6d1e80dbf221', 'Alex', 'David', 'davidalexrobertyt@gmail.com', '0758061633');

INSERT INTO borrows (id, clientID, bookISBN, startDate, endDate, returned)
VALUES (1, 'ea25ee6d-adaa-4256-9101-6d1e80dbf221', '9787940073295', '05-06-2024', '19-06-2024', 0);