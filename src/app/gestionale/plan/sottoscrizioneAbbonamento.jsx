'use client'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CustomScrollbar from "@/app/componenti/customeScrollbar"

export default function SottoscrizioniAbbonamenti(props) {
  const onDisplay = props.onDisplay
  const dataOggi = new Date().toISOString().split("T")[0]

  const [clienti, setClienti] = useState([])
  const [clienteSelezionato, setClienteSelezionato] = useState([])
  const [personalTrainer, setPersonalTrainer] = useState([])
  const [nutrizionisti, setNutrizionisti] = useState([])
  const [sottoscrizioni, setSottoscrizioni] = useState([])
  const [statusSend, setStatusSend] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingPianoAbbonamento, setLoadingPianoAbbonamento] = useState(false)

  const [formData, setFormData] = useState({
    dataInizio: "",
    dataFine: "",
    clienteUuid: "",
    ptUuid:"",
    nutUuid:"",
  })

  const [pianoAbbonamento, setPianoAbbonamento] = useState({
    tipologiaAbbonamento: "",
    costoAbbonamento: "",
    scontoAbbonamento: "",
    noteAbbonamento: "",
    sotUuid:"",
  })

  // Carica clienti attivi
  useEffect(() => {
    ;(async () => {
      const { data: clientiData, error } = await supabase
        .from("clienti")
        .select("uuid_cliente, nome_cliente, cognome_cliente")
        .eq("attivo_cliente", true)
        .order("cognome_cliente", { ascending: true })

      if (error) {
        console.error(error)
        toast.error("Errore nel caricamento clienti")
        return
      }
      setClienti(clientiData ?? [])
    })()
  }, [])

  // Carica i personal trainer
  useEffect(() => {
    ;(async () => {
      const { data: ptData, error } = await supabase
        .from("personal_trainer")
        .select("uuid_pt, nome_pt, cognome_pt, attivo_pt")
        .eq("attivo_pt", true)
        .order("cognome_pt", { ascending: true })

      if (error) {
        console.error(error)
        toast.error("Errore nel caricamento personal Trainer")
        return
      }
      setPersonalTrainer(ptData ?? [])
    })()
  }, [])

  // Carica i nutrizionisti
  useEffect(() => {
    ;(async () => {
      const { data: nutData, error } = await supabase
        .from("nutrizionisti")
        .select("uuid_nut, nome_nut, cognome_nut, attivo_nut")
        .eq("attivo_nut", true)
        .order("cognome_nut", { ascending: true })

      if (error) {
        console.error(error)
        toast.error("Errore nel caricamento personal Trainer")
        return
      }
      setNutrizionisti(nutData ?? [])
    })()
  }, [])

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
  }, [loading])

  const opzioniClienti = clienti.map(c => ({
    value: c.uuid_cliente,
    label: `${c.cognome_cliente} ${c.nome_cliente}`
  }))

  const opzioniPt = personalTrainer.map(pt => ({
    value: pt.uuid_pt,
    label: `${pt.cognome_pt} ${pt.nome_pt}`
  }))

  const opzioniNut = nutrizionisti.map(nut => ({
    value: nut.uuid_nut,
    label: `${nut.cognome_nut} ${nut.nome_nut}`
  }))

  const opzioniSottoscrizioni = sottoscrizioni.map(sot => ({
    value: sot.uuid_sottoscrizione,
    label: ` ${sot.cliente.cognome_cliente} ${sot.cliente.nome_cliente}`
  }))

  const opzioniPianiAbbonamento = [
    {
    value: "personal-trainer",
    label: `Personal Trainer`
    },
    {
    value: "nutrizione",
    label: `Nutrizione`
    },
    {
    value: "ptandnut",
    label: `Personal Training + Nutrizione`
    },
]

  const sottoscrizioniFiltrateCliente = sottoscrizioni.filter(a => a.uuid_cliente == clienteSelezionato)

  console.log("sele",sottoscrizioniFiltrateCliente)
  console.log("uuidcliente sleezionato",clienteSelezionato)

  function handleChangeDataInizio(e) {
    const { name, value } = e.target
    if (value < dataOggi) {
      toast.error("Non è possibile impostare una data passata")
      return
    }
    // Se dataFine esiste, deve essere > dataInizio
    if (formData.dataFine && value >= formData.dataFine) {
      toast.error("La Data Inizio deve essere precedente alla Data Fine")
      return
    }

    if (value <= formData.dataFine) {
      toast.error("lavorare sulla verifica delle sottoscrizioni attive")
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleChangeDataFine(e) {
    const { name, value } = e.target
    // opzionale ma logico: fine deve essere > oggi? (spesso sì, ma dipende dal caso d’uso)
    if (value <= dataOggi) {
      toast.error("La Data Fine deve essere futura")
      return
    }
    if (formData.dataInizio && value <= formData.dataInizio) {
      toast.error("La Data Fine deve essere successiva alla Data Inizio")
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleChangeClienteUuid(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setClienteSelezionato(value)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.clienteUuid) {
      console.error("Seleziona un cliente")
      return
    }
    if (!formData.dataInizio) {
      console.error("Imposta la Data Inizio")
      return
    }
    if (formData.dataFine && formData.dataFine <= formData.dataInizio) {
      console.error("La Data Fine deve essere successiva alla Data Inizio")
      return
    }

    const payload = {
      uuid_cliente: formData.clienteUuid,
      uuid_pt: formData.ptUuid || null,
      uuid_nut: formData.nutUuid || null,
      data_inizio_sottoscrizione: formData.dataInizio,
      data_fine_sottoscrizione: formData.dataFine || null
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('sottoscrizioni')
      .insert(payload)
      .select()
      .single()
    setLoading(false)

    if (error) {
      console.error(error)
      toast.error(`Errore salvataggio: ${error.message}`)
      return
    }

    setFormData({
      dataInizio: "",
      dataFine: "",
      clienteUuid: "",
      ptUuid:"",
      nutUuid:"",
    })

    setStatusSend(prev => !prev)

    console.log("Inserito:", data)
    toast.success("Abbonamento inserito con successo!")

  }

  function handleChangePianoAbbonamento(e) {
    const { name, value } = e.target
    setPianoAbbonamento(prev => ({ ...prev, [name]: value }))
  }

    async function handleSubmitPianoAbbonamento(e) {
    e.preventDefault()

    const payloadAbb = {
      uuid_sottoscrizione: pianoAbbonamento.sotUuid,
      tipologia_abbonamento: pianoAbbonamento.tipologiaAbbonamento,
      costo_abbonamento: pianoAbbonamento.costoAbbonamento || null,
      sconto_abbonamento: pianoAbbonamento.scontoAbbonamento,
      note_abbonamento: pianoAbbonamento.noteAbbonamento || null
    }

    setLoadingPianoAbbonamento(true)
    const { data, error } = await supabase
      .from('piano_abbonamento')
      .insert(payloadAbb)
      .select()
      .single()
    setLoadingPianoAbbonamento(false)

    if (error) {
      console.error(error)
      toast.error(`Errore salvataggio: ${error.message}`)
      return
    }

    setPianoAbbonamento({
        tipologiaAbbonamento: "",
        costoAbbonamento: "",
        scontoAbbonamento: "",
        noteAbbonamento: "",
        sotUuid:"",}
    )

    setStatusSend(prev => !prev)

    console.log("Inserito:", data)
    toast.success("Piano Abbonamento inserito con successo!")

  }



  return (
    <>
      <div className={`${onDisplay === 'on' ? '' : 'hidden'} w-full flex flex-col gap-3 p-3`}>
        <div>
          <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
            REGISTRA ISCRIZIONE
          </h4>
        </div>
        <div>
          <form id="formSottoscrizioni" onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg">
            <FormSelect
              nome="clienteUuid"
              label="Cliente"
              value={formData.clienteUuid}
              colspan="col-span-12"
              mdcolspan="lg:col-span-6"
              onchange={handleChangeClienteUuid}
              options={opzioniClienti}
            />
            <FormField
              nome="dataInizio"
              label="Data Inizio"
              value={formData.dataInizio}
              colspan="col-span-12"
              mdcolspan="lg:col-span-3"
              onchange={handleChangeDataInizio}
              type="date"
            />
            <FormField
              nome="dataFine"
              label="Data Fine"
              value={formData.dataFine}
              colspan="col-span-12"
              mdcolspan="lg:col-span-3"
              onchange={handleChangeDataFine}
              type="date"
            />
            <FormSelect
              nome="ptUuid"
              label="Personal Trainer"
              value={formData.ptUuid}
              colspan="col-span-12"
              mdcolspan="lg:col-span-6"
              onchange={handleChange}
              options={opzioniPt}
            />
            <FormSelect
              nome="nutUuid"
              label="Nutrizionista"
              value={formData.nutUuid}
              colspan="col-span-12"
              mdcolspan="lg:col-span-6"
              onchange={handleChange}
              options={opzioniNut}
            />

            <div className="col-span-12 flex justify-end">
              <button
                form="formSottoscrizioni"
                type="submit"
                disabled={loading}
                className="border border-brand hover:bg-brand text-white px-6 py-1 text-xs rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Salvataggio..." : "Inserisci"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
            PIANO ABBONAMENTO
          </h4>
        </div>

        <div className="border border-brand rounded-xl p-5">
            <form id="formPianoAbbonamento" onSubmit={handleSubmitPianoAbbonamento} className="grid grid-cols-12 gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg">
            
            <FormSelect
              nome="sotUuid"
              label="Sottoscrizione"
              value={pianoAbbonamento.sotUuid}
              colspan="col-span-12"
              mdcolspan="lg:col-span-4"
              onchange={handleChangePianoAbbonamento}
              options={opzioniSottoscrizioni}
            />
            <FormSelect
              nome="tipologiaAbbonamento"
              label="Tipologia Abbonamento"
              value={pianoAbbonamento.tipologiaAbbonamento}
              colspan="col-span-12"
              mdcolspan="lg:col-span-4"
              onchange={handleChangePianoAbbonamento}
              options={opzioniPianiAbbonamento}
            />
            <FormField nome="costoAbbonamento" label='Costo (€)' value={pianoAbbonamento.costoAbbonamento} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChangePianoAbbonamento} type='number'/>
            <FormField nome="scontoAbbonamento" label='Sconto (%)' value={pianoAbbonamento.scontoAbbonamento} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChangePianoAbbonamento} type='number'/>
            <FormTextarea nome="noteAbbonamento" label='Note' value={pianoAbbonamento.noteAbbonamento} colspan="col-span-12" mdcolspan="lg:col-span-12" onchange={handleChangePianoAbbonamento} type='text-area'/>

            <div className="col-span-12 flex justify-end">
                <button
                form="formPianoAbbonamento"
                type="submit"
                disabled={loadingPianoAbbonamento}
                className="border border-brand hover:bg-brand text-white px-6 py-1 text-xs rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                {loadingPianoAbbonamento ? "Salvataggio..." : "Inserisci"}
                </button>
            </div>
            </form>
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