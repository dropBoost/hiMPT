"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import MENUhomepage from "../componenti/menuGestionale"

export default function Dashboard() {

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="p-5 rounded-lg">
        <MENUhomepage/>
      </div>
    </div>
  )
}
