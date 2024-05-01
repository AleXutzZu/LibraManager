import {invoke} from "@tauri-apps/api/tauri";
import {Book} from "./BooksPage.tsx";

export async function loader({params}: { params: any }) {
    const book = await invoke("fetch_book", {isbn: params.isbn});
    if (book === null) throw new Response("", {status: 404, statusText: "Not Found"});
    return {book: book as Book};
}

export default function BookInfo() {
    return <>Test</>
}
