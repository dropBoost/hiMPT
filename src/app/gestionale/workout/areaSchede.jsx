'use client'
import { useEffect, useMemo, useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { VscDebugRestart } from "react-icons/vsc"
import { FaTrashCan, FaArrowTrendUp } from "react-icons/fa6";
import { IoBody } from "react-icons/io5";



export default function AreaSchede({ onDisplay, statusEsercizi }) {

  const [esercizi, setEsercizi] = useState([])
  const [statusDeleted, setStatusDeleted] = useState(false)
  const [statusSend, setStatusSend] = useState(false)
  const [changeScheda, setChangeScheda] = useState(false)
  const today = new Date().toISOString();

  const [open, setOpen] = React.useState(false)
  const [datasetAllenamenti, setDatasetAllenamenti] = useState([])
  const [schedaSelezionata, setSchedaSelezionata] = useState("");
  const [clienteSelezionato, setClienteSelezionato] = useState({});
  const [eserciziDaAssegnare, setEserciziDaAssegnare] = useState([])
  const [eserciziAssegnati, setEserciziAssegnati] = useState([])
  const isFirstRun = useRef(true)

  //Valori esercizio
  const [serie, setSerie] = useState({})
  const [ripetizioni, setRipetizioni] = useState({})
  const [peso, setPeso] = useState({})

  // ricerca
  const [dataSearch, setDataSearch] = useState("")        // testo digitato
  const [dataSearchSubmit, setDataSearchSubmit] = useState("") // testo applicato

  // paginazione
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalCount, setTotalCount] = useState(0)


  // calcolo indici per Supabase range (inclusivo)
  const { from, to } = useMemo(() => {
    const start = (page - 1) * pageSize
    return { from: start, to: start + pageSize - 1 }
  }, [page, pageSize])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const escapeLike = (s) => s.replace(/([%_\\])/g, "\\$1")

    // Carica le schede attive
    useEffect(() => {
    (async () => {
        const { data, error } = await supabase
        .from("schede_allenamenti")
        .select(`
            uuid_scheda_allenamento,
            uuid_sottoscrizione,
            data_inizio_allenamento,
            data_fine_allenamento,
            created_at_allenamento,
            note_scheda_allenamento,
            scheda_completata_allenamento,
            sottoscrizione:sottoscrizioni!inner (
            uuid_cliente,
            uuid_pt,
            attivo_sottoscrizione,
            data_inizio_sottoscrizione,
            data_fine_sottoscrizione,
            cliente:clienti (
                nome_cliente,
                cognome_cliente
            )
            )
        `)
        .eq("sottoscrizioni.attivo_sottoscrizione", true)
        .eq("scheda_completata_allenamento", false)
        .order("created_at_allenamento", { ascending: false })

        if (error) {
        console.log(error)
        console.log("Errore nel caricamento delle schede")
        return
        }

        setDatasetAllenamenti(data ?? [])
    })()
    }, [])

    // Carica gli esercizi assegnati
    useEffect(() => {
        ;(async () => {
        const { data, error } = await supabase
        .from("esercizi_assegnati")
        .select(`
            uuid_scheda_allenamento,
            uuid_esercizio,
            uuid_esercizio_assegnato,
            serie,
            ripetizioni,
            peso,
            esercizio:esercizi(
            codice_esercizio,
            nome_esercizio,
            descrizione_esercizio,
            difficolta_esercizio,
            gruppo_muscolare_esercizio,
            tempo_esecuzione_esercizio,
            immagine_esercizio
            ),
            schedaAllenamento:schede_allenamenti(
            uuid_sottoscrizione,
            data_inizio_allenamento,
            data_fine_allenamento,
            note_scheda_allenamento,
            created_at_allenamento,
            scheda_completata_allenamento,
            sottoscrizione:sottoscrizioni(
                uuid_cliente,
                data_inizio_sottoscrizione,
                data_fine_sottoscrizione,
                created_at_sottoscrizione,
                uuid_pt,
                uuid_nut,
                attivo_sottoscrizione,
                cliente:clienti(
                nome_cliente,
                cognome_cliente
                )
            )
            )
        `)
        if (error) {
        console.error("Errore nel caricamento degli esercizi:", error)
        return
        }
        setEsercizi(data ?? [])
        })()
    }, [statusDeleted])


    async function cancellaEsercizio (u) {

        const { error } = await supabase
        .from("esercizi_assegnati")
        .delete()
        .eq("uuid_esercizio_assegnato", u)

        if (error) {
            console.error("Delete error:", error)
        } else {
            console.log("esercizio Eliminato")
        }

        setStatusDeleted(prev => !prev)

    }

  // conta quanti esercizi sono presenti per quella scheda
  useEffect(() => {
    setTotalCount((esercizi.filter(f => f.uuid_scheda_allenamento == schedaSelezionata).length))
  }, [changeScheda,statusDeleted,statusEsercizi])

  //filtra gli esercizi assegnati ad una scheda
    useEffect(() => {
    const next = (esercizi ?? []).filter(
        f => String(f.uuid_scheda_allenamento) === String(schedaSelezionata)
    )
    setEserciziAssegnati(next)
    }, [esercizi, schedaSelezionata, changeScheda, statusDeleted, statusEsercizi])

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

// elenco schede attive per la select
  const optionsSchede = (datasetAllenamenti ?? []).map(s => ({
    value: s.uuid_scheda_allenamento, // 👈 questo è il valore che vuoi
    label: `${s?.sottoscrizione?.cliente?.cognome_cliente ?? ""} ${s?.sottoscrizione?.cliente?.nome_cliente ?? ""} • ${s.data_inizio_allenamento} → ${s.data_fine_allenamento}`,
  }));

  function resetFormSchedaAllenamento () {
    setSchedaSelezionata("")
    setClienteSelezionato({})
    setTotalCount(0)
  }

  console.log(statusDeleted)
  return (
    <div className={`${onDisplay === 'on' ? '' : 'hidden'} w-full h-full flex flex-col justify-between gap-3 p-3`}>
      {/* INSERIMENTO SCHEDA */}
      <div className=" rounded-xl">
        <form id="formInserimentoScheda" className="flex lg:flex-row flex-col gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg">
            <div className="w-full">
              {/* select di ricerca scheda */}
              <Popover open={open} onOpenChange={setOpen} className="w-full">
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {schedaSelezionata
                      ? optionsSchede.find(o => o.value === schedaSelezionata)?.label
                      : "seleziona una scheda allenamento..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" sideOffset={4} className="p-0 w-[var(--radix-popover-trigger-width)]">
                  <Command className="p-1">
                    <CommandInput placeholder="Cerca..." className="h-8 my-2" />
                    <CommandList className="my-1">
                      <CommandEmpty>Nessun risultato</CommandEmpty>
                      <CommandGroup>
                        {optionsSchede.map(opt => (
                          <CommandItem
                            key={opt.value}
                            value={`${opt.label} ${opt.value}`}
                            onSelect={() => {
                              setSchedaSelezionata(opt.value);
                              setOpen(false);
                              setChangeScheda(prev => !prev)
                            }}
                          >
                            {opt.label}
                            <Check className={cn("ml-auto", schedaSelezionata === opt.value ? "opacity-100" : "opacity-0")} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {/* fine di ricerca scheda */}
            </div>
            <div className="flex justify-end gap-2 overflow-auto">
              <button
                  type="button"
                  onClick={resetFormSchedaAllenamento}
                  className="bg-brand hover:bg-brand/70 text-white px-6 py-1 rounded-xl text-xs font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                  {<VscDebugRestart />}
              </button>
              {/* PopOver scheda provvisoria */}
              <Drawer>
                <DrawerTrigger className="flex flex-1 items-center justify-center border border-brand hover:bg-brand bg-brand dark:bg-neutral-900 text-white px-6 py-1 text-xs rounded-xl font-semibold hover:opacity-90 truncate transition disabled:opacity-60">... info scheda</DrawerTrigger>
                <DrawerContent className="mx-auto w-full rounded-t-2xl bg-neutral-950 p-0 h-[85vh]">
                  <DrawerHeader className="items-center justify-center">
                    {clienteSelezionato.length > 0 ? 
                    <>
                    <DrawerTitle className="uppercase text-neutral-300 font-light">
                      Scheda di: <b className="font-bold">{clienteSelezionato[0].sottoscrizione.cliente.nome_cliente} {clienteSelezionato[0].sottoscrizione.cliente.cognome_cliente}</b>
                    </DrawerTitle>
                    <DrawerDescription>
                      <div className="flex flex-row gap-3">
                        <div className="uppercase">
                          Inizio <b>{clienteSelezionato[0].data_inizio_allenamento}</b>
                        </div>
                        <div className="uppercase">
                          Fine <b>{clienteSelezionato[0].data_fine_allenamento}</b>
                        </div>
                      </div>
                    </DrawerDescription>
                    </> : <DrawerDescription>... seleziona e compila una scheda</DrawerDescription>
                    }
                  </DrawerHeader>
                  {eserciziDaAssegnare <= 0 ? null :
                    <div className="overflow-y-auto px-6 py-4 h-[calc(85vh-8rem)]">
                      {/* Scheda creata */}
                      <div className="flex flex-col flex-1 justify-between border border-brand rounded-xl p-5 max-h-full overflow-auto h-full">

                        

                      </div>
                    </div>
                  }
                  <DrawerFooter className="flex flex-row w-full">
                    <Button onClick={()=>aggiungiSchedaDB(schedaSelezionata)} className="w-full">Inserisci</Button>
                    <DrawerClose>
                      <Button variant="outline">Chiudi</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
        </form>
      </div>

      {/* Tabella */}
      <div className="flex flex-col flex-1 justify-between border border-brand rounded-xl p-5 max-h-full overflow-auto">
        <Table>
          <TableCaption>
            {totalCount > 0
              ? `Trovati ${totalCount} esercizi • Pagina ${page} di ${totalPages}`
              : "Nessun risultato"}
          </TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className="text-left truncate text-[0.6rem] lg:text-sm w-[20px]">Cod.</TableHead>
              <TableHead className="text-left truncate text-[0.6rem] lg:text-sm">Nome Esercizio</TableHead>
              <TableHead className="text-left truncate text-[0.6rem] lg:text-sm"><FaArrowTrendUp /></TableHead>
              <TableHead className="text-left border-e border-brand truncate text-[0.6rem] lg:text-sm"><IoBody className="text-green-600"/></TableHead>
              <TableHead className="text-center truncate text-[0.6rem] lg:text-sm">S</TableHead>
              <TableHead className="text-center truncate text-[0.6rem] lg:text-sm">R</TableHead>
              <TableHead className="text-center truncate text-[0.6rem] lg:text-sm">P</TableHead>
              <TableHead className="text-center truncate text-[0.6rem] lg:text-sm">C</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {eserciziAssegnati.length > 0 ? eserciziAssegnati.map((e, i) => {
              return (
                <TableRow key={`${e.uuid_esercizio_assegnato ?? i}`}>
                  <TableCell className="text-left truncate text-[0.6rem] lg:text-sm w-[20px]">{e.esercizio.codice_esercizio}</TableCell>
                  <TableCell className="text-left truncate text-[0.6rem] lg:text-sm">{e.esercizio.nome_esercizio}</TableCell>
                  <TableCell className="text-left truncate text-[0.6rem] lg:text-sm">{e.esercizio.difficolta_esercizio}</TableCell>
                  <TableCell className="text-left border-e border-brand truncate text-[0.6rem] lg:text-sm">{e.esercizio.gruppo_muscolare_esercizio}</TableCell>
                  <TableCell className="text-center truncate text-[0.6rem] lg:text-sm">{e.serie}</TableCell>
                  <TableCell className="text-center truncate text-[0.6rem] lg:text-sm">{e.ripetizioni}</TableCell>
                  <TableCell className="text-center truncate text-[0.6rem] lg:text-sm">{e.peso}</TableCell>
                  <TableCell className="text-center truncate text-[0.6rem] lg:text-sm">
                    <button
                      type="button"
                      variant="ghost" size="icon" aria-label="Submit"
                      className="text-red-600"
                      onClick={() => cancellaEsercizio(e.uuid_esercizio_assegnato)}
                    >
                      <FaTrashCan/>
                    </button>
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
      <div className="flex lg:flex-row flex-col justify-between gap-3">
        <div className="flex flex-row justify-end gap-3">
            <div className="border border-neutral-700 rounded-lg px-5 py-1 max-h-full text-xs overflow-auto w-fit">
                Esercizi Assegnati: 20
            </div>
            <div className="border border-neutral-700 rounded-lg px-5 py-1 max-h-full text-xs overflow-auto w-fit">
                Difficoltà Media: 20
            </div>
        </div>
        <div className="flex flex-row justify-end gap-3">
            <div className="border border-neutral-700 rounded-lg px-5 py-1 max-h-full text-xs overflow-auto w-fit">
                ELIMINA SCHEDA
            </div>
        </div>
      </div>
      
    </div>
  )
}

export function FormField({ nome, label, onchange, type = "text", value, defaultValue, ...props }) {
  return (
    <div>
      <Input
        id={nome}
        name={nome}
        type={type}
        placeholder={label}
        value={value}
        defaultValue={defaultValue}
        onChange={onchange}
        className="
          appearance-none
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-brand
          focus-visible:ring-offset-2
          focus-visible:ring-offset-background
          focus-visible:border-brand
          text-center
        "
        {...props}
      />
    </div>
  )
}