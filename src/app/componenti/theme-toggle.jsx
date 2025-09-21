'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { FaSun, FaMoon } from "react-icons/fa";


export function ThemeToggle(){

    const {theme, setTheme} = useTheme();

    return (
        <Button
            variant='ghost'
            size='icon'
            className='rounded-full h-6'
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
            <FaSun className='absolute h-5 w-5 rotate-0 scale-100 dark:-rotate-90 dark:scale-0'></FaSun>
            <FaMoon className='absolute h-5 w-5 rotate-0 scale-0 dark:-rotate-0 dark:scale-100'></FaMoon>
        </Button>
    )
}