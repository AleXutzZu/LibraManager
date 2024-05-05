import {invoke} from "@tauri-apps/api/tauri";
import {Client, translator} from "./ClientsPage.tsx";
import {ActionFunctionArgs, Form, Link, LoaderFunctionArgs, redirect, useLoaderData} from "react-router-dom";

type PathParams = {
    clientId: string;
}

export async function loader({params}: LoaderFunctionArgs<PathParams>) {
    const client = await invoke("fetch_client", {id: params.clientId});
    if (client === null) throw new Response("", {status: 404, statusText: "Not Found"});
    return {client: client as Client};
}

export async function action({params}: ActionFunctionArgs<PathParams>) {
    await invoke("delete_client", {id: params.clientId});
    return redirect("/clients");
}

export default function ClientInfo() {
    const {client} = useLoaderData() as { client: Client };
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
                    <h2 className="mb-4 text-2xl font-bold mt-3">Împrumuturi</h2>
                    <button className="px-1.5 py-1.5 text-black-5 text-lg font-medium text-center bg-green rounded-2xl">Emite legitimație</button>
                </div>
            </div>
        </div>
    )
}
