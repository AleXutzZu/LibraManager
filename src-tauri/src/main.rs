// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use chrono::{Days, Local, NaiveDate};
use tauri::{Manager, State};

use libra_manager::database::DatabaseConnection;
use libra_manager::Error::AuthError;
use libra_manager::models::database::{Book, Borrow, Client, NewBorrow, User};
use libra_manager::models::database::joined_data::{BookBorrow, ClientBorrow};
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
fn delete_book(database: State<DatabaseConnection>, isbn: String) -> SerializedResult<()> {
    use libra_manager::schema::books::dsl::books;
    use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
    let client = &mut *database.client.lock().unwrap();

    diesel::delete(books.filter(libra_manager::schema::books::isbn.eq(isbn))).execute(client)?;
    Ok(())
}

#[tauri::command]
fn update_book(database: State<DatabaseConnection>, book: Book) -> SerializedResult<()> {
    use diesel::{RunQueryDsl};
    let client = &mut *database.client.lock().unwrap();

    diesel::update(&book).set(&book).execute(client)?;
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
    use diesel::{RunQueryDsl};
    let db_client = &mut *database.client.lock().unwrap();

    diesel::update(&client).set(&client).execute(db_client)?;
    Ok(())
}

#[tauri::command]
fn fetch_borrowers(database: State<DatabaseConnection>, isbn: String) -> SerializedResult<Vec<ClientBorrow>> {
    use libra_manager::schema::clients::dsl::clients;
    use libra_manager::schema::books::dsl::books;
    use diesel::{RunQueryDsl, SelectableHelper, QueryDsl, BelongingToDsl};
    use diesel::associations::{HasTable};

    let client = &mut *database.client.lock().unwrap();

    let book: Book = books.find(isbn).get_result(client).unwrap();
    let result = Borrow::belonging_to(&book)
        .inner_join(clients::table())
        .select((Borrow::as_select(), Client::as_select()))
        .load::<(Borrow,Client)>(client)?;

    let collected = result.into_iter().map(|(borrow, client)| ClientBorrow{borrow, client}).collect::<Vec<ClientBorrow>>();
    Ok(collected)
}

#[tauri::command]
fn fetch_borrowed_books(database: State<DatabaseConnection>, id: String) -> SerializedResult<Vec<BookBorrow>> {
    use libra_manager::schema::clients::dsl::clients;
    use libra_manager::schema::books::dsl::books;
    use diesel::{RunQueryDsl, SelectableHelper, QueryDsl, BelongingToDsl};
    use diesel::associations::{HasTable};
    let db_client = &mut *database.client.lock().unwrap();

    let client: Client = clients.find(id).get_result(db_client).unwrap();

    let result = Borrow::belonging_to(&client)
        .inner_join(books::table())
        .select((Borrow::as_select(), Book::as_select()))
        .load::<(Borrow, Book)>(db_client)?;

    let collected = result.into_iter().map(|(borrow, book)| BookBorrow { borrow, book }).collect::<Vec<BookBorrow>>();

    Ok(collected)
}

#[tauri::command]
fn is_book_available(database: State<DatabaseConnection>, isbn: String, client_id: String) -> SerializedResult<Option<bool>> {
    use libra_manager::schema::books::dsl::books;
    use libra_manager::schema::clients::dsl::clients;
    use libra_manager::schema::borrows::returned;
    use diesel::{RunQueryDsl, SelectableHelper, QueryDsl, BelongingToDsl, OptionalExtension, ExpressionMethods};
    use diesel::associations::{HasTable};

    let client = &mut *database.client.lock().unwrap();

    let book_optional: Option<Book> = books.find(isbn).get_result(client).optional()?;

    return if let Some(book) = book_optional {
        let result = Borrow::belonging_to(&book)
            .inner_join(clients::table())
            .select((Client::as_select(), Borrow::as_select()))
            .filter(returned.eq(false))
            .load::<(Client, Borrow)>(client)?;

        let check = result.iter().any(|(client, _borrow)| client.id == client_id);

        Ok(Some((result.len() as i32) < book.items && !check))
    } else {
        Ok(None)
    };
}

#[tauri::command]
fn add_borrow(database: State<DatabaseConnection>, isbn: String, client_id: String) -> SerializedResult<()> {
    let current_date: NaiveDate = Local::now().date_naive();
    let next_date = Local::now().date_naive() + Days::new(14);
    let client = &mut *database.client.lock().unwrap();

    let borrow = NewBorrow { client_id: &client_id, book_isbn: &isbn, returned: false, start_date: current_date, end_date: next_date };

    use libra_manager::schema::borrows::dsl::*;
    use diesel::RunQueryDsl;
    use diesel::associations::HasTable;

    diesel::insert_into(borrows::table()).values(&borrow).execute(client)?;
    Ok(())
}

#[tauri::command]
fn delete_borrow(database: State<DatabaseConnection>, id: i32) -> SerializedResult<()> {
    use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
    use libra_manager::schema::borrows::dsl::borrows;
    let client = &mut *database.client.lock().unwrap();

    diesel::delete(borrows.filter(libra_manager::schema::borrows::dsl::id.eq(&id))).execute(client)?;
    Ok(())
}

#[tauri::command]
fn update_borrow(database: State<DatabaseConnection>, id: i32, returned: bool, end_date: NaiveDate) -> SerializedResult<()> {
    use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
    use libra_manager::schema::borrows::dsl::borrows;

    let client = &mut *database.client.lock().unwrap();

    diesel::update(borrows.filter(libra_manager::schema::borrows::dsl::id.eq(&id)))
        .set((
            libra_manager::schema::borrows::dsl::returned.eq(&returned),
            libra_manager::schema::borrows::dsl::endDate.eq(&end_date)
        )).execute(client)?;
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
            delete_book,
            update_book,
            fetch_borrowers,
            fetch_clients,
            fetch_client,
            create_client,
            delete_client,
            update_client,
            fetch_borrowed_books,
            is_book_available,
            add_borrow,
            delete_borrow,
            update_borrow
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
