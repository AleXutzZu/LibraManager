// @generated automatically by Diesel CLI.

diesel::table! {
    books (id) {
        id -> Integer,
        title -> Text,
        author -> Text,
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
