"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { poweredBy } from "../cosetting"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)





  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-brand">
      <Image src="/logo-fullwhite.png" width={150} height={100} className="" alt="logo"/>
      <form onSubmit={console.log("configura supabase auth")} className="grid gap-2 w-64">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-dark text-white py-2 rounded hover:bg-brand-light hover:text-brand"
        >
          {loading ? "Caricamento..." : "ENTRA"}
        </button>
      </form>
      <div className="mt-5">
        <span className="text-white text-xs">{poweredBy}</span>
      </div>
    </div>
  )
}
