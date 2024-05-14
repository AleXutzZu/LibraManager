import {useEffect, useState} from "react";
import {ErrorMessage, Field, Form as FormikForm, Formik} from "formik";
import * as Yup from "yup";
import {invoke} from "@tauri-apps/api/tauri";
import {Book} from "../books/BooksPage.tsx";
import {ActionFunctionArgs, Form, Link, redirect, useNavigation} from "react-router-dom";
import {authProvider} from "../../auth/auth.ts";

type Author = {
    name: string,
}

type BookData = {
    title: string,
    publishDate: string,
    covers: number[],
    authors?: Author[],
    numberOfPages?: number,
    isbn13: string[],
}

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();
    const isbn = formData.get("isbn") as string;
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;

    const book: Book = {isbn, title, author, items: 1};

    await invoke("create_book", {book});
    return redirect(`/books/${isbn}/edit`);
}

export async function loader() {
    if (!authProvider.isAuthenticated()) return redirect("/login");
    return null;
}

export default function BookLookupPage() {
    const [book, setBook] = useState<BookData | null | undefined>(undefined);
    const [error, setError] = useState<boolean>(false);
    const validationSchema = Yup.object({
        isbn: Yup.string().required("ISBN-ul este obligatoriu").matches(/^\d{13}$/, {message: "ISBN-ul este invalid"})
    })

    return (
        <div className="flex-grow flex flex-col items-center space-y-8 overflow-auto">
            <Formik initialValues={{
                isbn: "",
            }} onSubmit={async (values) => {
                try {
                    setBook(undefined);
                    setError(false);
                    const result: BookData | null = await invoke("lookup_book", {isbn: values.isbn});
                    setBook(result);
                } catch (error) {
                    console.log(error);
                    setError(true);
                }
            }} validationSchema={validationSchema}>
                <FormikForm className="mt-16 w-2/3 max-w-2xl flex-col flex items-start space-y-2">
                    <div className="text-red font-medium text-sm h-[14px] pl-1">
                        <ErrorMessage name="isbn"/>
                    </div>
                    <div className="flex justify-between items-center space-x-5 w-full">
                        <Field type="text" name="isbn" className="border text-sm rounded-lg block p-2.5 w-full"
                               placeholder="Caută informații online după ISBN"/>
                        <button type="submit"
                                className="block items-center px-2 py-1.5 text-black-5 text-lg font-medium text-center bg-orange rounded-2xl">
                            Caută
                        </button>
                    </div>
                </FormikForm>
            </Formik>
            {error &&
                <h1 className="text-red text-lg font-bold px-5 text-center">S-a produs o eroare la căutarea cărții. Cel
                    mai probabil nu există o conexiune la internet.</h1>}
            {book === null &&
                <h1 className="text-red text-lg font-bold px-5 text-center">Cartea căutată nu există din păcate în baza
                    de date OpenLibrary</h1>}
            {book && <BookDisplay {...book}/>}
        </div>
    );
}

function BookDisplay(props: BookData) {

    let authors: string = "";
    if (!props.authors) authors = "Nu s-au putut găsi autorii";
    else {
        props.authors.forEach((author, index) => {
            // @ts-ignore
            if (index != props.authors?.length - 1) {
                authors += ` ${author.name},`;
            } else {
                authors += ` ${author.name}`;
            }
        })
    }

    return (
        <div className="w-full max-w-3xl px-10 space-y-5 flex flex-col overflow-auto">
            <h1 className="font-bold text-lg">{props.title}</h1>
            <div className="flex justify-between">
                <div className="grid grid-cols-2 w-2/3">
                    <div className="w-full">
                        <h3 className="block mb-2 text-lg font-medium">Data publicării</h3>
                        <h3 className="text-lg block w-full">{props.publishDate}</h3>
                    </div>
                    <div className="w-full">
                        <h3 className="block mb-2 text-lg font-medium">Număr de pagini</h3>
                        <h3 className="text-lg block w-full">{props.numberOfPages || "Necunoscut"}</h3>
                    </div>
                    <div className="w-full">
                        <h3 className="block mb-2 text-lg font-medium">ISBN</h3>
                        <h3 className="text-lg block w-full">{props.isbn13[0]}</h3>
                    </div>
                    <div className="w-full">
                        <h3 className="block mb-2 text-lg font-medium">Autor(i)</h3>
                        <h3 className="text-lg block w-full">{authors}</h3>
                    </div>
                </div>
                <div className="w-1/3 h-64">
                    <img src={`https://covers.openlibrary.org/b/id/${props.covers[0]}-L.jpg`} alt="Coperta cărții"
                         className="w-full h-full object-contain"/>
                </div>
            </div>
            <AddBook {...props}/>
        </div>
    );
}

function AddBook(props: BookData) {
    const [exists, setExists] = useState<boolean | null>(null);

    let authors: string = "";
    if (!props.authors) authors = "Necunoscut";
    else {
        props.authors.forEach((author, index) => {
            // @ts-ignore
            if (index != props.authors?.length - 1) {
                authors += ` ${author.name},`;
            } else {
                authors += ` ${author.name}`;
            }
        })
    }

    useEffect(() => {

        const check = async () => {
            let book: Book = await invoke("fetch_book", {isbn: props.isbn13[0]});
            return book != null;
        }

        check().then(result => setExists(result))
    }, []);

    const navigation = useNavigation();

    if (exists === null) return <></>;

    if (exists) {
        return (
            <div className="flex flex-col items-start space-y-3">
                <h3 className="text-green text-md font-bold">Cartea se găsește în baza de date.</h3>
                <Link to={`/books/${props.isbn13[0]}`}
                      className="block items-center px-2 py-1.5 text-black-5 text-lg font-medium text-center bg-orange rounded-2xl">
                    Mergi la pagina cărții
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start space-y-3">
            <h3 className="text-red text-md font-bold">Cartea nu se găsește în baza de date.</h3>
            <Form method="post">
                <input readOnly className="display-none" name="isbn" value={props.isbn13[0]}/>
                <input readOnly className="display-none" name="title" value={props.title}/>
                <input readOnly className="display-none" name="author" value={authors}/>
                <button type="submit" disabled={navigation.state != "idle"}
                        className="block items-center px-2 py-1.5 text-black-5 text-lg font-medium text-center bg-orange rounded-2xl">
                    Adaugă carte
                </button>
            </Form>
        </div>
    );
}
