import {authProvider, User} from "../../auth/auth.ts";
import {ActionFunctionArgs, redirect, useNavigate, useRouteLoaderData, useSubmit} from "react-router-dom";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../util/Input.tsx";
import {invoke} from "@tauri-apps/api/tauri";

export async function loader() {
    if (!authProvider.isAuthenticated) return redirect("/login");
    return null;
}

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();

    const username = authProvider.getUsername() as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const newPassword = formData.get("newPassword") as string;

    const user = {username, firstName, lastName, password: newPassword.length === 0 ? undefined : newPassword};

    console.log(user)

    try {
        await invoke("update_user", {user, password});
    } catch (error) {
        console.log("Actual error", error);
    }

    return redirect("/");
}

export default function AccountSettings() {
    const {user} = useRouteLoaderData("root") as { user: User };
    const submit = useSubmit();
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        firstName: Yup.string().required("Prenumele este obligatoriu").matches(/^\w+$/, {message: "Prenumele este invalid"}),
        lastName: Yup.string().required("Numele este obligatoriu").matches(/^\w+$/, {message: "Numele este invalid"}),
        newPassword: Yup.string().matches(/^\w+$/, {message: "Parola este invalidă"})
            .min(8, "Parola trebuie să aibă minim 8 caractere")
            .max(20, "Parola poate avea maxim 20 de caractere"),
        repeatPassword: Yup.string().oneOf([Yup.ref("newPassword")], "Parolele nu se potrivesc"),
        password: Yup.string().required("Parola este obligatorie").matches(/^\w+$/, {message: "Parola este invalidă"}),
    })

    return (
        <div className="flex flex-grow">
            <div className="m-auto shadow-black-10 shadow-md rounded-2xl bg-black-5">
                <div className="py-8 px-4 mx-auto lg:py-16">
                    <h2 className="mb-4 text-2xl font-bold">Editează informații</h2>
                    <Formik initialValues={{
                        firstName: user.firstName,
                        lastName: user.lastName,
                        password: "",
                        repeatPassword: "",
                        newPassword: "",
                    }} onSubmit={(values) => {
                        submit(values, {method: "post"});
                    }}
                            validationSchema={validationSchema}>
                        {formik => (
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
                                    <div className="w-full">
                                        <Input label="Parola nouă" type="password" name="newPassword"
                                               className="border text-sm rounded-lg block w-full p-2.5"
                                               placeholder=""/>
                                    </div>
                                    <div className="w-full">
                                        <Input label="Confirmă parola" type="password" name="repeatPassword"
                                               className="border text-sm rounded-lg block w-full p-2.5"
                                               placeholder=""/>
                                    </div>

                                    <div className="col-span-2">
                                        <Input label="Parola curentă" type="password" name="password"
                                               className="border text-sm rounded-lg block w-full p-2.5"
                                               placeholder=""/>
                                    </div>

                                    <div className="w-full">
                                        <button type="submit" disabled={formik.isSubmitting}
                                                className="w-full block items-center px-0.5 py-1.5 mt-6 text-black-5 text-lg font-medium text-center bg-green rounded-2xl">
                                            Salvare
                                        </button>
                                    </div>

                                    <div className="w-full">
                                        <button type="button" onClick={() => {
                                            navigate("/");
                                        }}
                                                className="block items-center px-0.5 py-1.5 mt-6 text-black-5 text-lg font-medium text-center bg-red rounded-2xl w-full">
                                            Anulează
                                        </button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    )
}
