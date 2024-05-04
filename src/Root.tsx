import Navigation from "./components/navigation/NavigationBar.tsx";
import {Outlet} from "react-router-dom";

function Root() {
    return <>
        <Navigation/>
        <Outlet/>
    </>
}

export default Root;
