import {useLoaderData} from "react-router-dom";
import {invoke} from "@tauri-apps/api/tauri";

export async function loader() {
    const libraryName: string = await invoke("get_library", {});
    return {library: libraryName}
}

export default function HomePage() {
    const {library} = useLoaderData() as { library: string };

    return (
        <div className="flex justify-center items-center">
            <h1 className="text-4xl lg:text-5xl">Bun venit in portalul bibliotecii <span className="font-bold">{library}</span></h1>
        </div>
    )
}
