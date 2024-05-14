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
    #[error(transparent)]
    Request(#[from] reqwest::Error),
    #[error(transparent)]
    Image(#[from] image::ImageError),
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
        pub camera_device_id: String,
    }

    impl Default for Settings {
        fn default() -> Self {
            Self { library_name: "Librarie".to_string(), camera_device_id: "".to_string() }
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

pub mod barcode {
    use barcoders::generators::image::{Image, Color, Rotation};
    use barcoders::sym::code128::Code128;
    use image::{Rgba, RgbaImage, GenericImage, ImageBuffer};
    use ab_glyph::{FontRef, PxScale};
    use barcoders::sym::ean13::EAN13;
    use imageproc::drawing::{draw_text_mut, draw_filled_rect_mut, text_size};
    use imageproc::rect::Rect;
    use chrono::NaiveDate;

    const BLACK: Rgba<u8> = Rgba::<u8>([0, 0, 0, 255]);
    const BADGE_WIDTH: u32 = 600u32;
    const BADGE_HEIGHT: u32 = 300u32;
    const BADGE_PADDING: u32 = 40u32;

    const ISBN_WIDTH: u32 = 220u32;
    const ISBN_HEIGHT: u32 = 100u32;
    const ISBN_PADDING: u32 = 1u32;

    const TITLE_SCALE: PxScale = PxScale {
        x: 24.0,
        y: 24.0,
    };
    const HEADING_SCALE: PxScale = PxScale {
        x: 18.0,
        y: 18.0,
    };
    const BODY_SCALE: PxScale = PxScale {
        x: 16.0,
        y: 16.0,
    };

    const ISBN_SCALE: PxScale = PxScale {
        x: 25.0,
        y: 25.0,
    };

    macro_rules! create_buffer {
        ($height:expr) => {
            Image::ImageBuffer {
                height: $height,
                xdim: 2,
                rotation: Rotation::Zero,
                foreground: Color::new([0, 0, 0, 255]),
                background: Color::new([255, 255, 255, 255]),
            }
        }
    }

    pub fn create_badge(client_id_short: &str, client_name: &str, library_name: &str, date: NaiveDate) -> ImageBuffer<Rgba<u8>, Vec<u8>> {
        let bold_font = FontRef::try_from_slice(include_bytes!("assets/bold_font.otf")).unwrap();
        let regular_font = FontRef::try_from_slice(include_bytes!("assets/regular_font.otf")).unwrap();

        let barcode = Code128::new(format!("\u{0181}{}", client_id_short)).unwrap();

        let buffer = create_buffer!(75);
        let encoded = barcode.encode();
        let barcode_image = buffer.generate_buffer(&encoded[..]).unwrap();

        let mut image = RgbaImage::new(BADGE_WIDTH, BADGE_HEIGHT);

        //border and background (black border and white background)
        draw_filled_rect_mut(&mut image, Rect::at(0, 0).of_size(BADGE_WIDTH, BADGE_HEIGHT), BLACK);
        draw_filled_rect_mut(&mut image, Rect::at(2, 2).of_size(BADGE_WIDTH - 4, BADGE_HEIGHT - 4), Rgba([255, 255, 255, 255]));

        //copying barcode into image
        image.copy_from(&barcode_image, (BADGE_WIDTH - barcode_image.width()) / 2, BADGE_HEIGHT - barcode_image.height() - BADGE_PADDING / 2).unwrap();

        let title = format!("Biblioteca {}", library_name);
        let (w, _) = text_size(TITLE_SCALE, &bold_font, &title);

        draw_text_mut(&mut image, BLACK, ((BADGE_WIDTH - w) / 2) as i32, 12, TITLE_SCALE, &bold_font, &title);
        draw_text_mut(&mut image, BLACK, BADGE_PADDING as i32, 80, HEADING_SCALE, &bold_font, "Nume complet");
        draw_text_mut(&mut image, BLACK, BADGE_PADDING as i32, 100, BODY_SCALE, &regular_font, client_name);

        let date_text = format!("{}", date.format("%d.%m.%Y"));

        let (w, _) = text_size(HEADING_SCALE, &bold_font, "Emis pe");
        draw_text_mut(&mut image, BLACK, (BADGE_WIDTH - BADGE_PADDING - w) as i32, 80, HEADING_SCALE, &bold_font, "Emis pe");
        let (w, _) = text_size(BODY_SCALE, &regular_font, &date_text);
        draw_text_mut(&mut image, BLACK, (BADGE_WIDTH - BADGE_PADDING - w) as i32, 100, BODY_SCALE, &regular_font, &date_text);
        return image;
    }

    pub fn create_isbn(isbn: &str) -> ImageBuffer<Rgba<u8>, Vec<u8>> {
        let bold_font = FontRef::try_from_slice(include_bytes!("assets/bold_font.otf")).unwrap();

        let barcode = EAN13::new(isbn).unwrap();
        let buffer = create_buffer!(75);

        let encoded = barcode.encode();
        let barcode_image = buffer.generate_buffer(&encoded[..]).unwrap();

        let mut image = RgbaImage::new(ISBN_WIDTH, ISBN_HEIGHT);

        draw_filled_rect_mut(&mut image, Rect::at(0, 0).of_size(ISBN_WIDTH, ISBN_HEIGHT), Rgba([255, 255, 255, 255]));

        image.copy_from(&barcode_image, (ISBN_WIDTH - barcode_image.width()) / 2, 0).unwrap();

        let (w, _) = text_size(ISBN_SCALE, &bold_font, isbn);
        draw_text_mut(&mut image, BLACK, ((ISBN_WIDTH - w) / 2) as i32, (barcode_image.height() + ISBN_PADDING) as i32, ISBN_SCALE, &bold_font, isbn);
        return image;
    }
}