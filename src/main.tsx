import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./Root.tsx";
import "./styles.css";
import {createBrowserRouter, NavLink, redirect, RouterProvider} from "react-router-dom";
import {authProvider} from "./auth/auth.ts";
import HomePage from "./components/index/HomePage.tsx";
import {loader as homePageLoader} from "./components/index/HomePage.tsx";
import LoginPage from "./components/login/LoginPage.tsx";
import {loader as loginLoader} from './components/login/LoginPage.tsx'
import {action as loginAction} from './components/login/LoginPage.tsx'
import BooksPage from "./components/books/BooksPage.tsx";
import {loader as booksLoader} from "./components/books/BooksPage.tsx"
import BookInfo from "./components/books/BookInfo.tsx";
import {loader as bookInfoLoader} from "./components/books/BookInfo.tsx"

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
                        element: <>Add book</>
                    },
                    {
                        path: ":isbn",
                        element: <BookInfo/>,
                        loader: bookInfoLoader,
                        errorElement: <>Woo not found</>,
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
