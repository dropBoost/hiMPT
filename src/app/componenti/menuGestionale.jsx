'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { moduliGestionale } from '@/app/cosetting';

export default function MENUhomepage () {

    const pathname = usePathname();
    const isActive = (path) => pathname?.startsWith(path);

    return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-5 overflow-auto h-full auto-rows-[200px]">
    {moduliGestionale
        .filter(moduli => moduli.attivo === "true")
        .map((modulo, index) => (
        <Link
            key={index}
            href={`${modulo.link}`}
            className={`flex flex-col items-center justify-center rounded-[1.5rem] p-4 w-full aspect-square h-full transition duration-700 ${
            isActive(`/gestionale/${modulo.linkActive}`)
                ? 'bg-brand'
                : 'bg-white dark:bg-neutral-800 text-brand hover:bg-brand dark:hover:bg-brand hover:text-neutral-200 shadow-lg'
            }`}
        >
            <span className='text-[60px]'>{modulo.icon}</span>
            <span className='mt-3 text-sm uppercase text-center break-words'>{modulo.label}</span>
        </Link>
    ))}
    </div>
    );
}