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

export default function ElencoEsercizi() {
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
    <div className={` w-full flex flex-col justify-between gap-3 overflow-auto`}>
      {/* Barra ricerca */}
      <div className="flex w-full items-center gap-2">
        <Input
          type="text"
          id="cerca"
          placeholder="Cerca nome, cognome, email o telefono…"
          value={dataSearch}
          onChange={handleChangeSearchBar}
          onKeyDown={handleSearchKeyDown}
          className="appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand
                     focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand"
        />
        <Button type="button" onClick={handleSearchClick}>Cerca</Button>
        <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
      </div>

      {/* Tabella */}
      <div className="flex flex-col flex-1 justify-between">
        <Table>
          <TableCaption>
            {totalCount > 0
              ? `Trovati ${totalCount} clienti • Pagina ${page} di ${totalPages}`
              : "Nessun risultato"}
          </TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className="border-e border-brand text-center truncate">Stato</TableHead>
              <TableHead className="text-right truncate">Codice Fiscale</TableHead>
              <TableHead className="truncate">Nome</TableHead>
              <TableHead className="truncate">Cognome</TableHead>
              <TableHead className="truncate">Città di Residenza</TableHead>
              <TableHead className="truncate">Email</TableHead>
              <TableHead className="truncate">Telefono</TableHead>
              <TableHead className="truncate">Carta d'Identità</TableHead>
              <TableHead className="border-e border-brand truncate">Data Iscrizione</TableHead>
              <TableHead className="border-e border-brand truncate text-center">-GG</TableHead>
              <TableHead className="text-center truncate">R</TableHead>
              <TableHead className="text-center truncate">M</TableHead>
              <TableHead className="text-center truncate">E</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clienti.length ? clienti.map((cliente, index) => {
              const d = new Date(cliente.created_at_cliente)
              const dataFormattata = d.toLocaleDateString("it-IT", {
                year: "numeric", month: "2-digit", day: "2-digit",
              })

              return (
                <TableRow key={`${cliente.uuid_cliente ?? index}`}>
                  <TableCell className="text-center border-e border-brand ">
                    <div className=" flex flex-col justify-center items-center w-full h-full">
                      {cliente.attivo_cliente ? <FaCircle className="text-green-700"/> : <FaDotCircle className="text-red-700"/>}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-right">{cliente.codice_fiscale_cliente}</TableCell>
                  <TableCell>{cliente.nome_cliente}</TableCell>
                  <TableCell>{cliente.cognome_cliente}</TableCell>
                  <TableCell>{cliente.citta_cliente} - {cliente.provincia_cliente}</TableCell>
                  <TableCell>{cliente.email_cliente}</TableCell>
                  <TableCell>{cliente.telefono_cliente}</TableCell>
                  <TableCell>{cliente.carta_identita_cliente}</TableCell>
                  <TableCell className="border-e border-brand">{dataFormattata}</TableCell>
                  <TableCell className="border-e border-brand text-center">-60</TableCell>
                  <TableCell className="hover:bg-green-700 text-green-700 hover:text-neutral-200">
                    <div className=" flex flex-col justify-center items-center w-full h-full">
                    <FaFileDownload />
                    </div>
                  </TableCell>
                  <TableCell className="hover:bg-brand/50 text-brand/70 hover:text-neutral-200">
                    <div className=" flex flex-col justify-center items-center w-full h-full">
                    <HiPencilAlt />
                    </div>
                  </TableCell>
                  <TableCell className="hover:bg-red-700 text-red-700 hover:text-neutral-200">
                    <div className=" flex flex-col justify-center items-center w-full h-full">
                    <ButtonDeleteRow
                      uuid={cliente.uuid_cliente}
                      tabella="clienti"
                      nomeAttributo="uuid_cliente"
                      icona={<FaUserSlash/>}
                      confirmMessage="Sei sicuro di eliminare questo cliente?"
                      onDeleted={(id) =>
                        setClienti(prev => prev.filter(c => c.uuid_cliente !== id))
                      }
                    />
                    </div>
                  </TableCell>

                </TableRow>
              )
            }) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">Nessun risultato.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm opacity-80">
            {totalCount > 0 && (
              <>
                Mostrati{" "}
                <strong>
                  {Math.min(totalCount, from + 1)}–{Math.min(totalCount, to + 1)}
                </strong>{" "}
                di <strong>{totalCount}</strong>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <span className="text-sm tabular-nums">Pag. {page} / {totalPages}</span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || totalCount === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
