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


export default function AreaWorkout({ onDisplay, statusEsercizi, setStatusEsercizi }) {

  const [esercizi, setEsercizi] = useState([])
  const [statusSend, setStatusSend] = useState(false)
  const [changeScheda, setChangeScheda] = useState(false)
  const today = new Date().toISOString();

  const [open, setOpen] = React.useState(false)
  const [datasetAllenamenti, setDatasetAllenamenti] = useState([])
  const [schedaSelezionata, setSchedaSelezionata] = useState("");
  const [clienteSelezionato, setClienteSelezionato] = useState({});
  const [eserciziDaAssegnare, setEserciziDaAssegnare] = useState([])
  const isFirstRun = useRef(true)

  //Valori esercizio
  const [serie, setSerie] = useState({})
  const [ripetizioni, setRipetizioni] = useState({})
  const [peso, setPeso] = useState({})
  const [giorno, setGiorno] = useState({})

  // ricerca
  const [dataSearch, setDataSearch] = useState("")        // testo digitato
  const [dataSearchSubmit, setDataSearchSubmit] = useState("") // testo applicato

  // paginazione
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalCount, setTotalCount] = useState(0)

  const [totalCountProvvisoria, setTotalCountProvvisoria] = useState(0)
  const [pageProvvisoria, setPageProvvisoria] = useState(1)
  const [pageSizeProvvisoria, setPageSizeProvvisoria] = useState(20)

  // calcolo indici per Supabase range (inclusivo)
  const { from, to } = useMemo(() => {
    const start = (page - 1) * pageSize
    return { from: start, to: start + pageSize - 1 }
  }, [page, pageSize])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const totalPagesProvvisoria = Math.max(1, Math.ceil(totalCountProvvisoria / pageSizeProvvisoria))

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
  }, [statusEsercizi])

  // Carica il profilo del cliente selezionato
  useEffect(() => {

  if (isFirstRun.current) {
    isFirstRun.current = false
    return
    }
  if (!schedaSelezionata) return

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
      .eq("uuid_scheda_allenamento", schedaSelezionata)

      if (error) {
      console.log(error)
      console.log("Errore nel caricamento delle schede")
      return
      }

      setClienteSelezionato(data ?? [])
  })()
  }, [schedaSelezionata])

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
        console.error("Errore nel caricamento delle schede")
        return
        }

        setDatasetAllenamenti(data ?? [])
    })()
  }, [])

  function resetFormSchedaAllenamento () {
    setSchedaSelezionata("")
    setClienteSelezionato({})
    setTotalCountProvvisoria(0)
  }

  function aggiuntaEsercizio(uuid, scheda) {
    const valoreSerie       = serie[`s-${uuid}`]
    const valoreRipetizioni = ripetizioni[`r-${uuid}`]
    const valorePeso        = peso[`p-${uuid}`]
    const valoreGiorno      = giorno[`g-${uuid}`]

    if (!valoreSerie || !valoreRipetizioni || !valoreGiorno || !(scheda ?? schedaSelezionata)) {
      console.log("Compila serie/ripetizioni/peso e seleziona la scheda")
      return
    }

    const schedaId = scheda ?? schedaSelezionata
    const nuovo = {
      uuid_esercizio: uuid,
      uuid_scheda_allenamento: schedaId,
      serie: Number(valoreSerie),
      ripetizioni: Number(valoreRipetizioni),
      giorno: Number(valoreGiorno),
      peso: Number(valorePeso) || Number(0),
    }

    setEserciziDaAssegnare(prev => {
      const idx = prev.findIndex(e => e.uuid_esercizio === uuid)
      if (idx === -1) {
        const next = [...prev, nuovo]
        setTotalCountProvvisoria(next.length)
        return next
      }
      const next = [...prev]
      next[idx] = { ...next[idx], ...nuovo }
      setTotalCountProvvisoria(next.length)
      return next
    })
    setStatusSend(prev => !prev)
  }

  function handleChangeSerie(e) {
    const { name, value } = e.currentTarget
    const n = value === "" ? "" : Number(value)
    setSerie(prev => ({ ...prev, [name]: n }))
  }

  function handleChangePeso(e) {
    const { name, value } = e.currentTarget
    const n = value === "" ? "" : Number(value)
    setPeso(prev => ({ ...prev, [name]: n }))
  }

  function handleChangeRipetizioni(e) {
    const { name, value } = e.currentTarget
    const n = value === "" ? "" : Number(value)
    setRipetizioni(prev => ({ ...prev, [name]: n }))
  }

  function handleChangeGiorno(e) {
    const { name, value } = e.currentTarget
    const n = value === "" ? "" : Number(value)
    setGiorno(prev => ({ ...prev, [name]: n }))
  }

  useEffect(() => {
    if (!eserciziDaAssegnare.length) return

    const idsEsercizi = [...new Set(eserciziDaAssegnare.map(r => r.uuid_esercizio))]
    const idsSchede   = [...new Set(eserciziDaAssegnare.map(r => r.uuid_scheda_allenamento))]

    ;(async () => {
      const [{ data: eserciziDett }, { data: schedeDett }] = await Promise.all([
        supabase
          .from('esercizi')
          .select('uuid_esercizio, nome_esercizio, gruppo_muscolare_esercizio, codice_esercizio')
          .in('uuid_esercizio', idsEsercizi),
        supabase
          .from('schede_allenamenti')
          .select('uuid_scheda_allenamento, data_inizio_allenamento, data_fine_allenamento')
          .in('uuid_scheda_allenamento', idsSchede),
      ])

      // crea lookup: { uuid: record }
      const byEsercizio = Object.fromEntries((eserciziDett ?? []).map(e => [e.uuid_esercizio, e]))
      const byScheda    = Object.fromEntries((schedeDett ?? []).map(s => [s.uuid_scheda_allenamento, s]))

      setLookupEsercizi(byEsercizio)
      setLookupSchede(byScheda)
    })()
  }, [eserciziDaAssegnare])

  const [lookupEsercizi, setLookupEsercizi] = useState({})
  const [lookupSchede, setLookupSchede] = useState({})

  useEffect(() => {
    setPeso({})
    setRipetizioni({})
    setSerie({})
    setGiorno({})
    setEserciziDaAssegnare([])
  }, [schedaSelezionata])

 async function aggiungiSchedaDB(schedaId) {
    // 1) normalizza/dedup locale (stesso uuid_esercizio: tieni il primo)
    const puliti = Object.values(
      eserciziDaAssegnare
        .filter(r => r.uuid_scheda_allenamento === (schedaId ?? r.uuid_scheda_allenamento))
        .reduce((acc, r) => {
          const key = r.uuid_esercizio
          if (!acc[key]) {
            acc[key] = {
              uuid_scheda_allenamento: schedaId ?? r.uuid_scheda_allenamento,
              uuid_esercizio: r.uuid_esercizio,
              serie: parseInt(r.serie, 10),
              ripetizioni: parseInt(r.ripetizioni, 10),
              giorno: parseInt(r.giorno, 10),
              peso: parseInt(r.peso, 10), // se int4 in DB
            }
          }
          return acc
        }, {})
    )

    if (puliti.length === 0) return []

    // 2) chiedi a Supabase quali esercizi sono già presenti per quella scheda
    const uuids = puliti.map(r => r.uuid_esercizio)
    const { data: esistenti, error: selErr } = await supabase
      .from("esercizi_assegnati")
      .select("uuid_esercizio")
      .eq("uuid_scheda_allenamento", schedaId)
      .in("uuid_esercizio", uuids)

    if (selErr) {
      console.error("Errore verifica esistenti:", selErr)
      return null
    }

    const setEsistenti = new Set((esistenti ?? []).map(r => r.uuid_esercizio))
    const daInserire = puliti.filter(r => !setEsistenti.has(r.uuid_esercizio))

    if (daInserire.length === 0) {
      console.log("Nessun nuovo esercizio da inserire per questa scheda.")
      return []
    }

    // 3) insert multiplo solo dei nuovi
    const { data, error } = await supabase
      .from("esercizi_assegnati")
      .insert(daInserire)
      .select()

    if (error) {
      console.error("Errore insert multipla:", error)
      return null
    }

    return data

    setStatusEsercizi(prev=>!prev)

  }

  function eliminaEsercizio(uuid) {
    setEserciziDaAssegnare(prev =>
      prev.filter(e => e.uuid_esercizio !== uuid)
    )
  }

  return (
    <div className={`${onDisplay === 'on' ? '' : 'hidden'} w-full h-full flex flex-col justify-between gap-3 p-3`}>
      {/* INSERIMENTO SCHEDA */}
      <div className=" rounded-xl">
        <form id="formInserimentoScheda" className="flex lg:flex-row flex-col gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg">
            <div className="w-full">
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
                <DrawerTrigger className="flex flex-1 items-center justify-center border border-brand hover:bg-brand bg-brand dark:bg-neutral-900 text-white px-6 py-1 text-xs rounded-xl font-semibold hover:opacity-90 truncate transition disabled:opacity-60">... workout</DrawerTrigger>
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
                         
                        <Table>
                          <TableCaption>
                            {totalCountProvvisoria > 0
                              ? `Trovati ${totalCountProvvisoria} esercizi • Pagina ${pageProvvisoria} di ${totalPagesProvvisoria}`
                              : "Nessun risultato"}
                          </TableCaption>

                          <TableHeader>
                            <TableRow>
                              <TableHead className="truncate">Nome Esercizio</TableHead>
                              <TableHead className="truncate text-center">Peso</TableHead>
                              <TableHead className="truncate text-center">Serie</TableHead>
                              <TableHead className="truncate text-center">Ripetizioni</TableHead>
                              <TableHead className="truncate text-center">x</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {eserciziDaAssegnare.map((r, i) => {

                              const ex = lookupEsercizi[r.uuid_esercizio]

                              return (
                                <TableRow key={i}>
                                  <TableCell className="font-medium text-left truncate">{ex?.nome_esercizio ?? r.uuid_esercizio}</TableCell>
                                  <TableCell className="font-medium text-center truncate">{r.peso}</TableCell>
                                  <TableCell className="font-medium text-center truncate">{r.serie}</TableCell>
                                  <TableCell className="font-medium text-center truncate">{r.ripetizioni}</TableCell>
                                  <TableCell className="font-medium text-center truncate">
                                    <Button onClick={() => eliminaEsercizio(r.uuid_esercizio)}>elimina</Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                        
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="text-sm opacity-80">
                            {totalCountProvvisoria > 0 && (
                              <>
                                Mostrati{" "}
                                <strong>
                                  {Math.min(totalCountProvvisoria, from + 1)}–{Math.min(totalCountProvvisoria, to + 1)}
                                </strong>{" "}
                                di <strong>{totalCountProvvisoria}</strong>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setPageProvvisoria((p) => Math.max(1, p - 1))}
                              disabled={page <= 1}
                            >
                              Prev
                            </Button>
                            <span className="text-sm tabular-nums">Pag. {pageProvvisoria} / {totalPagesProvvisoria}</span>
                            <Button
                              variant="outline"
                              onClick={() => setPageProvvisoria((p) => Math.min(totalPages, p + 1))}
                              disabled={pageProvvisoria >= totalPagesProvvisoria || totalCountProvvisoria === 0}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
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
              <TableHead className="truncate text-center">Serie</TableHead>
              <TableHead className="truncate text-center">Ripetizioni</TableHead>
              <TableHead className="truncate text-center">Peso</TableHead>
              <TableHead className="truncate text-center">Giorno</TableHead>
              <TableHead className="truncate text-center">+</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {esercizi.length ? esercizi.map((esercizio, index) => {
              return (
                <TableRow key={`${esercizio.uuid_esercizio ?? index}`}>
                  <TableCell className="font-medium text-left truncate">{esercizio.codice_esercizio}</TableCell>
                  <TableCell className="font-medium text-left truncate">{esercizio.nome_esercizio}</TableCell>
                  <TableCell className="text-center truncate">{esercizio.difficolta_esercizio}</TableCell>
                  <TableCell className="border-e border-brand text-left truncate">{esercizio.gruppo_muscolare_esercizio}</TableCell>
                  <TableCell className="text-center truncate">
                    <FormField
                      nome={`s-${esercizio.uuid_esercizio}`}
                      type="number"
                      label="..."
                      value={serie[`s-${esercizio.uuid_esercizio}`] ?? ""}        // <-- si svuota quando setSerie({})
                      onchange={handleChangeSerie}
                      min={0}
                      step={1}
                    />
                  </TableCell>
                  <TableCell className="text-center truncate">
                    <FormField
                      nome={`r-${esercizio.uuid_esercizio}`}
                      type="number"
                      label="..."
                      value={ripetizioni[`r-${esercizio.uuid_esercizio}`] ?? ""}
                      onchange={handleChangeRipetizioni}
                      min={0}
                      step={1}
                    />
                  </TableCell>
                  <TableCell className="text-center truncate">
                    <FormField
                      nome={`p-${esercizio.uuid_esercizio}`}
                      type="number"
                      label="..."
                      value={peso[`p-${esercizio.uuid_esercizio}`] ?? ""}
                      onchange={handleChangePeso}
                      min={0}
                      step={1}
                    />
                  </TableCell>
                  <TableCell className="text-center truncate">
                    <FormField
                      nome={`g-${esercizio.uuid_esercizio}`}
                      type="number"
                      label="..."
                      value={giorno[`g-${esercizio.uuid_esercizio}`] ?? ""}
                      onchange={handleChangeGiorno}
                      min={0}
                      step={1}
                    />
                  </TableCell>
                  <TableCell className="hover:bg-brand dark:hover:bg-neutral-950 text-center">
                    <Button
                      type="button"
                      className="w-fit bg-brand"
                      onClick={() => aggiuntaEsercizio(esercizio.uuid_esercizio, schedaSelezionata)}
                    >
                      +
                    </Button>
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

export function FormField({ nome, label, onchange, type = "text", value, defaultValue, ...props }) {
  return (
    <div>
      <Input
        id={nome}
        name={nome}
        type={type}
        placeholder={label}
        value={value}                 // <-- controlled
        defaultValue={defaultValue}   // (non usato se passi value)
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