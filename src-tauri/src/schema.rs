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
    clients (id) {
        id -> Integer,
        firstName -> Text,
        lastName -> Text,
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

diesel::allow_tables_to_appear_in_same_query!(
    books,
    clients,
    users,
);
