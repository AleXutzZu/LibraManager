import {invoke} from "@tauri-apps/api/tauri";
import {Client, translator} from "./ClientsPage.tsx";
import {ActionFunctionArgs, Form, Link, LoaderFunctionArgs, redirect, useLoaderData} from "react-router-dom";

type PathParams = {
    clientId: string;
}

type LoaderData = {
    client: Client,
    borrowedBooks: BorrowData[],
}

type BorrowData = {
    startDate: string,
    endDate: string,
    title: string,
    author: string,
    id: number,
    isbn: string
}

export async function loader({params}: LoaderFunctionArgs<PathParams>): Promise<LoaderData> {
    const client = await invoke("fetch_client", {id: params.clientId});
    if (client === null) throw new Response("", {status: 404, statusText: "Not Found"});
    const books: BorrowData[] = await invoke("fetch_borrowed_books", {id: params.clientId});

    return {client: client as Client, borrowedBooks: books};
}

export async function deleteAction({params}: ActionFunctionArgs<PathParams>) {
    await invoke("delete_client", {id: params.clientId});
    return redirect("/clients");
}

export default function ClientInfo() {
    const {client, borrowedBooks: books} = useLoaderData() as LoaderData;
    return (
        <div className="overflow-auto flex-grow flex items-center justify-center">
            <div className="bg-black-5 rounded-xl shadow-black-10 shadow-md min-w-fit lg:w-2/5">
                <div className="py-8 px-4 mx-auto lg:py-16">
                    <h2 className="mb-4 text-2xl font-bold">Informații client</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <h3 className="block mb-2 text-lg font-medium">Nume complet</h3>
                            <h3 className="text-lg block w-full">{client.firstName} {client.lastName}</h3>
                        </div>
                        <div className="col-span-2">
                            <h3 className="block mb-2 text-lg font-medium">Adresă de email</h3>
                            <h3 className="text-lg block w-full">{client.email}</h3>
                        </div>
                        <div className="w-full">
                            <h3 className="block mb-2 text-lg font-medium">Număr de telefon</h3>
                            <h3 className="text-lg block w-full">{client.phone}</h3>
                        </div>
                        <div className="w-full">
                            <h3 className="block mb-2 text-lg font-medium">ID (scurt)</h3>
                            <h3 className="text-lg block w-full">{translator.fromUUID(client.id)}</h3>
                        </div>
                        <div className="col-span-2">
                            <h3 className="block mb-2 text-lg font-medium">ID (lung)</h3>
                            <h3 className="text-xs block w-full lg:text-sm">{client.id}</h3>
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
                                Șterge client
                            </button>
                        </Form>
                    </div>
                    <details>
                        <summary className="mb-4 text-xl font-bold mt-3">Împrumuturi</summary>
                        <div className="grid grid-cols-2 gap-4">

                        </div>
                    </details>
                    <button
                        className="px-1.5 py-1.5 text-black-5 text-lg font-medium text-center bg-green rounded-2xl">
                        Emite legitimație
                    </button>
                </div>
            </div>
        </div>
    )
}
