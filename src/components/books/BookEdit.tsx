import * as Yup from "yup";
import {ActionFunctionArgs, redirect, useLoaderData, useNavigate, useSubmit} from "react-router-dom";
import {Form, Formik} from "formik";
import Input from "../util/Input.tsx";
import {Book} from "./BooksPage.tsx";
import {invoke} from "@tauri-apps/api/tauri";

type PathParams = {
    isbn: string
}

export async function action({params, request}: ActionFunctionArgs<PathParams>) {
    const formData = await request.formData();

    const isbn = params.isbn as string;
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const items = Number(formData.get("items") as string);

    const book: Book = {isbn, title, author, items};
    await invoke("update_book", {book});
    return redirect(`/books/${isbn}`);
}

export default function BookEdit() {
    const validationSchema = Yup.object({
        title: Yup.string().required("Titlul este obligatoriu"),
        author: Yup.string().required("Autorul este obligatoriu"),
        items: Yup.number().required("Exemplarele sunt obligatorii"),
    })
    const {book} = useLoaderData() as { book: Book };
    const submit = useSubmit();
    const navigate = useNavigate();

    return (
        <Formik initialValues={{title: book.title, author: book.author, items: book.items}}
                validationSchema={validationSchema}
                onSubmit={async (values) => {
                    submit(values, {method: "post"});
                }}>
            {formik => (
                <section className="bg-black-5 m-auto rounded-xl shadow-black-10 shadow-md">
                    <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
                        <h2 className="mb-4 text-xl font-bold">Editează carte</h2>
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
                                    <h3 className="block mb-2 text-sm font-medium">ISBN</h3>
                                    <h3 className="text-lg pt-1 block w-full">{book.isbn}</h3>
                                </div>
                                <div className="w-full">
                                    <Input label="Exemplare" type="number" name="items"
                                           className="border text-gray-900 text-sm rounded-lg block w-full p-2.5"/>
                                </div>
                                <div className="w-full">
                                    <button type="submit" disabled={formik.isSubmitting}
                                            className="w-full block items-center px-0.5 py-1.5 mt-6 text-black-5 text-lg font-medium text-center bg-green rounded-2xl">
                                        Salvare
                                    </button>
                                </div>
                                <div className="w-full">
                                    <button type="button" onClick={() => {
                                        navigate(-1);
                                    }}
                                            className="block items-center px-0.5 py-1.5 mt-6 text-black-5 text-lg font-medium text-center bg-red rounded-2xl w-full">
                                        Anulează
                                    </button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </section>
            )}
        </Formik>
    )
}