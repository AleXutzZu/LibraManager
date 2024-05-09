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
    #[error("Authentication error")]
    AuthError,
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: serde::ser::Serializer, {
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
        pub client: Mutex<SqliteConnection>,
    }

    impl DatabaseConnection {
        pub fn from(url: &str) -> DatabaseConnection {
            DatabaseConnection {
                client: Mutex::from(establish_connection(url))
            }
        }
    }
}

pub mod settings {
    use std::fs::OpenOptions;
    use std::io::{Read, Write};
    use std::path::PathBuf;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct Settings {
        pub library_name: String,
        pub camera_device_id: Option<String>,
    }

    impl Default for Settings {
        fn default() -> Self {
            Self { library_name: "Librarie".to_string(), camera_device_id: None }
        }
    }

    pub struct SettingsLoader {
        path: PathBuf,
    }

    impl SettingsLoader {
        pub fn from(app_data_path: &PathBuf) -> Self {
            let mut npath = app_data_path.clone();
            npath.push("settings.toml");

            Self {
                path: npath
            }
        }

        pub fn load(&self) -> Result<Settings, std::io::Error> {
            match std::fs::File::open(&self.path) {
                Ok(mut config) => {
                    let mut contents: String = String::new();
                    config.read_to_string(&mut contents)?;

                    Ok(toml::from_str(&*contents).unwrap())
                }
                Err(ref e) if e.kind() == std::io::ErrorKind::NotFound => {
                    self.store(Settings::default())?;
                    Ok(Settings::default())
                }
                Err(e) => Err(e.into())
            }
        }

        pub fn store(&self, config: Settings) -> Result<(), std::io::Error> {
            let mut file = OpenOptions::new().write(true).create(true).open(&self.path)?;
            let data = toml::to_string_pretty(&config).unwrap();
            file.write_all(data.as_bytes())?;
            Ok(())
        }
    }
}