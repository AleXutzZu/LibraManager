import {Link, Outlet, useLoaderData, useNavigate} from "react-router-dom";
import {invoke} from "@tauri-apps/api/tauri";
import {useMemo, useState} from "react";
import {DecodeHintType, Result} from "@zxing/library";
import Scanner from "../util/Scanner.tsx";

export type Book = {
    isbn: string,
    author: string,
    title: string,
    items: number,
}

type LoaderData = {
    books: Book[],
}

export async function loader(): Promise<LoaderData> {
    const fetch = await invoke("fetch_books");
    return {books: fetch as Book[]};
}

export default function BooksPage() {
    const {books} = useLoaderData() as LoaderData;
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const onDecode = (result: Result) => {
        const isbn = result.getText();
        navigate(`/books/${isbn}`);
    }

    const decodeHints = new Map<DecodeHintType, any>();
    decodeHints.set(DecodeHintType.POSSIBLE_FORMATS, ["EAN-13"]);

    const filtered = useMemo((): Book[] => {
        const expression = new RegExp(search, "i");
        return books.filter((book) => {
            return book.title.search(expression) > -1 || book.author.search(expression) > -1 || book.isbn.search(expression) > -1;
        })
    }, [books, search]);

    return (
        <div className="flex h-full overflow-auto">
            <div className="flex flex-col w-52 lg:w-80 bg-black-10 items-center justify-start">
                <form className="flex justify-between py-4 w-full px-4">
                    <input value={search} className="w-4/5 rounded-lg border p-0.5" placeholder={"Caută..."}
                           onChange={(event) => setSearch(event.target.value)}/>
                    <Scanner onDecode={onDecode} hints={decodeHints}/>
                </form>
                <Link to="create"
                      className="px-2 py-2 bg-orange text-black-5 text-center font-medium text-lg rounded-2xl">
                    Adaugă carte
                </Link>
                {filtered.length === 0 && <p className="font-medium mt-3">Nu există cărți</p>}
                <div
                    className="flex flex-col items-start w-full overflow-auto h-4/5 max-h-fit scrollbar-thin pl-4 pr-0.5">
                    {filtered.map(book => <BookLink {...book} key={book.isbn}/>)}
                </div>
            </div>
            <Outlet/>
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
