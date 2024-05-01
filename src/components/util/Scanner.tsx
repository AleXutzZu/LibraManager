import {useState} from "react";
import {Result} from "@zxing/library";
import {DecodeHintType} from "react-zxing";
import ScanIcon from "./ScanIcon.tsx";
import ScannerModal from "./ScannerModal.tsx";

interface Props {
    hints?: Map<DecodeHintType, any>,
    onDecode: (result: Result) => void
}

export default function Scanner(props: Props) {
    const [showScanner, setShowScanner] = useState(false);

    const closeScanner = () => setShowScanner(false);

    const process = (result: Result) => {
        props.onDecode(result);
        closeScanner();
    }

    return (
        <>
            <ScanIcon onClick={() => setShowScanner(true)}/>
            {showScanner && <ScannerModal onDecodeResult={process} onClose={() => setShowScanner(false)}/>}
        </>)
}
