import {useRootData} from "../util/useRootData.ts";
import {invoke} from "@tauri-apps/api/tauri";
import {useLoaderData} from "react-router-dom";

type LoaderData = {
    books: number,
    clients: number,
}

export async function loader(): Promise<LoaderData> {
    const res = await invoke("fetch_counts") as number[];
    const [books, clients] = res;
    return {
        books, clients
    };
}

export default function HomePage() {
    const {settings} = useRootData();
    const {books, clients} = useLoaderData() as LoaderData;

    return (
        <div className="flex justify-center items-center flex-grow flex-col">
            <h1 className="text-4xl lg:text-5xl">Bun venit în portalul bibliotecii <span
                className="font-bold">{settings.libraryName}</span></h1>
            <div className="grid grid-cols-2 gap-40 mt-20">

                <div className="w-full flex items-center flex-col justify-center">
                    <h3 className="text-3xl w-full font-medium text-center">{books}</h3>
                    <h3 className="text-4xl font-bold w-full text-center">cărți</h3>
                </div>
                <div className="w-full flex items-center flex-col justify-center">
                    <h3 className="text-3xl w-full font-medium text-center">{clients}</h3>
                    <h3 className="text-4xl font-bold w-full text-center">clienți</h3>
                </div>
            </div>
        </div>
    )
}
