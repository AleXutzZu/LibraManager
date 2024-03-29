// @generated automatically by Diesel CLI.

diesel::table! {
    books (id) {
        id -> Nullable<Integer>,
        title -> Text,
        author -> Text,
    }
}

diesel::table! {
    users (id) {
        id -> Nullable<Integer>,
        username -> Text,
        firstName -> Text,
        lastName -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    books,
    users,
);
