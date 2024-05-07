import {Link} from "react-router-dom";

export default function GlobalErrorPage() {
    return (
        <div className="flex-grow flex">
            <div
                className="m-auto bg-black-5 rounded-xl shadow-black-10 border flex flex-col items-start justify-evenly px-4 py-4 h-44">
                <h1 className="font-bold text-xl">Uh oh! S-a produs o eroare :(</h1>
                <Link to="/" className="font-medium px-2 py-2 bg-orange text-black-5 rounded-2xl">Întoarce-te la pagina principală</Link>
            </div>
        </div>
    )
}
