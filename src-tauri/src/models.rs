pub mod database {
    use diesel::{Queryable, Selectable};
    use serde::Serialize;
    use diesel::prelude::*;

    #[derive(Queryable, Selectable, Serialize, Insertable)]
    #[diesel(table_name = crate::schema::users)]
    #[diesel(check_for_backend(diesel::sqlite::Sqlite))]
    #[serde(rename_all = "camelCase")]
    pub struct User {
        pub username: String,
        #[diesel(column_name = firstName)]
        pub first_name: String,
        #[diesel(column_name = lastName)]
        pub last_name: String,
        pub role: String,
        #[serde(skip_serializing)]
        pub password: String,
    }

    #[derive(Queryable, Selectable, Serialize, Insertable)]
    #[diesel(table_name = crate::schema::books)]
    #[diesel(check_for_backend(diesel::sqlite::Sqlite))]
    pub struct Book {
        pub isbn: String,
        pub title: String,
        pub author: String,
        pub items: i32,
    }

    #[derive(Queryable, Selectable, Serialize, Insertable)]
    #[diesel(table_name = crate::schema::clients)]
    #[diesel(check_for_backend(diesel::sqlite::Sqlite))]
    #[serde(rename_all = "camelCase")]
    pub struct Client {
        pub id: String,
        #[diesel(column_name = firstName)]
        pub first_name: String,
        #[diesel(column_name = lastName)]
        pub last_name: String,
        pub email: String,
        pub phone: String,
    }
}