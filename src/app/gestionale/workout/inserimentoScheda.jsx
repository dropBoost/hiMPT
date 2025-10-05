'use client'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { VscDebugRestart } from "react-icons/vsc"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function InserimentoScheda({onDisplay, statusEsercizi, setStatusEsercizi}) {

  
  const today = new Date();
  const dataOggi = new Date().toISOString().split("T")[0]
  const dataOggiSottoscrizioni = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const [sottoscrizioni, setSottoscrizioni] = useState([])
  const [datasetAllenamenti, setDatasetAllenamenti] = useState([])
  const [loadingSchedaAllenamento, setLoadingSchedaAllenamento] = useState(false)
  const [open, setOpen] = React.useState(false)
  const [statusSend, setStatusSend] = useState(false)
  const [sottoscrizioneScelta, setSottoscrizioneScelta] = React.useState("")
  const [pianoAbbonamento, setPianoAbbonamento] = useState([])
  const [opzioniPianoAbbonamento, setOpzioniPianoAbbonamento] = useState([])
  const [schedaAllenamento, setSchedaAllenamento] = useState({
    sotUuid: "",
    dataInizio: "",
    dataFine: "",
    noteScheda: "",
  })

  // Carica le sottoscrizioni
  useEffect(() => {
    ;(async () => {
      const { data: sottoscrizioniData, error } = await supabase
        .from("sottoscrizioni")
        .select(`
            uuid_sottoscrizione,
            uuid_cliente,
            data_inizio_sottoscrizione,
            data_fine_sottoscrizione,
            created_at_sottoscrizione,
            cliente:clienti (
                nome_cliente,
                cognome_cliente
            )`)
        .eq("attivo_sottoscrizione", true)
        .order("created_at_sottoscrizione", { ascending: false })

      if (error) {
        console.error(error)
        console.error("Errore nel caricamento delle sottoscrizioni")
        return
      }
      setSottoscrizioni(sottoscrizioniData ?? [])
    })()
  }, [])

  // Carica i piani abbonamento
  useEffect(() => {
    ;(async () => {
      const { data: pianoAbbonamento, error } = await supabase
        .from("piano_abbonamento")
        .select(`
            uuid_abbonamento,
            uuid_sottoscrizione,
            tipologia_abbonamento,
            costo_abbonamento,
            sconto_abbonamento,
            note_abbonamento,
            created_at_abbonamento,
            sottoscrizione:sottoscrizioni(
              uuid_sottoscrizione,
              uuid_cliente,
              data_inizio_sottoscrizione,
              data_fine_sottoscrizione,
              created_at_sottoscrizione,
              uuid_pt,
              uuid_nut,
              attivo_sottoscrizione,
              cliente:clienti (
                  nome_cliente,
                  cognome_cliente,
                  data_nascita_cliente,
                  codice_fiscale_cliente,
                  telefono_cliente,
                  email_cliente
              ))
            `)
        .eq("sottoscrizioni.attivo_sottoscrizione", true)
        // .order("created_at_sottoscrizione", { ascending: false })

      if (error) {
        console.error(error)
        console.error("Errore nel caricamento dei piano abbonamento")
        return
      }
      setPianoAbbonamento(pianoAbbonamento ?? [])
    })()
  }, [])

  

  const opzioniSottoscrizioni = (sottoscrizioni ?? [])
    .filter(s => (s?.data_fine_sottoscrizione ?? "") >= dataOggiSottoscrizioni && s.attivo_sottoscrizione != false)
    .map(sot => ({
      value: sot.uuid_sottoscrizione,
      label: `${sot.cliente?.cognome_cliente ?? ""} ${sot.cliente?.nome_cliente ?? ""}`.trim()
    }
  ));

  useEffect(() => {
    const list = Array.isArray(pianoAbbonamento) ? pianoAbbonamento : []

    const pianiAbbonamentoFiltrati = list
      .filter(s => {
        const fine   = s?.sottoscrizione?.data_fine_sottoscrizione ?? ""
        const attivo = s?.sottoscrizione?.attivo_sottoscrizione === true
        const tipoOk = String(s?.tipologia_abbonamento || "").toLowerCase() !== "nutrizione"
        // valido se le date sono "YYYY-MM-DD"
        return typeof fine === "string" && fine >= dataOggiSottoscrizioni && attivo && tipoOk
      })
      .map(sot => ({
        value: sot?.uuid_sottoscrizione ?? "",
        label: `${sot?.sottoscrizione?.cliente?.cognome_cliente ?? ""} ${sot?.sottoscrizione?.cliente?.nome_cliente ?? ""}`.trim()
      }))

    setOpzioniPianoAbbonamento(pianiAbbonamentoFiltrati)
  }, [pianoAbbonamento, dataOggiSottoscrizioni])

  const sottoscrizioniFiltrateCliente = sottoscrizioni.filter(a => a.uuid_cliente == sottoscrizioneScelta)

  useEffect(() => {
  if (!sottoscrizioneScelta) return;
  (async () => {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      const { data, error } = await supabase
      .from("schede_allenamenti")
      .select(`
          uuid_sottoscrizione,
          data_inizio_allenamento,
          data_fine_allenamento,
          created_at_allenamento,
          note_scheda_allenamento,
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
      .eq("uuid_sottoscrizione", sottoscrizioneScelta)
      .eq("sottoscrizioni.attivo_sottoscrizione", true)
      .gte("sottoscrizioni.data_fine_sottoscrizione", today)
      .order("created_at_allenamento", { ascending: false })

      if (error) {
      console.error(error)
      toast.error("Errore nel caricamento delle schede")
      return
      }

      setDatasetAllenamenti(data ?? [])
  })()
  }, [sottoscrizioneScelta, statusSend])

  function handleChangeDataInizio(e) {

    const { name, value } = e.target

    if (value < dataOggi) {
      toast.error("Non è possibile impostare una data passata")
      return
    }
    if (schedaAllenamento.dataFine && value >= schedaAllenamento.dataFine) {
      toast.error("La Data Inizio deve essere precedente alla Data Fine")
      return
    }

    // {sottoscrizioniFiltrateCliente.map((sc, index) => 
    //   {if (value <=  sc.data_fine_sottoscrizione) {
    //   console.log("sottoscrizione già attiva")
    //   return
    // }}
    // )}

    setSchedaAllenamento(prev => ({ ...prev, [name]: value }))
  }

  function handleChangeDataFine(e) {
    const { name, value } = e.target

    if (value <= dataOggi) {
      toast.error("La Data Fine deve essere futura")
      return
    }
    if (schedaAllenamento.dataInizio && value <= schedaAllenamento.dataInizio) {
      toast.error("La Data Fine deve essere successiva alla Data Inizio")
      return
    }
    if (!schedaAllenamento.dataInizio) {
      console.log("Scegli prima la data di inizio")
      return
    }

    setSchedaAllenamento(prev => ({ ...prev, [name]: value }))
  }

  function handleChangeNote(e) {
    const { name, value } = e.target
    setSchedaAllenamento(prev => ({ ...prev, [name]: value }))
  }
  
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
    setStatusEsercizi(prev => !prev)

    console.log("Inserito:", data)
    toast.success("Scheda Allenamento inserita con successo!")

  }

  function resetFormSchedaAllenamento () {
   setSchedaAllenamento({
        dataInizio: "",
        dataFine: "",
        noteScheda: "",
    },
    setSottoscrizioneScelta(""))
  }

  return (
    <>
    <div className={`${onDisplay === 'on' ? '' : 'hidden'} w-full flex flex-col gap-3 p-3`}>
        {/* INSERIMENTO SCHEDA */}
        <div>
            <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
            NUOVA SCHEDA
            </h4>
        </div>
        <div className=" rounded-xl">
            <form id="formInserimentoScheda" onSubmit={handleSubmitSchedaAllenamento} className="grid grid-cols-12 gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg">
                <div className="col-span-12 lg:col-span-6">
                    <label className="block text-sm font-semibold mb-1">
                        Piani Abbonamento Attivi
                    </label>
                    <Popover open={open} onOpenChange={setOpen} className="w-full">
                        <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between
                            outline-none focus:outline-none focus-visible:outline-none
                            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                            ring-offset-background
                            data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2">
                            {sottoscrizioneScelta ? opzioniPianoAbbonamento.find((cliente) => cliente.value === sottoscrizioneScelta)?.label  : "seleziona un cliente..."}
                            <ChevronsUpDown className="opacity-50" />
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            sideOffset={4}
                            className="p-0 w-[var(--radix-popover-trigger-width)]"
                        >
                            <Command className="p-1">
                            <CommandInput placeholder="Cerca..." className="h-8 focus:ring-1 focus:ring-brand focus:border-brand outline-none focus:outline-none my-2" />
                            <CommandList className="my-1">
                                <CommandEmpty>Nessun risultato</CommandEmpty>
                                <CommandGroup>
                                {opzioniPianoAbbonamento.map((opt) => (
                                    <CommandItem
                                    key={opt.value}
                                    // ciò che viene usato per il filtro:
                                    value={`${opt.label} ${opt.value}`}
                                    onSelect={() => {
                                        setSottoscrizioneScelta(opt.value)
                                        setOpen(false)
                                    }}
                                    >
                                    {opt.label}
                                    <Check
                                        className={cn(
                                        "ml-auto",
                                        opzioniSottoscrizioni === opt.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <FormField
                    nome="dataInizio"
                    label="Data Inizio"
                    value={schedaAllenamento.dataInizio}
                    colspan="col-span-6"
                    mdcolspan="lg:col-span-3"
                    onchange={handleChangeDataInizio}
                    type="date"
                />
                <FormField
                    nome="dataFine"
                    label="Data Fine"
                    value={schedaAllenamento.dataFine}
                    colspan="col-span-6"
                    mdcolspan="lg:col-span-3"
                    onchange={handleChangeDataFine}
                    type="date"
                />
                <FormTextarea nome="noteScheda" label='Note' value={schedaAllenamento.noteScheda} colspan="col-span-12" mdcolspan="lg:col-span-12" onchange={handleChangeNote} type='text-area'/>
                <div className="col-span-12 flex justify-end gap-2">
                    <button
                    form="formInserimentoScheda"
                    type="submit"
                    disabled={loadingSchedaAllenamento}
                    className="border border-brand hover:bg-brand dark:text-white text-neutral-900 px-6 py-1 text-xs rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                    {loadingSchedaAllenamento ? "Salvataggio..." : "Inserisci"}
                    </button>
                    <button
                    type="button"
                    onClick={resetFormSchedaAllenamento}
                    className="bg-brand hover:bg-brand/70 text-white px-3 rounded-xl text-xs font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                    {<VscDebugRestart />}
                </button>
                </div>
            </form>
        </div>
        {/* ELENCO SCHEDE */}
        {datasetAllenamenti.length > 0 ? 
        <>
        <div>
            <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">SCHEDE INSERITE</h4>
        </div>
        <div className="border border-brand rounded-xl p-5">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="truncate">Nome e Cognome</TableHead>
                <TableHead className="text-left truncate">Note</TableHead>
                <TableHead className="text-right truncate">Inizio Scheda</TableHead>
                <TableHead className="text-right truncate">Fine Scheda</TableHead>
                <TableHead className="text-right truncate">C</TableHead>
                <TableHead className="text-right truncate">D</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(!datasetAllenamenti.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm italic">
                    {datasetAllenamenti ? "Nessun pagamento registrato" : "Seleziona un Iscritto"}
                  </TableCell>
                </TableRow>
              ) : (
                datasetAllenamenti.map((scheda, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {scheda?.sottoscrizione.cliente.nome_cliente} {scheda?.sottoscrizione.cliente.cognome_cliente}
                    </TableCell>
                    <TableCell className="text-left font-medium">
                      {scheda?.note_scheda_allenamento ?? ""}
                    </TableCell>
                    <TableCell className="text-right">
                      {scheda?.data_inizio_allenamento}
                    </TableCell>
                    <TableCell className="text-right">
                      {scheda?.data_fine_allenamento}
                    </TableCell>
                    <TableCell className="text-right">
                      {scheda?.created_at_pagamento}
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
        </Table>
        </div></> : 
        null }
        {/* fine elenxo schede */}
    </div>
    </>
  )
}

export function FormField({ colspan, mdcolspan, nome, label, value, onchange, type }) {
  return (
    <div className={`${colspan} ${mdcolspan}`}>
      <Label htmlFor={nome}>{label}</Label>
      <Input
        type={type}
        id={nome}
        placeholder={label}
        name={nome}
        value={value ?? ""}
        onChange={onchange}
        className="
          appearance-none
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-brand
          focus-visible:ring-offset-2
          focus-visible:ring-offset-background
          focus-visible:border-brand
        "
      />
    </div>
  )
}

export function FormSelect({ colspan, mdcolspan, nome, label, value, onchange, options = [] }) {
  const handleValueChange = (val) => {
    onchange?.({ target: { name: nome, value: val } })
  }

  return (
    <div className={`${colspan ?? ""} ${mdcolspan ?? ""}`}>
      <label className="block text-sm font-semibold mb-1" htmlFor={nome}>
        {label}
      </label>

      <Select value={value ?? ""} onValueChange={handleValueChange}>
        <SelectTrigger id={nome} className="w-full rounded-lg">
          <SelectValue placeholder={`-- Seleziona ${label} --`} />
        </SelectTrigger>

        <SelectContent position="popper" className="z-[70]">
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="
                  data-[state=checked]:bg-brand
                  data-[state=checked]:text-foreground
                  focus:bg-brand
                "
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Mantiene la compatibilità con eventuali handler generici basati su submit */}
      <input type="hidden" name={nome} value={value ?? ""} />
    </div>
  )
}

export function FormTextarea({ colspan, mdcolspan, nome, label, value, onchange, rows = 4 }) {
  return (
    <div className={`${colspan} ${mdcolspan}`}>
      <Label htmlFor={nome}>{label}</Label>
      <Textarea
        id={nome}
        name={nome}
        placeholder={label}
        value={value ?? ""}
        onChange={onchange}
        rows={rows}
        className="
          appearance-none
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-brand
          focus-visible:ring-offset-2
          focus-visible:ring-offset-background
          focus-visible:border-brand
        "
      />
    </div>
  )
}