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



export default function RegistrazionePagamenti(props) {
  const onDisplay = props.onDisplay

  const [sottoscrizioni, setSottoscrizioni] = useState([])
  const [pagamentiEffettuati, setPagamentiEffettuati] = useState([])
  const [loading, setLoading] = useState(false)
  const [sceltaSottoscrizione, setSceltaSottoscrizione] = useState(false)
  const [loadingPagamentoAbbonamento, setLoadingPagamentoAbbonamento] = useState(false)

  const [pagamentoAbbonamento, setPagamentoAbbonamento] = useState({
    sotUuid:"",
    mesePagamento:"",
    annoPagamento:"",
    notePagamento:"",
  })

  console.log(pagamentoAbbonamento.sotUuid)

  // Carica le sottoscrizioni
  useEffect(() => {
    ;(async () => {
      const { data: sottoscrizioniData, error } = await supabase
        .from("sottoscrizioni")
        .select(`
            uuid_sottoscrizione,
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
  }, [loading])


  /////////////LAVORANDO SULLA QUERY PER ESTRAPOLARE I PAGAMENTI EFFETTUATI DA UN CLIENTE SELEZIONATO
  // Carica i pagamenti
  useEffect(() => {
  const sotUuid = pagamentoAbbonamento.sotUuid
  if (!sotUuid) {
    setPagamentiEffettuati([])
    return
  }

  ;(async () => {
    const { data, error } = await supabase
      .from("pagamenti")
      .select(`
        uuid_sottoscrizione,
        mese_pagamento_pagamenti,
        anno_pagamento_pagamenti,
        note_pagamento,
        created_at_pagamento,
        sottoscrizioni!inner (
          uuid_sottoscrizione,
          created_at_sottoscrizione,
          clienti (
            nome_cliente,
            cognome_cliente
          )
        )
      `)
      .eq("uuid_sottoscrizione", pagamentoAbbonamento.sotUuid)
      .order("created_at_pagamento", { ascending: false })

    if (error) {
      console.error(error)
      console.error("Errore nel caricamento dei pagamenti")
      return
    }

    setPagamentiEffettuati(data ?? [])
  })()
}, [sceltaSottoscrizione])

  const opzioniSottoscrizioni = sottoscrizioni.map(sot => {
    const data = new Date(sot.created_at_sottoscrizione)
    const dataFormattata = data.toLocaleDateString("it-IT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })

    return {
      value: sot.uuid_sottoscrizione,
      label: `${sot.cliente.cognome_cliente} ${sot.cliente.nome_cliente} - ${dataFormattata}`
    }
  })

  const opzioniMese = [
  {
    value: "01",
    label: "Gennaio",
  },
  {
    value: "02",
    label: "Febbraio",
  },
  {
    value: "03",
    label: "Marzo",
  },
  {
    value: "04",
    label: "Aprile",
  },
  {
    value: "05",
    label: "Maggio",
  },
  {
    value: "06",
    label: "Giugno",
  },
  {
    value: "07",
    label: "Luglio",
  },
  {
    value: "08",
    label: "Agosto",
  },
  {
    value: "09",
    label: "Settembre",
  },
  {
    value: "10",
    label: "Ottobre",
  },
  {
    value: "11",
    label: "Novembre",
  },
  {
    value: "12",
    label: "Dicembre",
  },
  ]

  function getOpzioniAnni(range = 2) {
    const currentYear = new Date().getFullYear()
    const start = currentYear - range
    const end = currentYear + range

    return Array.from({ length: end - start + 1 }, (_, i) => {
      const year = start + i
      return { value: String(year), label: String(year) }
    })
  }

  function handleChangePagamentoAbbonamento(e) {
    const { name, value } = e.target
    setPagamentoAbbonamento(prev => ({ ...prev, [name]: value }))
  }

  function handleChangeSelectSottoscrizione(e) {
    const { name, value } = e.target
    setPagamentoAbbonamento(prev => ({ ...prev, [name]: value }))
    setSceltaSottoscrizione((prev => !prev))
  }

  async function handleSubmitPagamentoAbbonamento(e) {
    e.preventDefault()

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

    setSceltaSottoscrizione((prev => !prev))

    console.log("Inserito:", data)
    toast.success("Piano Abbonamento inserito con successo!")

  }

  function resetFormPagamento () {
      setPagamentoAbbonamento(
      {
        sotUuid:"",
        mesePagamento: "",
        annoPagamento: "",
        notePagamento: "",
      }
      
    )
    setSceltaSottoscrizione((prev => !prev))
  }

  return (
    <>
      <div className={`${onDisplay === 'on' ? '' : 'hidden'} w-full flex flex-col gap-3 p-3`}>
        <div>
          <form id="formPagamentoAbbonamento" onSubmit={handleSubmitPagamentoAbbonamento} className="grid grid-cols-12 gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg">
            <FormSelect
              nome="sotUuid"
              label="Sottoscrizione"
              value={pagamentoAbbonamento.sotUuid}
              colspan="col-span-12"
              mdcolspan="lg:col-span-4"
              onchange={handleChangeSelectSottoscrizione}
              options={opzioniSottoscrizioni}
            />
            <FormSelect
              nome="mesePagamento"
              label="Mese"
              value={pagamentoAbbonamento.mesePagamento}
              colspan="col-span-12"
              mdcolspan="lg:col-span-2"
              onchange={handleChangePagamentoAbbonamento}
              options={opzioniMese}
            />
            <FormSelect
              nome="annoPagamento"
              label="Anno"
              value={pagamentoAbbonamento.annoPagamento}
              colspan="col-span-12"
              mdcolspan="lg:col-span-2"
              onchange={handleChangePagamentoAbbonamento}
              options={getOpzioniAnni(2)}
            />
            <FormField nome="notePagamento" label='Note' value={pagamentoAbbonamento.notePagamento} colspan="col-span-12" mdcolspan="lg:col-span-4" onchange={handleChangePagamentoAbbonamento} type='text'/>
            <div className="col-span-12 flex justify-end gap-2">
                <button
                form="formPagamentoAbbonamento"
                type="submit"
                disabled={loadingPagamentoAbbonamento}
                className="border border-brand hover:bg-brand text-white px-6 py-1 text-xs rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                {loadingPagamentoAbbonamento ? "Salvataggio..." : "Inserisci"}
                </button>
                <button
                onClick={resetFormPagamento}
                className="bg-brand hover:bg-brand/70 text-white px-3 rounded-xl text-xs font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                {loadingPagamentoAbbonamento ? <TiDelete /> : <VscDebugRestart />}
                </button>
            </div>
            </form>
        </div>

        <div>
          <h4 className="text-xs font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
            PIANO ABBONAMENTO
          </h4>
        </div>

        <div className="border border-brand rounded-xl p-5">
        <Table>
            <TableCaption>... ultimi 10 clienti inseriti</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nome e Cognome</TableHead>
                <TableHead className="text-left">Note</TableHead>
                <TableHead className="text-right">Data Pagamento</TableHead>
                <TableHead className="text-right">Inizio Sottoscrizione</TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentiEffettuati.map ((pagamento, index) => {

                function conversioneData (x) {
                  const data = new Date(x)
                  const dataFormattata = data.toLocaleString("it-IT", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    // hour: "2-digit",
                    // minute: "2-digit",
                  })
                  return dataFormattata
                }
                return(

                  <TableRow key={index}>
                    <TableCell className="font-medium">{pagamento.sottoscrizioni.clienti.nome_cliente} {pagamento.sottoscrizioni.clienti.cognome_cliente}</TableCell>
                    <TableCell className="text-left font-medium">{pagamento.note_pagamento}</TableCell>
                    <TableCell className="text-right">{conversioneData(pagamento.created_at_pagamento)}</TableCell>
                    <TableCell className="text-right">{conversioneData(pagamento.sottoscrizioni.created_at_sottoscrizione)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
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