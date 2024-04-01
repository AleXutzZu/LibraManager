import {authProvider} from "../../auth/auth.ts";
import {Form, LoaderFunctionArgs, redirect, useActionData, useNavigation} from "react-router-dom";


export async function loader() {
    if (authProvider.isAuthenticated) return redirect("/");
    return null;
}

export async function action({request}: LoaderFunctionArgs) {
    const formData = await request.formData();
    const username = formData.get("username") as string | null;
    const password = formData.get("password") as string | null;

    if (!username || !password) {
        return {
            error: "You must provide the credentials"
        };
    }

    try {
        await authProvider.login(username, password);

    } catch (error) {
        return {
            error: "Invalid login"
        }
    }
    return redirect("/");
}

export default function LoginPage() {
    const navigation = useNavigation();

    const isLoggingIn = navigation.formData?.get("username") != null && navigation.formData?.get("password") != null;
    const error = useActionData() as { error: string } | undefined;

    return (
        <div>
            <Form method="post" replace>
                <label>Username: <input name="username"/></label>
                <label>Password: <input name="password"/></label>

                <button type="submit" disabled={isLoggingIn}>
                    {isLoggingIn ? "Logging in..." : "Login in"}
                </button>

                {error && error.error ? (<p>{error.error}</p>) : null}
            </Form>
        </div>
    )
}