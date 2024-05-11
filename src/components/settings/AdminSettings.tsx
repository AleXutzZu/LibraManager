import {NavLink, Outlet, redirect} from "react-router-dom";
import {authProvider, User} from "../../auth/auth.ts";

export async function loader() {
    if (!authProvider.isAuthenticated()) return redirect("/login");
    const user = await authProvider.getCurrentUser() as User;
    if (user.role != "admin") return redirect("/");
    return null;
}

export default function AdminSettings() {
    return <div className="flex-grow flex overflow-auto">
        <div className="mx-auto mt-16 flex items-start w-5/6 space-x-5">
            <div className="flex flex-col items-center space-y-1 divide-y">
                <NavLink to="/admin" end
                         className={({isActive}) => (isActive ? "text-orange" : "") + " font-medium text-lg px-2 py-2.5 transition ease-in"}>Setări
                    generale</NavLink>
                <NavLink to="/admin/users" end
                         className={({isActive}) => (isActive ? "text-orange" : "") + " font-medium text-lg px-2 py-2.5 transition ease-in border-black-100"}>Utilizatori</NavLink>
            </div>
            <div className="flex-grow h-full">
                <Outlet/>
            </div>
        </div>
    </div>
}
