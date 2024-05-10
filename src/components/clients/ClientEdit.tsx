import {ActionFunctionArgs, redirect, useActionData, useLoaderData, useNavigate, useSubmit} from "react-router-dom";
import {Client, translator} from "./ClientsPage.tsx";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../util/Input.tsx";
import {invoke} from "@tauri-apps/api/tauri";

type PathParams = {
    clientId: string;
}

export async function action({request, params}: ActionFunctionArgs<PathParams>) {
    const formData = await request.formData();

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const id = params.clientId as string;

    const client: Client = {id, firstName, lastName, email, phone};

    try {
        await invoke("update_client", {client});
        return redirect(`/clients/${params.clientId}`);
    } catch (error) {
        return {
            message: "Numărul de telefon / Adresa de email există deja"
        }
    }
}

export default function ClientEdit() {
    const {client} = useLoaderData() as { client: Client };
    const navigate = useNavigate();
    const submit = useSubmit();
    const data = useActionData() as { message: string } || undefined;

    const validationSchema = Yup.object({
        firstName: Yup.string().matches(/^\w+$/, {message: "Prenumele este invalid"}).required("Prenumele este obligatoriu"),
        lastName: Yup.string().matches(/^\w+$/, {message: "Numele este invalid"}).required("Numele este obligatoriu"),
        email: Yup.string().matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {message: "Email-ul este invalid"}).required("Email-ul este obligatoriu"),
        phone: Yup.string().matches(/^(0\d{9})$/, {message: "Numărul este invalid"}).required("Numărul este obligatoriu"),
    });

    return (
        <Formik initialValues={{
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phone: client.phone,
        }} validationSchema={validationSchema} onSubmit={async (values) => {
            submit(values, {method: "post"});
        }}>
            {_formik => (

                <div className="overflow-auto flex-grow flex items-center justify-center">
                    <div className="bg-black-5 rounded-xl shadow-black-10 shadow-md min-w-fit lg:w-2/5">
                        <div className="py-8 px-4 mx-auto lg:py-16">
                            {data && data.message && <h2 className="mb-4 text-lg font-bold text-red">{data.message}</h2>}
                            {!data && <h2 className="mb-4 text-2xl font-bold">Editează client</h2>}
                            <Form>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="w-full">
                                        <Input label="Prenume" type="text" name="firstName"
                                               className="border text-sm rounded-lg block w-full p-2.5"
                                               placeholder="Prenume"/>
                                    </div>

                                    <div className="w-full">
                                        <Input label="Nume" type="text" name="lastName"
                                               className="border text-sm rounded-lg block w-full p-2.5"
                                               placeholder="Nume"/>
                                    </div>

                                    <div className="col-span-2">
                                        <Input label="Adresa de email" type="text" name="email"
                                               className="border text-sm rounded-lg block w-full p-2.5"
                                               placeholder="Tastează adresa de email"/>
                                    </div>
                                    <div className="w-full">
                                        <Input label="Telefon" type="text" name="phone"
                                               className="border text-sm rounded-lg block w-full p-2.5"
                                               placeholder="Numărul de telefon"/>
                                    </div>
                                    <div className="w-full">
                                        <h3 className="block mb-2 text-sm font-medium">ID (scurt)</h3>
                                        <h3 className="text-lg pt-1 block w-full">{translator.fromUUID(client.id)}</h3>
                                    </div>

                                    <div className="w-full">
                                        <button type="submit"
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
                    </div>
                </div>
            )}
        </Formik>
    )
}
