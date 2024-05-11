import {Link} from "react-router-dom";

export default function BookErrorPage() {

    return <div className="flex-grow flex">
        <div
            className="m-auto bg-black-5 rounded-xl shadow-black-10 border flex flex-col items-center justify-evenly px-4 py-4 h-44">
            <h1 className="font-bold text-xl">Cartea nu a putut fi găsită în baza de date.</h1>
            <Link to="/books/create" className="font-medium px-2 py-2 bg-orange text-black-5 rounded-2xl">Adaugă o nouă carte</Link>
        </div>
    </div>
}
