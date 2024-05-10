import {useRootData} from "../util/useRootData.ts";
import {ActionFunctionArgs, redirect, useSubmit} from "react-router-dom";
import {Settings, settingsProvider} from "./settings.ts";
import * as Yup from "yup";
import {Form, Formik, useField} from "formik";
import Input from "../util/Input.tsx";
import {ReactNode} from "react";
import {useMediaDevices} from "react-media-devices";

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();

    const libraryName = formData.get("libraryName") as string;
    const deviceId = formData.get("deviceId") as string;

    const settings: Settings = {libraryName, cameraDeviceId: deviceId};

    await settingsProvider.saveCurrentSettings(settings);
    return redirect("/");
}

export default function GeneralSettings() {
    const {settings} = useRootData();
    const submit = useSubmit();
    const {devices} = useMediaDevices({constraints: {video: true}});

    const validationSchema = Yup.object({
        libraryName: Yup.string().matches(/^.+$/, {message: "Numele este invalid"}),
        deviceId: Yup.string()
    })

    return (
        <div className="max-w-xl mx-auto">
            <Formik initialValues={{
                libraryName: settings.libraryName,
                deviceId: settings.cameraDeviceId,
            }} onSubmit={(values) => {
                submit(values, {method: "post"});
            }} validationSchema={validationSchema}>
                <Form>
                    <div className="mr-auto grid grid-cols-1 gap-4">
                        <div className="w-full">
                            <Input label="Nume librărie" name="libraryName" type="text"
                                   className="border text-sm rounded-lg block w-full p-2.5"/>
                        </div>
                        <div className="w-full">
                            <Select label="Cameră pentru scan" name="deviceId"
                                    className="border text-sm rounded-lg block w-full p-2.5">
                                <option value="">Camera implicită</option>
                                {devices?.filter(device => device.kind === "videoinput").map((device) => (
                                    <option value={device.deviceId} key={device.deviceId}>{device.label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <button type="submit"
                            className="inline-flex items-center px-2.5 py-2.5 mt-6 text-black-5 text-lg font-medium text-center bg-orange rounded-2xl">
                        Salvează
                    </button>
                </Form>
            </Formik>
        </div>)
}

type Props = {
    label: string,
    children: ReactNode,
    name: string,
    className?: string,
}

function Select({label, ...props}: Props) {
    const [field, meta] = useField(props);

    const labelErrorClasses: string = "block mb-2 text-sm font-medium text-red";

    return (
        <>
            {meta.touched && meta.error ?
                <label htmlFor={props.name}
                       className={labelErrorClasses}>{meta.error}</label>
                :
                <label htmlFor={props.name}
                       className="block mb-2 text-sm font-medium">{label}</label>}
            <select {...field} {...props}/>
        </>
    )
}
