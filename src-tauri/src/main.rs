// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use diesel::{debug_query, RunQueryDsl};
use diesel::sqlite::Sqlite;
use tauri::{Manager, State};

use libra_manager::database::DatabaseConnection;
use libra_manager::Error::AuthError;
use libra_manager::models::database::{Book, Client, User};
use libra_manager::SerializedResult;
use libra_manager::settings::SettingsLoader;

#[tauri::command]
fn get_library(settings_loader: State<SettingsLoader>) -> String {
    let settings = settings_loader.load().unwrap();
    settings.library_name
}

#[tauri::command]
fn login(database: State<DatabaseConnection>, username: String, password: String) -> SerializedResult<User> {
    use libra_manager::schema::users::dsl::users;
    use diesel::{RunQueryDsl, QueryDsl};

    let client = &mut *database.client.lock().unwrap();

    let result: User = users.find(username).first(client)?;
    if result.password.eq(&password) {
        return Ok(result);
    }

    Err(AuthError)
}

#[tauri::command]
fn fetch_books(database: State<DatabaseConnection>) -> SerializedResult<Vec<Book>> {
    use libra_manager::schema::books::dsl::*;
    use diesel::{QueryDsl, SelectableHelper, RunQueryDsl};

    let client = &mut *database.client.lock().unwrap();
    let result = books.select(Book::as_select()).load(client)?;
    Ok(result)
}

#[tauri::command]
fn fetch_book(database: State<DatabaseConnection>, isbn: String) -> SerializedResult<Option<Book>> {
    use libra_manager::schema::books::dsl::books;
    use diesel::{QueryDsl, RunQueryDsl, OptionalExtension};

    let client = &mut *database.client.lock().unwrap();
    let result = books.find(isbn).get_result(client).optional()?;
    Ok(result)
}

#[tauri::command]
fn create_book(database: State<DatabaseConnection>, book: Book) -> SerializedResult<()> {
    use libra_manager::schema::books::dsl::*;
    use diesel::RunQueryDsl;
    use diesel::associations::HasTable;

    let client = &mut *database.client.lock().unwrap();
    diesel::insert_into(books::table()).values(&book).execute(client)?;
    Ok(())
}

#[tauri::command]
fn fetch_clients(database: State<DatabaseConnection>) -> SerializedResult<Vec<Client>> {
    use libra_manager::schema::clients::dsl::*;
    use diesel::{QueryDsl, SelectableHelper, RunQueryDsl};

    let client = &mut *database.client.lock().unwrap();
    let result = clients.select(Client::as_select()).load(client)?;
    Ok(result)
}

#[tauri::command]
fn fetch_client(database: State<DatabaseConnection>, id: String) -> SerializedResult<Option<Client>> {
    use libra_manager::schema::clients::dsl::clients;
    use diesel::{QueryDsl, RunQueryDsl, OptionalExtension};

    let client = &mut *database.client.lock().unwrap();
    let result = clients.find(id).get_result(client).optional()?;
    Ok(result)
}

#[tauri::command]
fn create_client(database: State<DatabaseConnection>, client: Client) -> SerializedResult<()> {
    use libra_manager::schema::clients::dsl::*;
    use diesel::RunQueryDsl;
    use diesel::associations::HasTable;

    let db_client = &mut *database.client.lock().unwrap();

    diesel::insert_into(clients::table()).values(&client).execute(db_client)?;
    Ok(())
}

#[tauri::command]
fn delete_client(database: State<DatabaseConnection>, id: String) -> SerializedResult<()> {
    use libra_manager::schema::clients::dsl::clients;
    use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
    let client = &mut *database.client.lock().unwrap();

    let client_id = id;

    diesel::delete(clients.filter(libra_manager::schema::clients::id.eq(client_id))).execute(client)?;
    Ok(())
}

#[tauri::command]
fn update_client(database: State<DatabaseConnection>, client: Client) -> SerializedResult<()> {
    use libra_manager::schema::clients::dsl::*;
    let db_client = &mut *database.client.lock().unwrap();

    diesel::update(&client).set(&client).execute(db_client)?;
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
            create_client,
            delete_client,
            update_client
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
