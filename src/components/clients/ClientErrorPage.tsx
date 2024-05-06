import {useRouteError} from "react-router-dom";


export default function ClientErrorPage() {
    const error = useRouteError();
    console.log(error);
    return (
        <>{error}</>
    )
}
