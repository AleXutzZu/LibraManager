import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./Root.tsx";
import "./styles.css";
import {createBrowserRouter, redirect, RouterProvider} from "react-router-dom";
import {authProvider} from "./auth/auth.ts";
import HomePage from "./components/index/HomePage.tsx";
import LoginPage, {action as loginAction, loader as loginLoader} from "./components/login/LoginPage.tsx";
import BooksPage, {loader as booksLoader} from "./components/books/BooksPage.tsx";
import BookInfo, {deleteAction as deleteBookAction, loader as bookInfoLoader} from "./components/books/BookInfo.tsx";
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
import BooksIndex from "./components/books/BooksIndex.tsx";
import BookErrorPage from "./components/books/BookErrorPage.tsx";
import BookEdit, {action as bookEditAction} from "./components/books/BookEdit.tsx";
import AccountSettings, {
    action as accountSettingsAction,
    loader as accountSettingsLoader
} from "./components/settings/AccountSettings.tsx";
import {settingsProvider} from "./components/settings/settings.ts";
import AdminSettings, {loader as adminSettingsLoader} from "./components/settings/AdminSettings.tsx";

const router = createBrowserRouter([
    {
        id: "root",
        path: "/",
        element: <Root/>,
        async loader() {
            return {user: await authProvider.getCurrentUser(), settings: await settingsProvider.getCurrentSettings()};
        },
        errorElement: <GlobalErrorPage/>,
        children: [
            {
                index: true,
                element: <HomePage/>,
            },
            {
                path: "settings",
                element: <AccountSettings/>,
                loader: accountSettingsLoader,
                action: accountSettingsAction
            },
            {
                path: "admin",
                element: <AdminSettings/>,
                loader: adminSettingsLoader,
                children: [
                    {
                        index: true,
                        element: <>Index with global settings</>
                    },
                    {
                        path: "users",
                        element: <>Users</>,
                        children: [
                            {
                                path: "delete"
                            }
                        ]
                    }
                ]
            },
            {
                path: "login",
                element: <LoginPage/>,
                loader: loginLoader,
                action: loginAction,
            },
            {
                path: "lookup",
                element: <>Lookup page</>
            },
            {
                path: "books",
                element: <BooksPage/>,
                loader: booksLoader,
                children: [
                    {
                        index: true,
                        element: <BooksIndex/>
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
                        errorElement: <BookErrorPage/>,
                        children: [
                            {
                                path: "delete",
                                action: deleteBookAction
                            }
                        ]
                    },
                    {
                        path: ":isbn/edit",
                        element: <BookEdit/>,
                        loader: bookInfoLoader,
                        action: bookEditAction,
                        errorElement: <BookErrorPage/>
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
