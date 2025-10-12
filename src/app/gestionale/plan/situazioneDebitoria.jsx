'use client'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { VscDebugRestart } from "react-icons/vsc";
import { TiDelete } from "react-icons/ti";

export default function SituzioneDebitoria(props) {
  
  const onDisplay = props.onDisplay

  const [sottoscrizioni, setSottoscrizioni] = useState([])
  const [pagamentiEffettuati, setPagamentiEffettuati] = useState(null)
  const [sceltaSottoscrizione, setSceltaSottoscrizione] = useState(false)
  const [datiSottoscrizioneScelta, setDatiSottoscrizioneScelta] = useState([])
  const [loadingPagamentoAbbonamento, setLoadingPagamentoAbbonamento] = useState(false)

  const [pagamentoAbbonamento, setPagamentoAbbonamento] = useState({
    sotUuid:"", mesePagamento:"", annoPagamento:"", notePagamento:"",
  })

  const dataOggi = new Date().toISOString().split("T")[0]

  // util formattazione data
  function conversioneData(x) {
    if (!x) return ""
    const d = new Date(x)
    return d.toLocaleString("it-IT", { year:"numeric", month:"2-digit", day:"2-digit" })
  }

  // Carica le sottoscrizioni attive
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
          uuid_pt,
          uuid_nut,
          attivo_sottoscrizione,
          tipologia_abbonamento,
          costo_abbonamento,
          sconto_abbonamento,
          condizione_pagamento,
          note_abbonamento,
          cliente:clienti (
            nome_cliente,
            cognome_cliente
          )
        `)
        .eq("attivo_sottoscrizione", true)
        .order("created_at_sottoscrizione", { ascending: false })

      if (error) {
        console.error(error)
        toast.error("Errore nel caricamento delle sottoscrizioni")
        return
      }
      setSottoscrizioni(sottoscrizioniData ?? [])
    })()
  }, [])

  // Carica i pagamenti della sottoscrizione scelta (aggiustare la partenza automatica)
  useEffect(() => {
    ;(async () => {
      const { data: pagamentiData, error } = await supabase
        .from("pagamenti")
        .select(`
          uuid_pagamento,
          uuid_sottoscrizione,
          mese_pagamento_pagamenti,
          anno_pagamento_pagamenti,
          created_at_pagamento,
          note_pagamento,
          sottoscrizione:sottoscrizioni(
            uuid_cliente,
            data_inizio_sottoscrizione,
            data_fine_sottoscrizione,
            created_at_sottoscrizione,
            uuid_pt,
            uuid_nut,
            attivo_sottoscrizione,
            tipologia_abbonamento,
            costo_abbonamento,
            sconto_abbonamento,
            condizione_pagamento,
            note_abbonamento,
            cliente:clienti (
            nome_cliente,
            cognome_cliente
            )
          )
        `)
        .eq("uuid_sottoscrizione", pagamentoAbbonamento.sotUuid)
        .order("created_at_pagamento", { ascending: false })

      if (error) {
        console.error(error)
        toast.error("Errore nel caricamento delle sottoscrizioni")
        return
      }
      setPagamentiEffettuati(pagamentiData ?? [])
    })()
  }, [sceltaSottoscrizione])

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("sottoscrizioni")
        .select("*")
        .eq("uuid_sottoscrizione", pagamentoAbbonamento.sotUuid)
        .maybeSingle()

      if (error) {
        console.error(error)
        toast.error("Errore nel caricamento delle sottoscrizioni")
        return
      }
      setDatiSottoscrizioneScelta(data)

    })()
  }, [sceltaSottoscrizione])

  const opzioniSottoscrizioni = sottoscrizioni.map(sot => {
    const data = new Date(sot.data_inizio_sottoscrizione)
    const dataFormattata = data.toLocaleDateString("it-IT", { year:"numeric", month:"2-digit", day:"2-digit" })
    return {
      value: sot.uuid_sottoscrizione,
      label: `${sot.cliente.cognome_cliente} ${sot.cliente.nome_cliente} - ${dataFormattata}`
    }
  })

  console.log(datiSottoscrizioneScelta)

  function handleChangeSelectSottoscrizione(e) {
    const { name, value } = e.target
    setPagamentoAbbonamento(prev => ({ ...prev, [name]: value }))
    setSceltaSottoscrizione(prev => !prev) // forza il reload
  }

  async function handleSubmitPagamentoAbbonamento(e) {
    e.preventDefault()

    if (!pagamentoAbbonamento.sotUuid) {
      console.log("Scegli un piano di Abbonamento")
      return
    }
    if (!pagamentoAbbonamento.mesePagamento) {
      console.log("Scegli il mese")
      return
    }
    if (!pagamentoAbbonamento.annoPagamento) {
      console.log("Scegli l'anno")
      return
    }

    const payloadPagamento = {
      uuid_sottoscrizione: pagamentoAbbonamento.sotUuid,
      mese_pagamento_pagamenti: pagamentoAbbonamento.mesePagamento,
      anno_pagamento_pagamenti: pagamentoAbbonamento.annoPagamento || null,
      note_pagamento: pagamentoAbbonamento.notePagamento,
    }

    setLoadingPagamentoAbbonamento(true)
    const { data, error } = await supabase
      .from('pagamenti')
      .insert(payloadPagamento)
      .select()
      .single()
    setLoadingPagamentoAbbonamento(false)

    if (error) {
      console.error(error)
      toast.error(`Errore salvataggio: ${error.message}`)
      return
    }

    setSceltaSottoscrizione(prev => !prev) // ricarica piano/pagamenti
    toast.success("Pagamento inserito con successo!")
  }

  function resetFormPagamento () {
    setPagamentoAbbonamento({ sotUuid:"", mesePagamento:"", annoPagamento:"", notePagamento:"" })
    setSceltaSottoscrizione(prev => !prev)
    setPagamentiEffettuati("")
  }

  function mesiTrascorsi(inizioStr, fineStr) {
    const parse = (s) => {
      const [y, m, d] = s.split("-").map(Number)
      return new Date(Date.UTC(y, m - 1, d))
    }

    let a = parse(inizioStr)
    let b = parse(fineStr)

    if (a > b) [a, b] = [b, a] // assicura ordine cronologico

    let mesi = (b.getUTCFullYear() - a.getUTCFullYear()) * 12
            + (b.getUTCMonth() - a.getUTCMonth())

    // Se il giorno di b è minore del giorno di a, non è passato un mese pieno
    if (b.getUTCDate() < a.getUTCDate()) mesi -= 1

    return mesi +1
  }

  function giorniRestanti(inizioStr, fineStr, { inclusiveEnd = false, clampZero = false } = {}) {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const parse = (s) => {
      const [y, m, d] = s.split("-").map(Number);
      return Date.UTC(y, m - 1, d); // mezzanotte UTC
    };

    const aUTC = parse(inizioStr);
    const bUTC = parse(fineStr);

    // differenza in giorni (interi)
    let giorni = Math.floor((bUTC - aUTC) / MS_PER_DAY);

    if (inclusiveEnd) giorni += 1;
    if (clampZero && giorni < 0) return 0;

    return giorni;
  }

  const pagamentiOrdinati = [...(pagamentiEffettuati ?? [])]
  .sort((a, b) =>
    (b.anno_pagamento_pagamenti ?? 0) - (a.anno_pagamento_pagamenti ?? 0) ||
    parseInt(b.mese_pagamento_pagamenti ?? "0", 10) - parseInt(a.mese_pagamento_pagamenti ?? "0", 10)
  )

  const r = pagamentiEffettuati?.[0];
  const start   = datiSottoscrizioneScelta.data_inizio_sottoscrizione;
  const end   = datiSottoscrizioneScelta.data_fine_sottoscrizione;
  const costo   = Number(datiSottoscrizioneScelta.costo_abbonamento ?? 0);
  const sconto  = Number(datiSottoscrizioneScelta.sconto_abbonamento ?? 0);
  const cond    = Number(datiSottoscrizioneScelta.condizione_pagamento ?? 1);
  const mesi    = start ? mesiTrascorsi(start, dataOggi) : 0;
  const giorniFine    = end ? giorniRestanti(dataOggi, end) : 0;
  const base    = (cond === 1 ? mesi * costo : cond * costo);
  const tot     = base - (base * sconto) / 100;
  const totalePagamenti = pagamentiEffettuati?.length || 0
  const scontoEffettuato = (totalePagamenti * costo)*sconto/100
  const totaleFatturato = (totalePagamenti * costo) - scontoEffettuato
  const abbonamentoTerminato = end < dataOggi



  return (
    <>
      <div className={`${onDisplay === 'on' ? '' : 'hidden'} w-full flex flex-col gap-3 p-3`}>
        <div className="flex flex-col gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg">
          <form id="formPagamentoAbbonamento" onSubmit={handleSubmitPagamentoAbbonamento} className="">
            <FormSelect
              nome="sotUuid"
              label="Sottoscrizioni Attive"
              value={pagamentoAbbonamento.sotUuid}
              colspan="col-span-12"
              mdcolspan="lg:col-span-4"
              onchange={handleChangeSelectSottoscrizione}
              options={opzioniSottoscrizioni}
            />
          </form> 
          <div className="col-span-12 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetFormPagamento}
              className="bg-brand hover:bg-brand/70 text-white px-3 rounded-xl text-xs font-semibold hover:opacity-90 transition disabled:opacity-60 h-6"
            >
              {loadingPagamentoAbbonamento ? <TiDelete /> : <VscDebugRestart />}
            </button>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
            PAGAMENTI EFFETTUATI
          </h4>
          {datiSottoscrizioneScelta.condizione_pagamento == 1 ? 
          <h4 className="text-[0.6rem] font-bold text-dark border border-neutral-600 px-3 py-2 w-fit rounded-xl">
            ABBONAMENTO MENSILE
          </h4> : null
          }
          {datiSottoscrizioneScelta.condizione_pagamento == 3 ? 
          <h4 className="text-[0.6rem] font-bold text-dark border border-neutral-600 px-3 py-2 w-fit rounded-xl">
            ABBONAMENTO TRIMESTRALE
          </h4> : null
          }
          {datiSottoscrizioneScelta.condizione_pagamento == 6 ? 
          <h4 className="text-[0.6rem] font-bold text-dark border border-neutral-600 px-3 py-2 w-fit rounded-xl">
            ABBONAMENTO SEMESTRALE
          </h4> : null
          }
          {datiSottoscrizioneScelta.condizione_pagamento == 12 ? 
          <h4 className="text-[0.6rem] font-bold text-dark border border-neutral-600 px-3 py-2 w-fit rounded-xl">
            ABBONAMENTO ANNUALE
          </h4> : null
          }
        </div>
        
        <div className="flex lg:flex-row flex-col w-full border border-neutral-700 p-5 rounded-xl gap-3 overflow-auto">

          <div className="flex flex-col border border-neutral-700 rounded-xl p-3 shadow-lg gap-2">
            <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border uppercase border-brand px-2 py-1 w-fit rounded-md">GIORNI RESTANTI</h4>
            <div className="flex flex-row justify-start items-end">
              {giorniFine >= 10 ? 
              <span className="text-5xl">
                {giorniFine}
              </span> : 
              <span className="text-5xl text-red-600">
                {giorniFine >= 0 ? giorniFine : <span className="text-5xl">off</span>}
              </span>  
              }
              <span className="text-xs text-neutral-500">
                &ensp;/ giorni</span>
            </div>
          </div>

          <div className="flex flex-col border border-neutral-700 rounded-xl p-3 shadow-lg gap-2">
            <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border uppercase border-brand px-2 py-1 w-fit rounded-md">MENSILITà PAGATE</h4>
            <div className="flex flex-row justify-start items-end">
              {totalePagamenti >= mesi ? 
              <span className="text-5xl">
                {totalePagamenti}
              </span> : 
              <span className="text-5xl text-red-600">
                {totalePagamenti}
              </span>  
              }
              <span className="text-xs text-neutral-500">&ensp;/ {cond == 1 ? mesi : cond} mesi</span>
            </div>
          </div>

          <div className="flex flex-col border border-neutral-700 rounded-xl p-3 shadow-lg gap-2">
            <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border uppercase border-brand px-2 py-1 w-fit rounded-md">TOTALE FATTURATO</h4>
            <div className="flex flex-row items-end">
              {totalePagamenti >= mesi ?
              <span className="text-5xl">{totaleFatturato}€</span>
              : <span className="text-5xl text-red-600">{totaleFatturato}€</span>}
              <span className="text-xs text-neutral-500">
              &ensp;/ {tot}€
            </span>
            </div>
          </div>

          <div className="flex flex-col border border-neutral-700 rounded-xl p-3 shadow-lg gap-2">
            <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border uppercase border-brand px-2 py-1 w-fit rounded-md">TOTALE SCONTO EFFETTUATO</h4>
            <div className="flex flex-row items-end">
              <span className="text-5xl">{scontoEffettuato}€</span><span className="text-xs text-neutral-500">&ensp;/ {sconto}%</span>
            </div>
          </div>

          {tot > totaleFatturato && cond == 1 ?
          <div className="flex flex-col border border-red-600 rounded-xl p-3 shadow-lg gap-2">
            <h4 className="text-[0.6rem] font-bold text-dark border uppercase border-red-600 px-2 py-1 w-fit rounded-md">IMPORTO RESTANTE</h4>
            <div className="flex flex-row items-end">
              <span className="text-5xl text-red-600">{tot - totaleFatturato}€</span>
            </div>
          </div>  : null }
          {tot > totaleFatturato && cond !== 1 && giorniFine <= 30 ? 
          <div className="flex flex-col border border-red-600 rounded-xl p-3 shadow-lg gap-2">
            <h4 className="text-[0.6rem] font-bold text-dark border uppercase border-red-600 px-2 py-1 w-fit rounded-md">IMPORTO RESTANTE</h4>
            <div className="flex flex-row items-end">
              <span className="text-5xl text-red-600">{tot - totaleFatturato}€</span>
            </div>
          </div> : null }
          </div> 
          {totalePagamenti > 0 ?
          <div className="border border-brand rounded-xl p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome e Cognome</TableHead>
                  <TableHead className="text-left">Note</TableHead>
                  <TableHead className="text-right">Mensilità Pagata</TableHead>
                  <TableHead className="text-right">Data Pagamento</TableHead>
                  <TableHead className="text-right">Inizio Sottoscrizione</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {(!pagamentiEffettuati || pagamentiEffettuati.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm italic">
                      {pagamentiEffettuati ? "Nessun pagamento registrato" : "Seleziona un piano abbonamento"}
                    </TableCell>
                  </TableRow>
                ) : (
                  pagamentiOrdinati.map((pagamento, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {pagamento?.sottoscrizione?.cliente?.nome_cliente} {pagamento?.sottoscrizione?.cliente?.cognome_cliente}
                      </TableCell>
                      <TableCell className="text-left font-medium">
                        {pagamento?.note_pagamento ?? ""}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {pagamento?.anno_pagamento_pagamenti ?? ""} / {pagamento?.mese_pagamento_pagamenti ?? ""}
                      </TableCell>
                      <TableCell className="text-right">
                        {conversioneData(pagamento?.created_at_pagamento)}
                      </TableCell>
                      <TableCell className="text-right">
                        {conversioneData(pagamento?.sottoscrizione?.data_inizio_sottoscrizione)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div> : null }
      </div>
    </>
  )
}

export function FormField({ nome, label, value, onchange, type }) {
  return (
    <>
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
    </>  
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

      {/* Mantiene compatibilità con handler generici basati su submit */}
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
