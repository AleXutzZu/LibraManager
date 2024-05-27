import {authProvider} from "../../auth/auth.ts";
import {ActionFunctionArgs, redirect, useActionData, useSubmit} from "react-router-dom";
import * as Yup from 'yup';
import {Form, Formik} from "formik";
import Input from "../util/Input.tsx";

export async function loader() {
    if (authProvider.isAuthenticated()) return redirect("/");
    return null;
}

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
        await authProvider.login(username, password);
        return redirect("/?index");
    } catch (error) {
        return {
            error: "Datele nu sunt corecte"
        }
    }
}

export default function LoginPage() {
    const submit = useSubmit();
    const error = useActionData() as { error: string } | undefined;

    const validationSchema = Yup.object({
        username: Yup.string().required("Numele de utilizator este obligatoriu"),
        password: Yup.string().required("Parola este obligatorie"),
    });

    return (
        <Formik initialValues={{username: "", password: ""}} onSubmit={async (values) => {
            submit(values, {method: "post"});
        }} validationSchema={validationSchema}>

            {_formik => (
                <div
                    className="m-auto w-2/5 max-w-96 bg-black-5 rounded-xl shadow-black-10 shadow-md min-w-fit py-8 lg:py-16 px-4">
                    {!error && <h2 className="mb-4 text-2xl font-bold">Bun venit!</h2>}
                    {error && <h2 className="mb-4 text-2xl font-bold text-red">{error.error}</h2>}
                    <Form className="w-full">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Input label="Username" type="text" name="username"
                                       className="border text-sm rounded-lg block w-full p-2.5"/>
                            </div>
                            <div className="col-span-2">
                                <Input label="Parolă" type="password" name="password"
                                       className="border text-sm rounded-lg block w-full p-2.5"/>
                            </div>
                        </div>
                        <button
                            className="inline-flex items-center px-2.5 py-2.5 mt-6 text-black-5 text-sm font-medium text-center bg-orange rounded-2xl"
                            type="submit">Loghează-te în cont
                        </button>
                    </Form>
                </div>
            )}
        </Formik>
    )
}
