import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./Root.tsx";
import "./styles.css";
import {createBrowserRouter, NavLink, redirect, RouterProvider} from "react-router-dom";
import {authProvider} from "./auth/auth.ts";
import HomePage, {loader as homePageLoader} from "./components/index/HomePage.tsx";
import LoginPage, {action as loginAction, loader as loginLoader} from "./components/login/LoginPage.tsx";
import BooksPage, {loader as booksLoader} from "./components/books/BooksPage.tsx";
import BookInfo, {loader as bookInfoLoader} from "./components/books/BookInfo.tsx";
import BookAdd, {action as bookAddAction} from "./components/books/BookAdd.tsx";
import ClientsPage, {loader as clientsLoader} from "./components/clients/ClientsPage.tsx";
import ClientAdd, {action as clientAddAction} from "./components/clients/ClientAdd.tsx";

const router = createBrowserRouter([
    {
        id: "root",
        path: "/",
        element: <Root/>,
        loader() {
            return {user: authProvider.user};
        },
        errorElement: <NavLink to={"/"}>Back home</NavLink>,
        children: [
            {
                index: true,
                element: <HomePage/>,
                loader: homePageLoader,
            },
            {
                path: "login",
                element: <LoginPage/>,
                loader: loginLoader,
                action: loginAction,
            },
            {
                path: "books",
                element: <BooksPage/>,
                loader: booksLoader,
                children: [
                    {
                        index: true,
                        element: <>Index for books</>
                    },
                    {
                        path: "create",
                        element: <BookAdd/>,
                        action: bookAddAction
                    },
                    {
                        path: ":isbn",
                        element: <BookInfo/>,
                        loader: bookInfoLoader,
                        errorElement: <>Woo not found</>,
                    }
                ]
            },
            {
                path: "clients",
                element: <ClientsPage/>,
                loader: clientsLoader,
                children: [
                    {
                        index: true,
                        element: <>Index for clients</>
                    },
                    {
                        path: "create",
                        element: <ClientAdd/>,
                        action: clientAddAction
                    },
                    {
                        path: ":clientId",
                        element: <>Client</>,
                        errorElement: <>Woo not found client</>
                    }
                ]
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
