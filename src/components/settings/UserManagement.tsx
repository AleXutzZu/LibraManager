import {invoke} from "@tauri-apps/api/tauri";
import {authProvider, User} from "../../auth/auth.ts";
import {ActionFunctionArgs, Form, redirect, useActionData, useLoaderData, useSubmit} from "react-router-dom";
import {useMemo, useState} from "react";
import * as Yup from "yup";
import {Field, Form as FormikForm, Formik} from "formik";
import Input from "../util/Input.tsx";


type LoaderData = {
    users: User[],
}

export async function loader() {
    if (!authProvider.isAuthenticated()) return redirect("/login");
    const users = await invoke("fetch_users") as User[];

    return {users: users.filter(user => user.username != authProvider.getUsername())};
}

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const role = formData.get("role") as "admin" | "user";

    const user = {username, role, lastName, firstName, password};

    try {
        await invoke("create_user", {user});
        return null;
    } catch (error) {
        console.log(error);
        return {
            error: "Utilizatorul există deja"
        }
    }
}

export async function deleteAction({request}: ActionFunctionArgs) {
    const formData = await request.formData();
    const username = formData.get("username") as string;

    await invoke("delete_user", {username});
    return null;
}

export default function UserManagement() {
    const {users} = useLoaderData() as LoaderData;
    const [search, setSearch] = useState("");
    const submit = useSubmit();
    const data = useActionData() as { error: string } | null;
    const filtered = useMemo((): User[] => {
        const expression = new RegExp(search, "i");
        return users.filter((user) => {
            const fullName = `${user.firstName} ${user.lastName}`;
            return user.username.search(expression) > -1 || fullName.search(expression) > -1;
        })
    }, [users, search]);

    const validationSchema = Yup.object({
        username: Yup.string().required("Numele de utilizator este obligatoriu").matches(/^\w+$/, {message: "Numele de utilizator este invalid"}),
        password: Yup.string().required("Parola este obligatorie")
            .min(8, "Trebuie minim 8 caractere")
            .max(16, "Trebuie maxim 16 caractere")
            .matches(/^\w+$/, {message: "Parola este invalidă"}),
        firstName: Yup.string().required("Prenumele este obligatoriu").matches(/^.+$/, {message: "Prenumele este invalid"}),
        lastName: Yup.string().required("Numele este obligatoriu").matches(/^.+$/, {message: "Numele este invalid"}),
        role: Yup.string().required("Role is required"),
    })

    return (
        <div className="w-full flex justify-start items-start h-full overflow-auto">
            <div className="flex flex-col space-y-4 h-full items-start w-52">
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                       className="px-2 py-2 border rounded-xl w-full" placeholder="Caută..."/>
                <div className="overflow-auto flex flex-col space-y-2 w-full divide-y">
                    {filtered.length == 0 &&
                        <h1 className="text-center text-sm font-medium text-black-75"><i>Nu există alți utilizatori</i>
                        </h1>}
                    {filtered.map(user => (<UserCard {...user} key={user.username}/>))}
                </div>
            </div>
            <div className="flex mx-auto">
                <div className="bg-black-5 shadow-black-10 shadow-md rounded-2xl px-4 py-8 m-auto overflow-auto">
                    {!data && <h2 className="mb-4 text-xl font-bold">Adaugă un nou utilizator</h2>}
                    {data && <h2 className="mb-4 text-xl font-bold text-red">{data.error}</h2>}
                    <Formik initialValues={{
                        username: "",
                        password: "",
                        firstName: "",
                        lastName: "",
                        role: "user",
                    }} onSubmit={(values) => {
                        submit(values, {method: "post"});
                    }} validationSchema={validationSchema}>
                        <FormikForm>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 lg:w-full lg:col-span-1">
                                    <Input label="Prenume" name="firstName" type="text"
                                           className="border text-sm rounded-lg block w-full p-2.5"/>
                                </div>
                                <div className="col-span-2 lg:w-full lg:col-span-1">
                                    <Input label="Nume" name="lastName" type="text"
                                           className="border text-sm rounded-lg block w-full p-2.5"/>
                                </div>
                                <div className="col-span-2">
                                    <Input label="Username" name="username" type="text"
                                           className="border text-sm rounded-lg block w-full p-2.5"/>
                                </div>
                                <div className="col-span-2">
                                    <Input label="Parola" name="password" type="password"
                                           className="border text-sm rounded-lg block w-full p-2.5"/>
                                </div>
                                <div className="col-span-2 flex flex-col">
                                    <label className="block mb-2 text-sm font-medium">Rol</label>
                                    <label className="flex items-center justify-start mb-2 text-sm font-medium">
                                        <Field type="radio" name="role" value="user"/>
                                        <p className="ml-2">user</p>
                                    </label>
                                    <label className="flex items-center justify-start mb-2 text-sm font-medium">
                                        <Field type="radio" name="role" value="admin"/>
                                        <p className="ml-2">admin</p>
                                    </label>
                                </div>
                            </div>
                            <button type="submit"
                                    className="inline-flex items-center px-2.5 py-2.5 mt-6 text-black-5 text-sm font-medium text-center bg-orange rounded-2xl">
                                Adaugă utilizator
                            </button>
                        </FormikForm>
                    </Formik>
                </div>
            </div>
        </div>
    )
}

function UserCard(props: User) {
    return (
        <div className="flex justify-between items-center">
            <div className="flex flex-col items-start justify-start">
                <h1 className="text-lg font-medium">{props.firstName} {props.lastName}</h1>
                <h1 className="text-sm"><i>{props.role}</i></h1>
            </div>
            <Form action="delete" method="post">
                <input readOnly value={props.username} className="display-none" name="username"/>
                <button type="submit"
                        className="w-full items-center px-1.5 py-1.5 text-black-5 text-sm font-medium text-center bg-red rounded-2xl">
                    Șterge
                </button>
            </Form>
        </div>
    )
}
