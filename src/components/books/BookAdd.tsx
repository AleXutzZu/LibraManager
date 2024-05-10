import {Book} from "./BooksPage.tsx";
import {invoke} from "@tauri-apps/api/tauri";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import {useActionData, useSubmit} from "react-router-dom";
import Scanner from "../util/Scanner.tsx";
import {BarcodeFormat, DecodeHintType} from "@zxing/library";
import Input from "../util/Input.tsx";

type BookResponse = {
    ok: boolean,
    message: string,
}

export async function action({request}: { request: Request }): Promise<BookResponse> {
    const formData = await request.formData();
    const isbn = formData.get("isbn") as string;
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const items = Number(formData.get("items") as string);

    const book: Book = {isbn, title, author, items};

    try {
        await invoke("create_book", {book});
        return {
            ok: true,
            message: "Carte adăugată cu succes"
        }
    } catch (error) {
        return {
            ok: false,
            message: "Acest ISBN există deja în baza de date"
        }
    }
}

export default function BookAdd() {
    const validationSchema = Yup.object({
        isbn: Yup.string().required("ISBN-ul este obligatoriu").matches(/^[0-9]{13}$/, {message: "ISBN-ul nu este valid"}),
        title: Yup.string().required("Titlul este obligatoriu").matches(/^\w+$/, {message: "Titlul este invalid"}),
        author: Yup.string().required("Autorul este obligatoriu").matches(/^\w+$/, {message: "Autorul este invalid"}),
        items: Yup.number().required("Exemplarele sunt obligatorii"),
    })

    const submit = useSubmit();
    const data = useActionData() as BookResponse | undefined;

    const decodeHints = new Map<DecodeHintType, any>();
    decodeHints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);

    return (
        <Formik initialValues={{title: "", author: "", isbn: "", items: 1}} validationSchema={validationSchema}
                onSubmit={async (values) => {
                    submit(values, {method: "post"});
                }}>
            {formik => (
                <section className="bg-black-5 m-auto rounded-xl shadow-black-10 shadow-md">
                    <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
                        {!data && <h2 className="mb-4 text-xl font-bold">Adaugă o nouă carte</h2>}
                        {data && (data.ok ? <h2 className="mb-4 text-xl font-bold text-green">{data.message}</h2> :
                            <h2 className="mb-4 text-xl font-bold text-red">{data.message}</h2>)}
                        <Form>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <Input label="Titlu" type="text" name="title"
                                           className="border text-sm rounded-lg block w-full p-2.5"
                                           placeholder="Tastează titlul cărții"/>
                                </div>
                                <div className="col-span-2">
                                    <Input label="Autor(i)" type="text" name="author"
                                           className="border text-sm rounded-lg block w-full p-2.5"
                                           placeholder="Tastează autorul(ii) cărții"/>
                                </div>
                                <div className="w-full">
                                    <Input label="ISBN" type="text" name="isbn"
                                           className="border text-sm rounded-lg block w-full p-2.5"
                                           placeholder="ISBN">

                                        <Scanner hints={decodeHints} onDecode={(result) => {
                                            formik.setFieldValue("isbn", result.getText(), false)
                                        }}/>
                                    </Input>
                                </div>
                                <div className="w-full">
                                    <Input label="Exemplare" type="number" name="items"
                                           className="border text-gray-900 text-sm rounded-lg block w-full p-2.5"/>
                                </div>
                            </div>
                            <button type="submit"
                                    className="inline-flex items-center px-2.5 py-2.5 mt-6 text-black-5 text-sm font-medium text-center bg-orange rounded-2xl">
                                Adaugă carte
                            </button>
                        </Form>
                    </div>
                </section>
            )}
        </Formik>
    )
}

