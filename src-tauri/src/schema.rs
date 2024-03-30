// @generated automatically by Diesel CLI.

diesel::table! {
    books (id) {
        id -> Integer,
        title -> Text,
        author -> Text,
    }
}

diesel::table! {
    users (id) {
        id -> Integer,
        username -> Text,
        firstName -> Text,
        lastName -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    books,
    users,
);
