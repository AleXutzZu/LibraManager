// @generated automatically by Diesel CLI.

diesel::table! {
    books (isbn) {
        isbn -> Text,
        title -> Text,
        author -> Text,
        items -> Integer,
    }
}

diesel::table! {
    borrows (id) {
        id -> Integer,
        clientID -> Text,
        bookISBN -> Text,
        startDate -> Text,
        endDate -> Text,
        returned -> Bool,
    }
}

diesel::table! {
    clients (id) {
        id -> Text,
        firstName -> Text,
        lastName -> Text,
        email -> Text,
        phone -> Text,
    }
}

diesel::table! {
    users (username) {
        username -> Text,
        password -> Text,
        firstName -> Text,
        lastName -> Text,
        role -> Text,
    }
}

diesel::joinable!(borrows -> books (bookISBN));
diesel::joinable!(borrows -> clients (clientID));

diesel::allow_tables_to_appear_in_same_query!(
    books,
    borrows,
    clients,
    users,
);
