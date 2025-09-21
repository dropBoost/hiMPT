'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { moduliGestionale } from '@/app/cosetting';
import { FaHome } from "react-icons/fa";

const iconaHome = "ciao"

export default function MenuSidebar () {

    const pathname = usePathname();

    // Modifica qui: isActive controlla se pathname inizia con 'path'
    const isActive = (path) => pathname?.startsWith(path);
    const isActiveHome = (path) => pathname == path;

    return (
        <ul className="flex flex-row md:flex-col gap-2">
        <li>
            <Link
            href={`/gestionale`}
            title={`GESTIONALE`}
            className={`flex items-center justify-center rounded-full p-2 md:h-[40px] md:w-[40px] h-[30px] w-[30px] transition duration-700 ${
                isActiveHome(`/gestionale`) ? 'bg-brand text-neutral-100' : 'bg-neutral-100 dark:bg-neutral-900 text-brand hover:bg-brand hover:text-neutral-200'
            }`}
            >
            <FaHome/>
            </Link>
        </li>
        {moduliGestionale
            .filter(moduli => moduli.attivo === "true")
            .map(modulo => (
            <li key={modulo.name}>
                <Link
                href={`${modulo.link}`}
                title={modulo.linkActive}
                className={`flex items-center justify-center rounded-full p-2 md:h-[40px] md:w-[40px] h-[30px] w-[30px] transition duration-700 ${
                    isActive(`/gestionale/${modulo.linkActive}`) ? 'bg-brand text-neutral-100' : 'bg-neutral-100 dark:bg-neutral-900 text-brand hover:bg-brand dark:hover:bg-brand hover:text-neutral-200'
                }`}
                >
                {modulo.icon}
                </Link>
            </li>
            ))
        }
        </ul>
    );
}
