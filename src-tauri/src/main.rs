// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command


use diesel::{OptionalExtension, QueryDsl, RunQueryDsl, SelectableHelper};
use tauri::{Manager, State};

use libra_manager::database::DatabaseConnection;
use libra_manager::Error::AuthError;
use libra_manager::models::database::{Book, Client, User};
use libra_manager::schema::books::dsl::books;
use libra_manager::SerializedResult;
use libra_manager::settings::SettingsLoader;
use diesel::associations::HasTable;
use libra_manager::schema::clients::dsl::clients;

#[tauri::command]
fn get_library(settings_loader: State<SettingsLoader>) -> String {
    let settings = settings_loader.load().unwrap();
    settings.library_name
}

#[tauri::command]
fn login(database: State<DatabaseConnection>, username: String, password: String) -> SerializedResult<User> {
    use libra_manager::schema::users::dsl::users;

    let client = &mut *database.client.lock().unwrap();

    let result: User = users.find(username).first(client)?;
    if result.password.eq(&password) {
        return Ok(result);
    }

    Err(AuthError)
}

#[tauri::command]
fn fetch_books(database: State<DatabaseConnection>) -> SerializedResult<Vec<Book>> {
    let client = &mut *database.client.lock().unwrap();
    let result = books.select(Book::as_select()).load(client)?;
    Ok(result)
}

#[tauri::command]
fn fetch_book(database: State<DatabaseConnection>, isbn: String) -> SerializedResult<Option<Book>> {
    let client = &mut *database.client.lock().unwrap();
    let result = books.find(isbn).get_result(client).optional()?;
    Ok(result)
}

#[tauri::command]
fn create_book(database: State<DatabaseConnection>, book: Book) -> SerializedResult<()> {
    let client = &mut *database.client.lock().unwrap();
    diesel::insert_into(books::table()).values(&book).execute(client)?;
    Ok(())
}

#[tauri::command]
fn fetch_clients(database: State<DatabaseConnection>) -> SerializedResult<Vec<Client>> {
    let client = &mut *database.client.lock().unwrap();
    let result = clients.select(Client::as_select()).load(client)?;
    Ok(result)
}

#[tauri::command]
fn fetch_client(database: State<DatabaseConnection>, id: String) -> SerializedResult<Option<Client>> {
    let client = &mut *database.client.lock().unwrap();
    let result = clients.find(id).get_result(client).optional()?;
    Ok(result)
}

#[tauri::command]
fn create_client(database: State<DatabaseConnection>, client: Client) -> SerializedResult<()> {
    let db_client = &mut *database.client.lock().unwrap();

    diesel::insert_into(clients::table()).values(&client).execute(db_client)?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_library,
            login,
            fetch_books,
            fetch_book,
            create_book,
            fetch_clients,
            fetch_client,
            create_client
        ]).
        setup(|app| {
            let mut app_data_path = app.path_resolver().app_data_dir().unwrap();

            if !app_data_path.exists() {
                std::fs::create_dir_all(&app_data_path).unwrap();
            }

            app.manage(SettingsLoader::from(&app_data_path));

            app_data_path.push("database");

            app.manage(DatabaseConnection::from(app_data_path.to_str().unwrap()));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
