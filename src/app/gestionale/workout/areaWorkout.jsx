'use client'
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { FaUserSlash } from "react-icons/fa";
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"


export default function AreaWorkout({ onDisplay }) {

  const [esercizi, setEsercizi] = useState([])
  const [statusSend, setStatusSend] = useState(false)
  const today = new Date();

  const [open, setOpen] = React.useState(false)
  const [sottoscrizioneScelta, setSottoscrizioneScelta] = React.useState("")
  const [datasetAllenamenti, setDatasetAllenamenti] = useState([])
  const [schedaSelezionata, setSchedaSelezionata] = useState("");

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
      console.error(error)
      toast.error("Errore nel caricamento delle schede")
      return
      }

      setDatasetAllenamenti(data ?? [])
  })()
  }, [])

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
      let q = supabase
        .from("esercizi")
        .select("*", { count: "exact" })
        .order("nome_esercizio", { ascending: true });

      // Applica i filtri SOLO se c'è una stringa di ricerca
      if (dataSearchSubmit) {
        const qEsc = escapeLike(dataSearchSubmit);
        q = q.or(
          [
            `nome_esercizio.ilike.%${qEsc}%`,
            `gruppo_muscolare_esercizio.ilike.%${qEsc}%`,
            `codice_esercizio.ilike.%${qEsc}%`,
          ].join(",")
        );
      }

      q = q.range(from, to);

      const { data, error, count } = await q;

      if (error) {
        console.error("Supabase error:", error);
        setEsercizi([]);
        setTotalCount(0);
        return;
      }

      setEsercizi(data ?? []);
      setTotalCount(count ?? 0);

      const pages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
      if (page > pages) setPage(1);
    };

    fetchData();
  }, [dataSearchSubmit, page, pageSize, from, to]);

  // PEZZI INSERIMENTO SCHEDA

  const optionsSchede = (datasetAllenamenti ?? []).map(s => ({
    value: s.uuid_scheda_allenamento, // 👈 questo è il valore che vuoi
    label: `${s?.sottoscrizione?.cliente?.cognome_cliente ?? ""} ${s?.sottoscrizione?.cliente?.nome_cliente ?? ""} • ${s.data_inizio_allenamento} → ${s.data_fine_allenamento}`,
  }));


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
        .gte("sottoscrizioni.data_fine_sottoscrizione", today)
        .order("created_at_allenamento", { ascending: false })

        if (error) {
        console.error(error)
        toast.error("Errore nel caricamento delle schede")
        return
        }

        setDatasetAllenamenti(data ?? [])
    })()
  }, [])

  async function handleSubmitSchedaAllenamento(e) {
    e.preventDefault()

    if (!sottoscrizioneScelta) {
      console.error("Seleziona una sottoscrizione o creane una")
      return
    }
    if (!schedaAllenamento.dataInizio) {
      console.error("Scegli una data di Inizio")
      return
    }
    if (!schedaAllenamento.dataFine) {
      console.error("Scegli una data di Fine")
      return
    }

    const payloadSchedaAllenamento = {
      uuid_sottoscrizione: sottoscrizioneScelta,
      data_inizio_allenamento: schedaAllenamento.dataInizio,
      data_fine_allenamento: schedaAllenamento.dataFine,
      note_scheda_allenamento: schedaAllenamento.noteScheda,
    }

    setLoadingSchedaAllenamento(true)
    const { data, error } = await supabase
      .from('schede_allenamenti')
      .insert(payloadSchedaAllenamento)
      .select()
      .single()
    setLoadingSchedaAllenamento(false)

    if (error) {
      console.error(error)
      toast.error(`Errore salvataggio: ${error.message}`)
      return
    }

    setSchedaAllenamento({
        dataInizio: "",
        dataFine: "",
        noteScheda: "",
    })

    setStatusSend(prev => !prev)

    console.log("Inserito:", data)
    toast.success("Scheda Allenamento inserita con successo!")

  }

  function resetFormSchedaAllenamento () {
    setSchedaSelezionata("")
  }

  return (
    <div className={`${onDisplay === 'on' ? '' : 'hidden'} w-full h-full flex flex-col justify-between gap-3 p-3`}>
      {/* INSERIMENTO SCHEDA */}
      <div className=" rounded-xl">
        <form id="formInserimentoScheda" onSubmit={handleSubmitSchedaAllenamento} className="flex flex-row gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg">
            <div className="flex-1 w-full">
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
            </div>
            <div className="flex justify-end gap-2">
              <button
                  type="button"
                  onClick={resetFormSchedaAllenamento}
                  className="bg-brand hover:bg-brand/70 text-white px-6 py-1 rounded-xl text-xs font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                  {<VscDebugRestart />}
              </button>
              {/* PopOver */}
              <Drawer>
                <DrawerTrigger className="border border-brand hover:bg-brand bg-brand dark:bg-neutral-900 text-white px-6 py-1 text-xs rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 w-fit">Apri Scheda</DrawerTrigger>
                <DrawerContent className="mx-auto w-full rounded-t-2xl bg-neutral-950 p-0 h-[85vh]">
                  <DrawerHeader>
                    <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                    <DrawerDescription>This action cannot be undone.</DrawerDescription>
                  </DrawerHeader>
                    <div className="overflow-y-auto px-6 py-4 h-[calc(85vh-8rem)]">
                      QUI VA LA SCHEDA
                    </div>
                  <DrawerFooter>
                    <Button>Submit</Button>
                    <DrawerClose>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
        </form>
      </div>
      {/* Barra ricerca */}
      <div className="flex w-full items-center gap-2">
        <Input
          type="text"
          id="cerca"
          placeholder="Cerca nome esercizio, gruppo o codice…"
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
      <div className="flex flex-col flex-1 justify-between border border-brand rounded-xl p-5 max-h-full overflow-auto">
        <Table>
          <TableCaption>
            {totalCount > 0
              ? `Trovati ${totalCount} esercizi • Pagina ${page} di ${totalPages}`
              : "Nessun risultato"}
          </TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className="text-left truncate">Cod.</TableHead>
              <TableHead className="truncate">Nome Esercizio</TableHead>
              <TableHead className="truncate text-center">Difficoltà</TableHead>
              <TableHead className="border-e border-brand truncate text-left">Gruppo Muscolare</TableHead>
              <TableHead className="truncate text-center">+</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {esercizi.length ? esercizi.map((esercizio,cliente, index) => {
              return (
                <TableRow key={`${esercizio.uuid_esercizio ?? index}`}>
                  <TableCell className="font-medium text-left truncate">{esercizio.codice_esercizio}</TableCell>
                  <TableCell className="font-medium text-left truncate">{esercizio.nome_esercizio}</TableCell>
                  <TableCell className="text-center truncate">{esercizio.difficolta_esercizio}</TableCell>
                  <TableCell className="border-e border-brand text-left truncate">{esercizio.gruppo_muscolare_esercizio}</TableCell>
                  <TableCell className="hover:bg-brand dark:hover:bg-neutral-950 text-center">+</TableCell>
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