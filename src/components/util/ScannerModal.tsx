import {DecodeHintType, useZxing} from "react-zxing";
import {Result} from "@zxing/library";
import {useEffect} from "react";


interface Props {
    hints?: Map<DecodeHintType, any>,
    onDecodeResult: (result: Result) => void,
    onClose: () => void,
}

export default function ScannerModal(props: Props) {
    const {ref: videoRef} = useZxing({
        onDecodeResult: props.onDecodeResult,
        hints: props.hints,
    });

    useEffect(() => {
        const processKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") props.onClose();
        }
        document.addEventListener("keydown", processKeyDown);
        return () => {
            document.removeEventListener("keydown", processKeyDown);
        }
    }, []);

    return (
        <div className="absolute z-0 left-0 top-0 w-full h-full overflow-auto bg-black-50 bg-opacity-90 flex">
            <video width={400} height={200} ref={videoRef} className="m-auto"/>
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


