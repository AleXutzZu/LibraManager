import {User} from "../../auth/auth.ts";
import {Settings} from "../settings/settings.ts";
import {useRouteLoaderData} from "react-router-dom";

export type RootLoaderData = {
    user: User | null,
    settings: Settings,
}

export const useRootData = () => {
    return useRouteLoaderData("root") as RootLoaderData;
}
