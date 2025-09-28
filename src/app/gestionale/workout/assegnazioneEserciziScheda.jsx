'use client'
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { FaUserSlash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { FaFileDownload } from "react-icons/fa";
import { FaCircle, FaDotCircle } from "react-icons/fa";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import ButtonDeleteRow from "@/app/componenti/buttonDeleteSup";

export default function AssegnazioneEsercizi() {
  const [clienti, setClienti] = useState([])
  const [statusSend, setStatusSend] = useState(false)

  // ricerca
  const [dataSearch, setDataSearch] = useState("")        // testo digitato
  const [dataSearchSubmit, setDataSearchSubmit] = useState("") // testo applicato

  // paginazione
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)

  // calcolo indici per Supabase range (inclusivo)
  const { from, to } = useMemo(() => {
    const start = (page - 1) * pageSize
    return { from: start, to: start + pageSize - 1 }
  }, [page, pageSize])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const escapeLike = (s) => s.replace(/([%_\\])/g, "\\$1")

  // handlers ricerca
  function handleChangeSearchBar(e) {
    setDataSearch(e.target.value)
  }
  function handleSearchClick() {
    setDataSearchSubmit(dataSearch.trim())
    setPage(1) // 🔑 reset pagina quando applichi filtro
  }
  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      setDataSearchSubmit(dataSearch.trim())
      setPage(1)
    }
  }
  function handleReset() {
    setDataSearch("")
    setDataSearchSubmit("")
    setPage(1)
  }

  useEffect(() => {
    const fetchData = async () => {
      let query = supabase
        .from("clienti")
        .select("*", { count: "exact" }) // 🔢 chiedi anche il count totale
        .order("created_at_cliente", { ascending: false })
        .range(from, to) // 📄 pagina corrente

      if (dataSearchSubmit) {
        const q = escapeLike(dataSearchSubmit)
        query = query.or(
          `nome_cliente.ilike.%${q}%,` +
          `cognome_cliente.ilike.%${q}%,` +
          `email_cliente.ilike.%${q}%,` +
          `telefono_cliente.ilike.%${q}%`
        )
      }

      const { data, error, count } = await query
      if (error) {
        console.error("Errore:", error)
        setClienti([])
        setTotalCount(0)
        return
      }
      setClienti(data ?? [])
      setTotalCount(count ?? 0)

      // se filtro/pagina porta fuori range, riporta a ultima pagina valida
      if ((count ?? 0) > 0 && page > Math.ceil((count ?? 0) / pageSize)) {
        setPage(1)
      }
    }

    fetchData()
  }, [dataSearchSubmit, page, pageSize, from, to])

  const iconaCestino = <FaUserSlash/>

  return (
    <div className={` w-full h-[68vh] flex flex-col justify-between gap-3 overflow-hidden`}>
            <p className="p-5">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. A eum nobis excepturi quos, ab suscipit blanditiis placeat sunt dolor! Possimus corrupti a nihil neque magni corporis facere deleniti repellat beatae vitae ipsum illum recusandae error, illo ipsam maxime quod eos mollitia non harum placeat temporibus veritatis laborum perspiciatis! Nisi enim consectetur ullam officia, ex voluptates ea asperiores omnis natus ab explicabo facilis sint quas illo non dolorem facere id debitis. Quae minima aliquam quasi, nam rem doloremque culpa! Magni quas sequi, ipsum, tempora amet quidem itaque nemo harum adipisci ut eos optio aspernatur at aliquid eveniet molestias ad natus? Officiis, atque? Nobis, quos adipisci. Magnam adipisci cupiditate veritatis necessitatibus enim repellendus nulla velit quam laudantium deleniti! Porro ex hic, libero non, explicabo voluptatibus quo blanditiis adipisci ducimus eos, aut necessitatibus reprehenderit assumenda! Nemo, voluptates. Porro in rerum ipsum suscipit dolorem. Amet sint provident excepturi, ratione enim fuga fugiat incidunt temporibus dolore tenetur qui error sed eius maiores delectus at! Quas consequuntur eveniet iste debitis molestias corrupti, ipsam accusamus quis quaerat at commodi, numquam ea quos neque maxime. Praesentium animi veniam asperiores eligendi, quis placeat natus eos, et laudantium amet non explicabo nesciunt recusandae? Architecto autem illo in aspernatur nisi, itaque perspiciatis nobis quo commodi distinctio optio impedit excepturi, id odio quisquam sunt minima repellendus esse error quis ipsam ab. Error sed consequuntur officiis molestias corporis amet vitae neque doloribus eveniet. Commodi cupiditate autem sit asperiores quasi odit voluptate voluptatibus ab voluptas numquam! Assumenda, quos. Reiciendis tempore doloribus voluptatum consectetur dolores architecto, eligendi, minima nihil vero ab itaque fugit numquam repudiandae! Impedit odit numquam saepe alias, natus optio provident corporis cumque repellat ad eius est tempora corrupti quisquam cupiditate ab quidem autem vero. Iste rem exercitationem vero dolores, eum molestias quisquam ut, eligendi praesentium sint tenetur in quidem soluta odio, eaque est dicta? Neque ut aut labore et tenetur voluptate voluptates fuga sint soluta aperiam sequi, cumque fugit ratione suscipit magni! Nisi, veritatis nemo architecto officiis mollitia commodi error deleniti numquam rerum enim. Nam, tempora veniam? Veritatis, quasi? Neque assumenda illo ut beatae unde eveniet ullam pariatur sequi, deleniti voluptatibus reiciendis, harum iusto porro rerum culpa provident ex et dolorum repudiandae expedita aut nesciunt voluptas modi? Quidem commodi perspiciatis omnis esse, distinctio reprehenderit. Numquam sequi delectus corporis cum recusandae! Quaerat rem, alias dolorum id placeat nisi vero optio sunt nostrum, eaque inventore incidunt veritatis dolor magnam beatae, officia et voluptate omnis amet in possimus! Officiis suscipit necessitatibus consectetur distinctio soluta, unde assumenda repellendus at, corporis beatae repudiandae voluptatibus sequi cumque fugiat accusamus, quibusdam minima quaerat blanditiis architecto recusandae aut laborum et. Eaque nemo, nam, quis ad quas nisi at possimus ducimus quae voluptatibus dolorem odio illum, mollitia beatae quam voluptatem tempore sequi tempora repudiandae commodi reiciendis. Ipsa quia unde accusantium illo pariatur, sapiente mollitia, veritatis repellat animi voluptates nobis vitae obcaecati! Cupiditate corrupti, architecto cum repudiandae ratione harum? Officiis architecto blanditiis, neque asperiores, placeat nemo suscipit corporis atque officia amet qui eos laborum cupiditate iusto quos ipsam odit corrupti repellat earum?
            </p>
    </div>
  )
}
