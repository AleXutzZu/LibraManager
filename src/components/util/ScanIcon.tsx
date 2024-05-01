interface Props {
    onClick?: () => void;
}

export default function ScanIcon(props: Props) {
    return (
        <div className="group flex flex-col relative cursor-pointer justify-center items-center"
             onClick={() => props.onClick && props.onClick()}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                <path
                    d="M40-120v-200h80v120h120v80H40Zm680 0v-80h120v-120h80v200H720ZM160-240v-480h80v480h-80Zm120 0v-480h40v480h-40Zm120 0v-480h80v480h-80Zm120 0v-480h120v480H520Zm160 0v-480h40v480h-40Zm80 0v-480h40v480h-40ZM40-640v-200h200v80H120v120H40Zm800 0v-120H720v-80h200v200h-80Z"/>
            </svg>
            <div
                className="absolute invisible group-hover:visible bg-black-100 w-16 flex items-center justify-center rounded-2xl top-7">
                <p className="text-xs text-black-5 font-bold">Scanează</p>
            </div>
        </div>
    )
}
