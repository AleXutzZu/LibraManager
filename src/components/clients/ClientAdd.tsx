import {invoke} from "@tauri-apps/api/tauri";
import * as Yup from "yup";
import {Form, Formik, useField} from "formik";
import {useActionData, useSubmit} from "react-router-dom";
import {Client, translator} from "./ClientsPage.tsx";

type ClientResponse = {
    ok: boolean,
    message: string,
}

export async function action({request}: { request: Request }): Promise<ClientResponse> {
    const formData = await request.formData();
    const id = translator.toUUID(formData.get("id") as string);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    const client: Client = {id, firstName, lastName, email, phone};

    try {
        await invoke("create_client", {client});
        return {
            ok: true,
            message: "Client adăugat cu succes"
        }
    } catch (error) {
        return {
            ok: false,
            message: "Acest client există deja în baza de date"
        }
    }
}

export default function ClientAdd() {
    const validationSchema = Yup.object({
        id: Yup.string(),
        firstName: Yup.string().required("Prenumele este obligatoriu"),
        lastName: Yup.string().required("Numele este obligatoriu"),
        email: Yup.string().email("Email-ul este invalid").required("Email-ul este obligatoriu"),
        phone: Yup.string().required("Numărul este obligatoriu").matches(/^(0\d{9})$/, {message:"Numărul este invalid"}),
    })

    const submit = useSubmit();
    const data = useActionData() as ClientResponse | undefined;


    return (
        <Formik initialValues={
            {
                id: translator.generate(),
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
            }
        }
                validationSchema={validationSchema}
                onSubmit={async (values) => {
                    submit(values, {method: "post"});
                }}>
            {formik => (
                <section className="bg-black-5 m-auto rounded-xl shadow-black-10 shadow-md">
                    <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
                        {!data && <h2 className="mb-4 text-xl font-bold">Adaugă un nou client</h2>}
                        {data && (data.ok ? <h2 className="mb-4 text-xl font-bold text-green">{data.message}</h2> :
                            <h2 className="mb-4 text-xl font-bold text-red">{data.message}</h2>)}
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
                                    <Input label="ID Utilizator" type="text" name="id"
                                           className="border text-sm rounded-lg block w-full p-2.5"
                                           placeholder="ID" disabled/>
                                </div>
                                <div className="w-full">
                                    <Input label="Telefon" type="text" name="phone"
                                           className="border text-sm rounded-lg block w-full p-2.5"
                                           placeholder="Numărul de telefon"/>
                                </div>
                            </div>
                            <button type="submit" disabled={formik.isSubmitting}
                                    className="inline-flex items-center px-2.5 py-2.5 mt-6 text-black-5 text-sm font-medium text-center bg-orange rounded-2xl">
                                Adaugă client
                            </button>
                        </Form>
                    </div>
                </section>
            )}
        </Formik>
    )
}

type Props = {
    className?: string,
    placeholder?: string,
    disabled?: boolean,
    label: string,
    type: string,
    name: string,
}

const Input = ({label, ...props}: Props) => {
    const [field, meta] = useField({...props})

    const labelErrorClasses: string = "block mb-2 text-sm font-medium text-red";

    return (
        <>
            {meta.touched && meta.error ?
                <label htmlFor={props.name}
                       className={labelErrorClasses}>{meta.error}</label>
                :
                <label htmlFor={props.name}
                       className="block mb-2 text-sm font-medium">{label}</label>}
            <input {...field} {...props}/>
        </>
    )
}
