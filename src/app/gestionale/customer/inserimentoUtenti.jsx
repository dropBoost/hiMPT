'use client'
import { useEffect, useState } from "react"
import comuni from "@/app/componenti/comuni.json"
import { supabase } from "@/lib/supabaseClient"

export default function InserimentoUtenti(props) {

  const onDisplay = props.onDisplay

  //VARIABILI GESTIONE INSERIMENTO INDIRIZZO
  const [provincia, setProvincia] = useState([])
  const [citta, setCitta] = useState([])
  const [cittaSelezionata, setCittaSelezionata] = useState([])
  const [cap, setCap] = useState([])
  
  const province = comuni.flatMap(c => c.sigla)
  const provinceSet = [...new Set(province)].sort()

  useEffect(() => {

    const cittaFiltrata = comuni
    .filter(c => c.sigla === provincia)  
    .map(c => c.nome)                     
    .sort((a, b) => a.localeCompare(b))  

    setCitta(cittaFiltrata)
  }, [provincia])

  

  useEffect(() => {

    const capFiltrati = comuni
    .filter(c => c.nome === cittaSelezionata)  
    .map(c => c.cap[0])                   
    .sort((a, b) => a.localeCompare(b))  

    setCap(capFiltrati)
  }, [cittaSelezionata])

  //GESTIONE FORM
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    dataNascita: "",
    provincia: "",
    citta: "",
    cap:"",
    indirizzo:"",
    cartaIdentita:"",
    codiceFiscale:"",
    email: "",
    telefono: ""
  })

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value.toUpperCase() })
  }

  function handleChangeTelEmail(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  function handleChangeProvincia(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setProvincia(value)
  }

  function handleChangeCitta(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setCittaSelezionata(value)
  }

  function handleChangeCap(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setCap([value])
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      nome_cliente: formData.nome || null,
      cognome_cliente: formData.cognome || null,
      data_nascita_cliente: formData.dataNascita || null,
      provincia_cliente: formData.provincia || null,           
      citta_cliente: formData.citta || null,
      cap_cliente: formData.cap || null,
      indirizzo_cliente: formData.indirizzo || null,
      carta_identita_cliente: formData.cartaIdentita || null,
      codice_fiscale_cliente: formData.codiceFiscale || null,
      email_cliente: formData.email || null,
      telefono_cliente: formData.telefono || null,
    }

    const { data, error } = await supabase.from("clienti").insert(payload).select().single()

    if (error) {
      console.error(error)
      alert(`Errore salvataggio: ${error.message}`)
      return
    }

    console.log("Inserito:", data)
    alert("Cliente inserito con successo!")

    // reset soft (mantieni province/città/caricate, pulisci solo i valori)
    setFormData({
      nome: "",
      cognome: "",
      dataNascita: "",
      provincia: "",
      citta: "",
      cap: "",
      indirizzo: "",
      cartaIdentita: "",
      codiceFiscale: "",
      email: "",
      telefono: ""
    })
  }

  return (
    <>
      <div className={`${onDisplay === 'on' ? '' : 'hidden'} w-full flex flex-col gap-3`}>
        <div className="">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-12 gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg"
          >
            <FormField nome="nome" label='Nome' value={formData.nome} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChange} type='text'/>
            <FormField nome="cognome" label='Cognome' value={formData.cognome} colspan="col-span-12" mdcolspan="lg:col-span-3" onchange={handleChange} type='text'/>
            <FormField nome="cartaIdentita" label='Carta di Identità' value={formData.cartaIdentita} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChange} type='text'/>
            <FormField nome="codiceFiscale" label='Codice Fiscale' value={formData.codiceFiscale} colspan="col-span-12" mdcolspan="lg:col-span-3" onchange={handleChange} type='text'/>
            <FormField nome="dataNascita" label='Data di Nascita' value={formData.dataNascita} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChange} type='date'/>
            <FormSelect nome="provincia" label='Provincia' value={formData.provincia} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChangeProvincia} options={provinceSet}/>
            <FormSelect nome="citta" label='Città' value={formData.citta} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChangeCitta} options={citta}/>
            <FormSelect nome="cap" label='Cap' value={formData.cap} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChangeCap} options={cap}/>
            <FormField nome="indirizzo" label='Indirizzo' value={formData.indirizzo} colspan="col-span-12" mdcolspan="lg:col-span-6" onchange={handleChange} type='text'/>
            
            <FormField nome="email" label='Email' value={formData.email} colspan="col-span-12" mdcolspan="lg:col-span-6" onchange={handleChangeTelEmail} type='email'/>
            <FormField nome="telefono" label='Telefono' value={formData.telefono} colspan="col-span-12" mdcolspan="lg:col-span-6" onchange={handleChangeTelEmail} type='tel'/>
            <div className="col-span-12 flex justify-end">
              <button type="submit" className="bg-brand text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90 transition">Inserisci</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export function FormField ({colspan, mdcolspan, nome,label, value, onchange, type}) {
  return (
    <>
    <div className={`${colspan} ${mdcolspan}`}>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type={type}
        name={nome}
        value={value}
        onChange={onchange}
        className="
        w-full rounded-lg px-3 py-2
        bg-white text-neutral-900 border border-neutral-300
        focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand
        dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700
        dark:focus:ring-brand/40 dark:focus:border-brand
        "
      />
    </div>
    </>
  )
}

export function FormSelect({ colspan, mdcolspan, nome, label, value, onchange, options }) {
  return (
    <div className={`${colspan} ${mdcolspan}`}>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <select
        name={nome}
        value={value}
        onChange={onchange}
        className="
        w-full rounded-lg px-3 py-2 appearance-none
        bg-white text-neutral-900 border border-neutral-300
        focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand
        dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700
        dark:focus:ring-brand/40 dark:focus:border-brand
        "
      >
        <option value="">-- Seleziona {nome} --</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
