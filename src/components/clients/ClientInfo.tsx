import {invoke} from "@tauri-apps/api/tauri";
import {Client, translator} from "./ClientsPage.tsx";
import {
    ActionFunctionArgs,
    Form,
    Link,
    LoaderFunctionArgs,
    redirect,
    useLoaderData,
    useNavigation,
    useSubmit
} from "react-router-dom";
import {Book} from "../books/BooksPage.tsx";
import {Form as FormikForm, Formik} from "formik";
import Input from "../util/Input.tsx";
import Scanner from "../util/Scanner.tsx";
import {BarcodeFormat, DecodeHintType} from "@zxing/library";
import {addDays, format, compareAsc, compareDesc} from "date-fns";
import {useEffect, useState} from "react";

type PathParams = {
    clientId: string;
}

type LoaderData = {
    client: Client,
    borrowedBooks: BookBorrow[],
    history: BookBorrow[],
}

type BookBorrow = {
    book: Book,
    borrow: Borrow,
}

export type Borrow = {
    id: number,
    clientID: string,
    bookISBN: string,
    startDate: string,
    endDate: string,
    returned: boolean,
}

export async function loader({params}: LoaderFunctionArgs<PathParams>): Promise<LoaderData> {
    const client = await invoke("fetch_client", {id: params.clientId});
    if (client === null) throw new Response("", {status: 404, statusText: "Not Found"});
    const books: BookBorrow[] = await invoke("fetch_borrowed_books", {id: params.clientId});

    return {
        client: client as Client,
        borrowedBooks: books.filter(book => !book.borrow.returned).sort((a, b) => compareAsc(a.borrow.endDate, b.borrow.endDate)),
        history: books.filter(book => book.borrow.returned).sort((a, b) => compareAsc(a.borrow.endDate, b.borrow.endDate))
    };
}

export async function deleteAction({params}: ActionFunctionArgs<PathParams>) {
    await invoke("delete_client", {id: params.clientId});
    return redirect("/clients");
}

export async function action({params, request}: ActionFunctionArgs<PathParams>) {
    const formData = await request.formData();

    if (request.method === "POST") {
        const isbn: string = formData.get("isbn") as string;
        await invoke("add_borrow", {isbn, clientId: params.clientId});

    } else if (request.method === "PUT") {
        const id: number = Number(formData.get("id"));
        const date = format(new Date(), "yyyy-MM-dd");

        await invoke("update_borrow", {id, endDate: date, returned: true});

    } else if (request.method === "PATCH") {
        const id: number = Number(formData.get("id"));
        const dueTo = new Date(formData.get("endDate") as string);
        const date = format(addDays(dueTo, 7), "yyyy-MM-dd");

        await invoke("update_borrow", {id, endDate: date, returned: false});

    } else if (request.method === "DELETE") {
        const id: number = Number(formData.get("id"));
        await invoke("delete_borrow", {id});
    }
    return null;
}

export default function ClientInfo() {
    const {client, borrowedBooks, history} = useLoaderData() as LoaderData;
    const submit = useSubmit();
    const [message, setMessage] = useState<string | null>(null);

    const decodeHints = new Map<DecodeHintType, any>();
    decodeHints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);

    return (
        <div className="overflow-auto flex-grow flex p-5">
            <div className="bg-black-5 rounded-xl shadow-black-10 shadow-md min-w-fit lg:w-2/5 m-auto">
                <div className="py-8 px-4 mx-auto lg:py-16">
                    <h2 className="mb-4 text-2xl font-bold">Informații client</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <h3 className="block mb-2 text-lg font-medium">Nume complet</h3>
                            <h3 className="text-lg block w-full">{client.firstName} {client.lastName}</h3>
                        </div>
                        <div className="col-span-2">
                            <h3 className="block mb-2 text-lg font-medium">Adresă de email</h3>
                            <h3 className="text-lg block w-full">{client.email}</h3>
                        </div>
                        <div className="w-full">
                            <h3 className="block mb-2 text-lg font-medium">Număr de telefon</h3>
                            <h3 className="text-lg block w-full">{client.phone}</h3>
                        </div>
                        <div className="w-full">
                            <h3 className="block mb-2 text-lg font-medium">ID (scurt)</h3>
                            <h3 className="text-lg block w-full">{translator.fromUUID(client.id)}</h3>
                        </div>
                        <div className="col-span-2">
                            <h3 className="block mb-2 text-lg font-medium">ID (lung)</h3>
                            <h3 className="text-xs block w-full lg:text-sm">{client.id}</h3>
                        </div>

                        <div className="w-full">
                            <Link to="edit"
                                  className="block items-center px-0.5 py-1.5 mt-6 text-black-5 text-lg font-medium text-center bg-orange rounded-2xl w-full">
                                Editează
                            </Link>
                        </div>

                        <Form method="post" action="delete" className="w-full">
                            <button type="submit"
                                    className="w-full block items-center px-0.5 py-1.5 mt-6 text-black-5 text-lg font-medium text-center bg-red rounded-2xl">
                                Șterge client
                            </button>
                        </Form>
                    </div>
                    <details className="mt-3 open:ring-1 open:ring-black-100/5 p-3 open:shadow-lg">
                        <summary className="text-xl font-bold">Împrumuturi</summary>
                        <div className="w-full">
                            <h2 className="text-lg font-bold">Adaugă împrumut</h2>
                            <Formik initialValues={{isbn: ""}} onSubmit={(values) => {
                                submit(values, {method: "post"});
                            }}
                                    validate={async (values) => {
                                        const {isbn} = values;
                                        if (isbn.match(/^[0-9]{13}$/) == null) return {isbn: "ISBN-ul nu este valid"};

                                        const check: boolean | null = await invoke("is_book_available", {
                                            isbn,
                                            clientId: client.id
                                        });

                                        if (check === null) return {isbn: "ISBN-ul nu există în baza de date"};

                                        if (!check) return {isbn: "Cartea nu mai este disponibilă"};

                                        return {};
                                    }}>
                                {formik => (
                                    <FormikForm className="flex items-center w-full">
                                        <div className="w-full">
                                            <Input label="ISBN" type="text" name="isbn"
                                                   className="border text-sm rounded-lg block p-2.5 flex-grow"
                                                   placeholder="ISBN">

                                                <Scanner hints={decodeHints} onDecode={(result) => {
                                                    formik.setFieldValue("isbn", result.getText(), true);
                                                }}/>
                                                <button type="submit"
                                                        className="!ml-4 px-2.5 py-2.5 text-black-5 text-sm font-medium text-center bg-orange rounded-2xl">
                                                    Adaugă
                                                </button>
                                            </Input>
                                        </div>

                                    </FormikForm>
                                )}
                            </Formik>
                        </div>
                        <div className="w-full space-y-1.5 mt-10 max-h-96 overflow-auto">
                            {borrowedBooks.length === 0 &&
                                <h1 className="font-bold text-center mx-auto text-xl">Nu există împrumuturi</h1>}
                            {borrowedBooks.map(borrowedBook => (
                                <BorrowCard {...borrowedBook} key={borrowedBook.borrow.id}/>))}
                        </div>
                    </details>
                    <details className="mb-3 open:ring-1 open:ring-black-100/5 p-3 open:shadow-lg">
                        <summary className="text-xl font-bold">Istoric</summary>
                        <div className="w-full mt-10 max-h-96 overflow-auto">
                            {history.length === 0 &&
                                <h1 className="font-bold text-center mx-auto text-xl">Nu există istoric</h1>}
                            {history.map(borrowedBook => (
                                <HistoryCard {...borrowedBook} key={borrowedBook.borrow.id}/>))}
                        </div>
                    </details>
                    <button onClick={async () => {
                        setMessage(null);
                        try {
                            const args = {
                                clientIdShort: translator.fromUUID(client.id),
                                clientName: `${client.firstName} ${client.lastName}`,
                                date: format(new Date(), "yyyy-MM-dd"),
                            };

                            const path = await invoke("download_client_badge", args) as string;
                            setMessage(path);
                        } catch (error) {
                            setMessage("S-a produs o eroare. Cel mai probabil nu există drepturi de scriere a fișierului");
                        }
                    }}
                            className="px-1.5 py-1.5 text-black-5 text-lg font-medium text-center bg-green rounded-2xl">
                        Emite legitimație
                    </button>
                    {message && <h1 className="">{message}</h1>}
                </div>
            </div>
        </div>
    )
}

function BorrowCard(props: BookBorrow) {
    const late: boolean = compareAsc(new Date(), new Date(props.borrow.endDate)) >= 0;

    return (
        <div className="grid grid-cols-2 gap-4 mt-3 border p-2 rounded-lg">
            <Link className="w-full" to={`/books/${props.book.isbn}`}>
                <h3 className="block mb-2 text-lg font-medium">Titlu</h3>
                <h3 className="text-lg block w-full">{props.book.title}</h3>
            </Link>
            <div className="w-full">
                <h3 className="block mb-2 text-lg font-medium">Autor</h3>
                <h3 className="text-lg block w-full">{props.book.author}</h3>
            </div>
            <div className="w-full">
                <h3 className="block mb-2 text-lg font-medium">Împrumutat pe</h3>
                <h3 className="text-lg block w-full">{props.borrow.startDate}</h3>
            </div>
            <div className="w-full">
                <h3 className="block mb-2 text-lg font-medium">Dată retur</h3>
                <h3 className="text-lg block w-full">{props.borrow.endDate} {late &&
                    <span className="text-red font-medium">(Întârziat)</span>}</h3>
            </div>
            <Form method="patch">
                <input className="display-none" name="endDate" value={props.borrow.endDate} readOnly/>
                <button type="submit" name="id" value={props.borrow.id}
                        className="w-full text-black-5 text-lg font-medium text-center bg-orange rounded-2xl">Prelungește
                </button>
            </Form>
            <Form method="delete">
                <button className="w-full text-black-5 text-lg font-medium text-center bg-red rounded-2xl" name="id"
                        value={props.borrow.id}>Revocă
                </button>
            </Form>
            <Form method="put" className="col-span-2">
                <button name="id" value={props.borrow.id}
                        className="w-full text-black-5 text-lg font-medium text-center bg-green rounded-2xl">Returnează
                </button>
            </Form>
        </div>
    )
}

function HistoryCard(props: BookBorrow) {
    return (
        <div className="grid grid-cols-2 gap-4 mt-3 border p-2 rounded-lg">
            <Link className="w-full" to={`/books/${props.book.isbn}`}>
                <h3 className="block mb-2 text-lg font-medium">Titlu</h3>
                <h3 className="text-lg block w-full">{props.book.title}</h3>
            </Link>
            <div className="w-full">
                <h3 className="block mb-2 text-lg font-medium">Autor</h3>
                <h3 className="text-lg block w-full">{props.book.author}</h3>
            </div>
            <div className="w-full">
                <h3 className="block mb-2 text-lg font-medium">Împrumutat pe</h3>
                <h3 className="text-lg block w-full">{props.borrow.startDate}</h3>
            </div>
            <div className="w-full">
                <h3 className="block mb-2 text-lg font-medium">Returnat pe</h3>
                <h3 className="text-lg block w-full">{props.borrow.endDate}</h3>
            </div>
        </div>
    )
}
