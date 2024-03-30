pub mod schema;
pub mod models;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Diesel(#[from] diesel::result::Error),
    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

pub type SerializedResult<T> = Result<T, Error>;

pub mod database {
    use std::sync::Mutex;
    use diesel::{Connection, SqliteConnection};
    use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

    const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

    pub fn establish_connection(database_url: &str) -> SqliteConnection {
        let mut connection = SqliteConnection::establish(database_url)
            .unwrap_or_else(|_| panic!("Error connecting to {}", database_url));

        connection.run_pending_migrations(MIGRATIONS).unwrap();

        return connection;
    }

    pub struct DatabaseConnection {
        client: Mutex<SqliteConnection>
    }

    impl DatabaseConnection {
        pub fn new() ->DatabaseConnection {
            DatabaseConnection {
                client: Mutex::from(establish_connection("libra-manager"))
            }
        }
    }
}