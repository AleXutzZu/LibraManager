import {appWindow} from "@tauri-apps/api/window";
import {useEffect, useRef, useState} from "react";
import {UnlistenFn} from "@tauri-apps/api/helpers/event";

export default function TitleBar() {
    const [maximised, setMaximised] = useState<boolean>(false);
    const unsubscribeRef = useRef<UnlistenFn | null>(null);
    useEffect(() => {

        const toggle = async () => {
            return await appWindow.onResized(async () => {
                setMaximised(await appWindow.isMaximized());
            });
        }
        toggle().then(f => unsubscribeRef.current = f);

        return () => {
            unsubscribeRef.current && unsubscribeRef.current();
        }
    }, []);

    return (
        <div data-tauri-drag-region={true} className="flex justify-between h-8 bg-black-25 items-center px-2 border-b">
            <img src="/public/logo.png" alt="Logo" className="h-6 w-auto" data-tauri-drag-region={true}/>
            <div className="flex space-x-4 items-center justify-center">
                <div className="cursor-pointer" onClick={() => appWindow.minimize()}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor"
                         className="w-5 h-5 hover:stroke-green transition ease-in-out duration-150">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 4.5-15 15m0 0h11.25m-11.25 0V8.25"/>
                    </svg>

                </div>
                <div className="cursor-pointer" onClick={async () => {
                    await appWindow.toggleMaximize();
                }}>
                    {maximised &&
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor"
                             className="w-5 h-5 hover:stroke-orange transition ease-in-out duration-150">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"/>
                        </svg>}
                    {!maximised &&
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor"
                             className="w-5 h-5 hover:stroke-orange transition ease-in-out duration-150">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                        </svg>}
                </div>

                <div className="cursor-pointer" onClick={() => appWindow.close()}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor" className="w-5 h-5 hover:stroke-red transition ease-in-out duration-150">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}
