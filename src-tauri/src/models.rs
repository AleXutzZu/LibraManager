pub mod database {
    use diesel::{Queryable, Selectable};
    use diesel::prelude::*;
    use serde::{Deserialize, Serialize};

    #[derive(Queryable, Selectable, Serialize, Deserialize, Insertable)]
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

pub mod book_api {
    use reqwest::StatusCode;
    use serde::{Deserialize, Serialize};
    use serde::de::DeserializeOwned;

    use crate::SerializedResult;

    #[derive(Deserialize, Debug)]
    struct OpenLibraryKey {
        pub key: String,
    }

    impl OpenLibraryKey {
        async fn fetch_data<T: DeserializeOwned>(&self) -> SerializedResult<T> {
            let author_data = reqwest::get(format!("https://openlibrary.org{}.json", self.key))
                .await?
                .json::<T>()
                .await?;
            Ok(author_data)
        }
    }

    #[derive(Deserialize)]
    struct WorkAuthor {
        pub author: OpenLibraryKey,
    }

    #[derive(Deserialize)]
    struct Work {
        pub authors: Option<Vec<WorkAuthor>>,
    }

    #[derive(Deserialize, Debug)]
    struct OpenLibraryBookData {
        pub title: String,
        pub covers: Option<Vec<i64>>,
        pub publish_date: String,
        pub authors: Option<Vec<OpenLibraryKey>>,
        pub works: Option<Vec<OpenLibraryKey>>,
        pub number_of_pages: Option<i64>,
        pub isbn_13: Vec<String>,
    }

    impl OpenLibraryBookData {
        pub async fn get_authors(&self) -> SerializedResult<Option<Vec<Author>>> {
            if let Some(x) = &self.authors {
                let mut result: Vec<Author> = Vec::new();

                for key in x {
                    result.push(key.fetch_data::<Author>().await?);
                }

                Ok(Some(result))
            } else if let Some(x) = &self.works {
                let mut works: Vec<Work> = Vec::new();

                for key in x {
                    works.push(key.fetch_data::<Work>().await?);
                }

                let count_none = works.iter().fold(0, |cnt, val| {
                    if let Some(_x) = &val.authors {
                        cnt
                    } else {
                        cnt + 1
                    }
                });

                if count_none == works.len() {
                    return Ok(None);
                }

                let mut result: Vec<Author> = Vec::new();

                for work in works {
                    if let Some(x) = &work.authors {
                        for work_author in x {
                            result.push(work_author.author.fetch_data::<Author>().await?);
                        }
                    }
                }

                Ok(Some(result))
            } else {
                Ok(None)
            }
        }
    }

    #[derive(Deserialize, Serialize, Debug)]
    pub struct Author {
        pub name: String,
    }

    #[derive(Serialize, Debug)]
    #[serde(rename_all = "camelCase")]
    pub struct BookData {
        pub title: String,
        pub covers: Option<Vec<i64>>,
        pub publish_date: String,
        pub authors: Option<Vec<Author>>,
        pub number_of_pages: Option<i64>,
        pub isbn_13: Vec<String>,
    }

    impl BookData {
        async fn from(open_library_book_data: OpenLibraryBookData) -> SerializedResult<Self> {
            let authors = open_library_book_data.get_authors().await?;

            Ok(Self {
                title: open_library_book_data.title,
                covers: open_library_book_data.covers,
                publish_date: open_library_book_data.publish_date,
                authors,
                number_of_pages: open_library_book_data.number_of_pages,
                isbn_13: open_library_book_data.isbn_13,
            })
        }
    }

    pub async fn fetch_book(isbn: String) -> SerializedResult<Option<BookData>> {
        let response = reqwest::get(format!("https://openlibrary.org/isbn/{}.json", isbn))
            .await?;
        return match response.status() {
            StatusCode::OK => {
                let data = response.json::<OpenLibraryBookData>().await?;
                let book = BookData::from(data).await?;
                Ok(Some(book))
            }
            _ => Ok(None)
        };
    }
}