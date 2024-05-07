import {NavLink, useFetcher, useRouteLoaderData} from "react-router-dom";
import {User} from "../../auth/auth.ts";

export default function Navigation() {
    return (
        <div
            className="flex justify-around items-center border-b-black-10 border-b-2 shadow-black-10 shadow-lg px-4 lg:px-10 py-2">
            <nav className="flex justify-around items-center w-2/3 py-1.5 mr-auto">
                <NavLink to={"/books"} className="text-xl lg:text-3xl">Cărți</NavLink>
                <NavLink to={"/clients"} className="text-xl lg:text-3xl">Clienți</NavLink>
                <NavLink to={"/page3"} className="text-xl lg:text-3xl">Link 3</NavLink>
            </nav>
            <AuthStatus/>
        </div>
    )
}


function AuthStatus() {
    const {user} = useRouteLoaderData("root") as { user: User };
    const fetcher = useFetcher();

    const loggingOut = fetcher.formData != null;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-w-36">
                <NavLink to={"/login"} className="text-lg lg:text-xl">Login</NavLink>
            </div>)
    }

    return (
        <div className="group flex flex-col items-center justify-center min-w-36">
            <p className="text-xl lg:text-2xl"> Bună, <span className="font-bold">{user.firstName}</span></p>
            <div
                className="absolute invisible group-hover:visible transition-all
                duration-100 ease-in-out bg-black-50 min-w-32 min-h-24 lg:min-w-36 top-10 flex flex-col items-center
                justify-evenly rounded-2xl border-b-black-100 border-2 lg:top-12 px-0.5 py-1.5"
            >
                <div>
                    <p className="text-lg lg:text-xl">Setari</p>
                </div>

                {user.role === "admin" ?
                    <NavLink to={"/admin"} className="text-lg lg:text-xl">Administrare</NavLink> :
                    <p className="text-lg lg:text-xl text-black-75">Administrare</p>
                }

                <fetcher.Form method="post" action="/logout">
                    <button type="submit" disabled={loggingOut}
                            className="text-lg lg:text-xl text-red"> {loggingOut ? "Logging out..." : "Log out"}</button>
                </fetcher.Form>

            </div>
        </div>
    )
}
