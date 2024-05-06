import short from "short-uuid";
import Scanner from "../util/Scanner.tsx";
import {Link, Outlet, useLoaderData, useNavigate} from "react-router-dom";
import {useMemo, useState} from "react";
import {DecodeHintType, Result} from "@zxing/library";
import {invoke} from "@tauri-apps/api/tauri";

export const translator = short(short.constants.cookieBase90);

export type Client = {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
}

type LoaderData = {
    clients: Client[],
}

export async function loader(): Promise<LoaderData> {
    const fetch = await invoke("fetch_clients");
    return {clients: fetch as Client[]};
}

export default function ClientsPage() {
    const [search, setSearch] = useState("");
    const {clients} = useLoaderData() as LoaderData;
    const navigate = useNavigate();

    const onDecode = (result: Result) => {
        const id_short = result.getText();
        const id = translator.toUUID(id_short);
        navigate(`/clients/${id}`);
    }

    const decodeHints = new Map<DecodeHintType, any>();
    decodeHints.set(DecodeHintType.POSSIBLE_FORMATS, ["Code 128"]);

    const filtered = useMemo((): Client[] => {
        const expression = new RegExp(search, "i");
        return clients.filter((client) => {
            const fullName = `${client.firstName} ${client.lastName}`;
            return fullName.search(expression) > -1 || client.email.search(expression) > -1 || client.phone.search(expression) > -1;
        })
    }, [clients, search]);

    return <div className="flex h-full overflow-auto">
        <div className="flex flex-col w-52 lg:w-80 bg-black-10 items-center justify-start">
            <form className="flex justify-between py-4 w-full px-4">
                <input value={search} className="w-4/5 rounded-lg border p-0.5" placeholder={"Caută..."}
                       onChange={(event) => setSearch(event.target.value)}/>
                <Scanner onDecode={onDecode} hints={decodeHints}/>
            </form>
            <Link to="create"
                  className="px-2 py-2 bg-orange text-black-5 text-center font-medium text-lg rounded-2xl">
                Adaugă client
            </Link>
            {filtered.length === 0 && <p className="font-medium mt-3">Nu există clienți</p>}
            <div
                className="flex flex-col items-start w-full overflow-auto h-4/5 max-h-fit scrollbar-thin pl-4 pr-0.5">
                {filtered.map(client => <ClientLink {...client} key={client.id}/>)}
            </div>
        </div>
        <Outlet/>
    </div>
}

function ClientLink(props: Client) {
    const {id, lastName, firstName, phone} = props;
    return (
        <Link to={`${id}`} className="py-2">
            <div className="flex flex-col items-start justify-between">
                <h1 className="text-lg font-medium">{firstName} {lastName}</h1>
                <h2 className="text-sm"><i>{phone}</i></h2>
            </div>
        </Link>);
}
