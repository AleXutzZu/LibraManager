pub mod database {
    use diesel::{Queryable, Selectable};
    use serde::{Deserialize, Serialize};
    use diesel::prelude::*;

    #[derive(Queryable, Selectable, Serialize, Insertable)]
    #[diesel(table_name = crate::schema::users)]
    #[diesel(check_for_backend(diesel::sqlite::Sqlite))]
    #[serde(rename_all = "camelCase")]
    pub struct User {
        pub username: String,
        #[serde(skip_serializing)]
        pub password: String,
        #[diesel(column_name = firstName)]
        pub first_name: String,
        #[diesel(column_name = lastName)]
        pub last_name: String,
        pub role: String,

    }
    #[derive(Identifiable, AsChangeset, Deserialize)]
    #[serde(rename_all = "camelCase")]
    #[diesel(primary_key(username))]
    #[diesel(table_name = crate::schema::users)]
    #[diesel(check_for_backend(diesel::sqlite::Sqlite))]
    pub struct UpdateUser {
        pub username: String,
        #[diesel(column_name = firstName)]
        pub first_name: String,
        #[diesel(column_name = lastName)]
        pub last_name: String,
        pub password: Option<String>,
    }

    #[derive(Queryable, Selectable, Serialize, Insertable, Deserialize, Identifiable, AsChangeset)]
    #[diesel(table_name = crate::schema::books)]
    #[diesel(check_for_backend(diesel::sqlite::Sqlite))]
    #[diesel(primary_key(isbn))]
    pub struct Book {
        pub isbn: String,
        pub title: String,
        pub author: String,
        pub items: i32,
    }

    #[derive(Queryable, Selectable, Serialize, Insertable, Deserialize, Identifiable, AsChangeset)]
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

    #[derive(Queryable, Selectable, Associations, Serialize, Identifiable)]
    #[diesel(belongs_to(Book, foreign_key = bookISBN))]
    #[diesel(belongs_to(Client, foreign_key = clientID))]
    #[serde(rename_all = "camelCase")]
    #[diesel(table_name = crate::schema::borrows)]
    #[diesel(check_for_backend(diesel::sqlite::Sqlite))]
    pub struct Borrow {
        pub id: i32,
        #[diesel(column_name = clientID)]
        pub client_id: String,
        #[diesel(column_name = bookISBN)]
        pub book_isbn: String,
        #[diesel(column_name = startDate)]
        pub start_date: chrono::NaiveDate,
        #[diesel(column_name = endDate)]
        pub end_date: chrono::NaiveDate,
        pub returned: bool,
    }

    #[derive(Insertable, Deserialize)]
    #[diesel(check_for_backend(diesel::sqlite::Sqlite))]
    #[diesel(table_name = crate::schema::borrows)]
    pub struct NewBorrow<'a> {
        #[diesel(column_name = clientID)]
        pub client_id: &'a str,
        #[diesel(column_name = bookISBN)]
        pub book_isbn: &'a str,
        #[diesel(column_name = startDate)]
        pub start_date: chrono::NaiveDate,
        #[diesel(column_name = endDate)]
        pub end_date: chrono::NaiveDate,
        pub returned: bool,
    }

    pub mod joined_data {
        use serde::Serialize;
        use crate::models::database::{Book, Borrow, Client};

        #[derive(Serialize)]
        pub struct BookBorrow {
            pub book: Book,
            pub borrow: Borrow,
        }

        #[derive(Serialize)]
        pub struct ClientBorrow {
            pub client: Client,
            pub borrow: Borrow,
        }
    }
}