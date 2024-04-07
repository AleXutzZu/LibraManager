import Navigation from "./components/navigation/NavigationBar.tsx";
import {Outlet} from "react-router-dom";
import Footer from "./components/navigation/Footer.tsx";

function Root() {
    return <>
        <Navigation/>
        <Outlet/>
        <Footer/>
    </>
}

export default Root;
