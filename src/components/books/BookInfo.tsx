import {invoke} from "@tauri-apps/api/tauri";
import {Book} from "./BooksPage.tsx";
import {ActionFunctionArgs, Form, Link, LoaderFunctionArgs, redirect, useLoaderData} from "react-router-dom";

type PathParams = {
    isbn: string,
}

export async function loader({params}: LoaderFunctionArgs<PathParams>) {
    const book = await invoke("fetch_book", {isbn: params.isbn});
    if (book === null) throw new Response("", {status: 404, statusText: "Not Found"});
    return {book: book as Book};
}

export async function deleteAction({params}: ActionFunctionArgs<PathParams>) {
    await invoke("delete_book", {isbn: params.isbn});
    return redirect("/books");
}

export default function BookInfo() {
    const {book} = useLoaderData() as { book: Book };
    return (
        <div className="overflow-auto flex-grow flex p-5">
            <div className="bg-black-5 rounded-xl shadow-black-10 shadow-md min-w-fit lg:w-2/5 m-auto">
                <div className="py-8 px-4 mx-auto lg:py-16">
                    <h2 className="mb-4 text-2xl font-bold">Informații carte</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <h3 className="block mb-2 text-lg font-medium">Titlu</h3>
                            <h3 className="text-lg block w-full">{book.title}</h3>
                        </div>
                        <div className="col-span-2">
                            <h3 className="block mb-2 text-lg font-medium">Autor(i)</h3>
                            <h3 className="text-lg block w-full">{book.author}</h3>
                        </div>
                        <div className="w-full">
                            <h3 className="block mb-2 text-lg font-medium">ISBN</h3>
                            <h3 className="text-lg block w-full">{book.isbn}</h3>
                        </div>
                        <div className="w-full">
                            <h3 className="block mb-2 text-lg font-medium">Exemplare</h3>
                            <h3 className="text-lg block w-full">{book.items}</h3>
                        </div>

                        <div className="w-full">
                            <Link to="edit"
                                  className="block items-center px-0.5 py-1.5 mt-6 text-black-5 text-lg font-medium text-center bg-orange rounded-2xl w-full">
                                Editează
                            </Link>
                        </div>

                        <Form method="post" action="delete" className="w-full">
                            <button type="submit"
                                    className="w-full block items-center px-0.5 py-1.5 mt-6 text-black-5 text-lg font-medium text-center bg-red rounded-2xl">
                                Șterge carte
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}
