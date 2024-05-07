import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./Root.tsx";
import "./styles.css";
import {createBrowserRouter, redirect, RouterProvider} from "react-router-dom";
import {authProvider} from "./auth/auth.ts";
import HomePage, {loader as homePageLoader} from "./components/index/HomePage.tsx";
import LoginPage, {action as loginAction, loader as loginLoader} from "./components/login/LoginPage.tsx";
import BooksPage, {loader as booksLoader} from "./components/books/BooksPage.tsx";
import BookInfo, {loader as bookInfoLoader} from "./components/books/BookInfo.tsx";
import BookAdd, {action as bookAddAction} from "./components/books/BookAdd.tsx";
import ClientsPage, {loader as clientsLoader} from "./components/clients/ClientsPage.tsx";
import ClientAdd, {action as clientAddAction} from "./components/clients/ClientAdd.tsx";
import ClientInfo, {
    action as clientAction,
    deleteAction as deleteClientAction,
    loader as clientInfoLoader
} from "./components/clients/ClientInfo.tsx";
import ClientEdit, {action as clientEditAction} from "./components/clients/ClientEdit.tsx";
import ClientErrorPage from "./components/clients/ClientErrorPage.tsx";
import GlobalErrorPage from "./components/index/GlobalErrorPage.tsx";
import ClientsIndex from "./components/clients/ClientsIndex.tsx";

const router = createBrowserRouter([
    {
        id: "root",
        path: "/",
        element: <Root/>,
        loader() {
            return {user: authProvider.user};
        },
        errorElement: <GlobalErrorPage/>,
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
                        element: <ClientsIndex/>
                    },
                    {
                        path: "create",
                        element: <ClientAdd/>,
                        action: clientAddAction
                    },
                    {
                        path: ":clientId",
                        element: <ClientInfo/>,
                        loader: clientInfoLoader,
                        action: clientAction,
                        errorElement: <ClientErrorPage/>,
                        children: [
                            {
                                path: "delete",
                                action: deleteClientAction,
                            }
                        ]
                    },
                    {
                        path: ":clientId/edit",
                        loader: clientInfoLoader,
                        action: clientEditAction,
                        element: <ClientEdit/>,
                        errorElement: <ClientErrorPage/>
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
