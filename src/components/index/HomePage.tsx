import {useRootData} from "../util/useRootData.ts";

export default function HomePage() {
    const {settings} = useRootData();
    return (
        <div className="flex justify-center items-center mb-auto">
            <h1 className="text-4xl lg:text-5xl">Bun venit in portalul bibliotecii <span
                className="font-bold">{settings.libraryName}</span></h1>
        </div>
    )
}
