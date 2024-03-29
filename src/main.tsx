import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./Root.tsx";
import "./styles.css";
import {createBrowserRouter, NavLink, redirect, RouterProvider} from "react-router-dom";
import {authProvider} from "./auth/auth.ts";
import HomePage from "./components/index/HomePage.tsx";
import {loader as homePageLoader} from "./components/index/HomePage.tsx";

const router = createBrowserRouter([
    {
        id: "root",
        path: "/",
        element: <Root/>,
        loader() {
            return {user: authProvider.user};
        },
        errorElement: <>
            <NavLink to={"/"}>Back home</NavLink>
        </>,
        children: [
            {
                index: true,
                element: <HomePage/>,
                loader: homePageLoader,
            }
        ]
    },
    {
        path: "/logout",
        async action() {
            await authProvider.logout();
            return redirect("/");
        }
    }
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>,
);