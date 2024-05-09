import {DecodeHintType, useZxing} from "react-zxing";
import {Result} from "@zxing/library";
import {useEffect, useState} from "react";
import {useRootData} from "./useRootData.ts";


type Props = {
    hints?: Map<DecodeHintType, any>,
    onDecodeResult: (result: Result) => void,
    onClose: () => void,
}

export default function ScannerModal(props: Props) {
    const {settings} = useRootData();
    const [error, setError] = useState(false);

    const {ref: videoRef} = useZxing({
        onDecodeResult: props.onDecodeResult,
        hints: props.hints,
        deviceId: settings.cameraDeviceId,
        onError: () => setError(true),
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const processKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") props.onClose();
        }
        document.addEventListener("keydown", processKeyDown);
        return () => {
            document.removeEventListener("keydown", processKeyDown);
        }
    }, []);

    useEffect(() => {
        const loadedDataListener = (_event: any) => {
            if (videoRef.current?.readyState && videoRef.current?.readyState >= 3) setLoading(false);
        }

        videoRef.current?.addEventListener("loadeddata", loadedDataListener);

        return () => {
            videoRef.current?.removeEventListener("loadeddata", loadedDataListener);
        }
    }, []);

    return (
        <div className="absolute z-0 left-0 top-0 h-full w-full !m-0 overflow-auto bg-black-50 bg-opacity-90 flex">
            {!error && <div className="m-auto flex flex-col items-center space-y-3">
                <video width={400} height={200} ref={videoRef}/>
                <div className="font-bold text-2xl">
                    {loading ? "Se încarcă..." : "Plasați codul pe mijlocul camerei"}
                </div>
            </div>}
            {error && <div className="m-auto flex">
                <div className="font-bold text-2xl m-auto text-center px-5">
                    A apărut o eroare la deschiderea scanner-ului! Cel mai probabil camera implicită nu a fost setată din panoul de administrare
                </div>
            </div>}
            <div className="absolute z-0 right-0 top-0 cursor-pointer" onClick={props.onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                     stroke="red" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
            </div>
        </div>
    )
}


