import {Link, Outlet, useLoaderData, useNavigate} from "react-router-dom";
import {invoke} from "@tauri-apps/api/tauri";
import {useState} from "react";
import {DecodeHintType, Result} from "@zxing/library";
import Scanner from "../util/Scanner.tsx";

export interface Book {
    isbn: string,
    author: string,
    title: string,
}

export async function loader() {
    const fetch = await invoke("fetch_books");
    return {books: fetch as Book[]};
}

export default function BooksPage() {
    const {books} = useLoaderData() as { books: Book[] };
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const onDecode = (result: Result) => {
        const isbn = result.getText();
        navigate(`/books/${isbn}`);
    }

    const decodeHints = new Map<DecodeHintType, any>();
    decodeHints.set(DecodeHintType.POSSIBLE_FORMATS, ["EAN-13"])

    return (
        <div className="flex h-full">
            <div className="flex flex-col w-52 lg:w-80 bg-black-10 items-center px-2 justify-around">
                <form className="flex px-2 justify-between">
                    <input value={search} className="w-4/5" onChange={(event) => setSearch(event.target.value)}/>
                    <Scanner onDecode={onDecode}/>

                </form>
                <div className="flex flex-col">
                    {books.map(book => <BookLink {...book} key={book.isbn}/>
                    )}
                </div>

            </div>
            <div>
                <Outlet/>
            </div>
        </div>)
}

function BookLink(props: Book) {
    const {isbn, title, author} = props;
    return (
        <Link to={`${isbn}`} className="py-2">
            <div className="flex flex-col items-start justify-between">
                <h1 className="text-lg font-medium">{title}</h1>
                <h2 className="text-sm"><i>{author}</i></h2>
            </div>
        </Link>);
}
