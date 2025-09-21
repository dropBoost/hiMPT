import Image from "next/image"

import { logoExtendedLight, logoLight } from "../cosetting"

export default function Header () {
    return(
        <>
        <div className="flex flex-row justify-between items-center px-5 py-7 bg-brand min-w-full h-10">
            <div className="flex flex-row justify-center">
                <Image src={`${logoLight}`} fill className="object-contain max-h-10"></Image>
            </div>
            <div className="">
                <h1>SOCIAL</h1>
            </div>
        </div>
        </>
    )
}