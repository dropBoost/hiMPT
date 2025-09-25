'use client'
import { useEffect, useState } from "react"
import comuni from "@/app/componenti/comuni.json"
import { supabase } from "@/lib/supabaseClient"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FaFacebookSquare } from "react-icons/fa";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CustomScrollbar from "@/app/componenti/customeScrollbar"

export default function InserimentoUtenti(props) {

  const onDisplay = props.onDisplay
  const dataOggi = new Date().toISOString().split("T")[0]

  //VARIABILI GESTIONE INSERIMENTO INDIRIZZO
  const [provincia, setProvincia] = useState([])
  const [citta, setCitta] = useState([])
  const [cittaSelezionata, setCittaSelezionata] = useState([])
  const [cap, setCap] = useState([])
  const [clienti, setClienti] = useState([])
  const [statusSend, setStatusSend] = useState(false)
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
    telefono: "",
    attivo: false,
  })
  
  const province = comuni.flatMap(c => c.sigla)
  const provinceSet = [...new Set(province)].sort()

  //INSERIMENTO UTENTE//

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



  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
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

  function handleChangeCheckbox(e) {
  const { name, checked } = e.target
  setFormData(prev => ({ ...prev, [name]: checked }))
  }

  function handleChangeCodiceFiscale(e) {
    const { name, value } = e.target

    const v = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") 
      .slice(0, 16)
    
      if(value.length > 16 ) {
        alert(`maggiore di 16`)
      } else {
        setFormData(prev => ({ ...prev, [name]: v }))
      }
  }

  function handleChangeDataNascita(e) {
    const { name, value } = e.target
      if(value > dataOggi ) {
        alert(`Non è possibile impostare una data successiva ad oggi`)
      } else {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
  }

  function handleChangeCartaIdentita(e) {
    const { name, value } = e.target

    const v = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") 
      .slice(0, 9)
    
      if(value.length > 9 ) {
        alert(`maggiore di 9 caratteri`)
      } else {
        setFormData(prev => ({ ...prev, [name]: v }))
      }
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
      attivo_cliente: formData.attivo,
    }
    
    if (formData.nome === "" || formData.cognome === "" || formData.dataNascita === "" || formData.provincia === "" || formData.citta === "" || formData.cap === "" || formData.indirizzo === "" || formData.email === "" || formData.telefono === ""){
      alert("Campi Vuoti")
    } else if (formData.codiceFiscale.length !== 16){
      alert(`lunghezza Codice Fiscale errata`)
    } else if(formData.cartaIdentita.length !== 9){
      alert(`lunghezza Carta Identità errata`)
    } else {
      const { data, error } = await supabase.from("clienti").insert(payload).select().single()
      if (error) {
        console.error(error)
        alert(`Errore salvataggio: ${error.message}`)
        return
      } else {
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
          telefono: "",
          attivo:false,
        })

        setStatusSend(prev => !prev)

      }

      console.log("Inserito:", data)
      alert("Cliente inserito con successo!")
    }
  }

  //FINE INSERIMENTO UTENTE //

  //DISPLAY ULTIMI 10 UTENTI //

  useEffect(() => {
    const fetchData = async () => {
    const { data, error } = await supabase
      .from("clienti")
      .select("*")
      .order("created_at_cliente", { ascending: false }) // ultimi inseriti prima
      .limit(10)

      if (error) {
        console.error("Errore:", error)
      } else {
        setClienti(data)
      }
    }

    fetchData()
  }, [statusSend])

  // FINE DISPLAY ULTIMI 10 UTENTI //

  return (
    <>
    
      <div className={`${onDisplay === 'on' ? '' : 'hidden'} w-full flex flex-col gap-3 p-3`}>
        <div className="">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-12 grid-rows-12 gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg"
          >
            <FormField nome="nome" label='Nome' value={formData.nome} colspan="col-span-6" mdcolspan="lg:col-span-2" onchange={handleChange} type='text'/>
            <FormField nome="cognome" label='Cognome' value={formData.cognome} colspan="col-span-6" mdcolspan="lg:col-span-3" onchange={handleChange} type='text'/>
            <FormField nome="cartaIdentita" label='Carta di Identità' value={formData.cartaIdentita} colspan="col-span-6" mdcolspan="lg:col-span-2" onchange={handleChangeCartaIdentita} type='text'/>
            <FormField nome="codiceFiscale" label='Codice Fiscale' value={formData.codiceFiscale} colspan="col-span-6" mdcolspan="lg:col-span-3" onchange={handleChangeCodiceFiscale} type='text'/>
            <FormField nome="dataNascita" label='Data di Nascita' value={formData.dataNascita} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChangeDataNascita} type='date'/>
            <FormSelect nome="provincia" label='Provincia' value={formData.provincia} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChangeProvincia} options={provinceSet}/>
            <FormSelect nome="citta" label='Città' value={formData.citta} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChangeCitta} options={citta}/>
            <FormSelect nome="cap" label='Cap' value={formData.cap} colspan="col-span-12" mdcolspan="lg:col-span-2" onchange={handleChangeCap} options={cap}/>
            <FormField nome="indirizzo" label='Indirizzo' value={formData.indirizzo} colspan="col-span-6" mdcolspan="lg:col-span-6" onchange={handleChange} type='text'/>
            <FormField nome="email" label='Email' value={formData.email} colspan="col-span-6" mdcolspan="lg:col-span-6" onchange={handleChangeTelEmail} type='email'/>
            <FormField nome="telefono" label='Telefono' value={formData.telefono} colspan="col-span-6" mdcolspan="lg:col-span-6" onchange={handleChangeTelEmail} type='tel'/>
            <FormCheckBox nome="attivo" label='Attivo' value={formData.attivo} colspan="col-span-1" mdcolspan="md:col-span-3 lg:col-span-2" onchange={handleChangeCheckbox} type='checkbox'/>
            <div className="col-span-12 flex justify-end">
              <button type="submit" className="border border-brand hover:bg-brand text-white px-6 py-1 text-xs rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60">Inserisci</button>
            </div>
          </form>
        </div>
        <div className="">
          <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">ULTIMI 10 CLIENTI INSERITI</h4>
        </div>
        <div className="border border-brand rounded-xl p-5">
          <Table>
            <TableCaption>... ultimi 10 clienti inseriti</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Codice Fiscale</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cognome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead className="text-right">Data Iscrizione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clienti.map ((cliente, index) => {

                const data = new Date(cliente.created_at_cliente)
                const dataFormattata = data.toLocaleString("it-IT", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  // hour: "2-digit",
                  // minute: "2-digit",
                })

                return(
                  <TableRow key={index}>
                    <TableCell className="font-medium">{cliente.codice_fiscale_cliente}</TableCell>
                    <TableCell>{cliente.nome_cliente}</TableCell>
                    <TableCell>{cliente.cognome_cliente}</TableCell>
                    <TableCell>{cliente.email_cliente}</TableCell>
                    <TableCell>{cliente.telefono_cliente}</TableCell>
                    <TableCell className="text-right">{dataFormattata}</TableCell>
                    
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

export function FormField ({colspan, mdcolspan, nome,label, value, onchange, type}) {
  return (
    <>
    <div className={`${colspan} ${mdcolspan}`}>
      <Label htmlFor={nome}>{label}</Label>
      <Input type={type} id={nome} placeholder={label} name={nome} value={value}  onChange={onchange} className="
        appearance-none
        focus:outline-none
        focus-visible:ring-2
      focus-visible:ring-brand
        focus-visible:ring-offset-2
        focus-visible:ring-offset-background
      focus-visible:border-brand
          "/>
    </div>
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
          <SelectValue placeholder={`-- Seleziona ${nome} --`} />
        </SelectTrigger>

        <SelectContent position="popper" className="z-[70]">
          <SelectGroup>
            {options.map((opt, idx) => (
              <SelectItem key={idx} value={String(opt)} className="
              data-[state=checked]:bg-brand
              data-[state=checked]:text-foreground
              focus:bg-brand
          ">
                {String(opt)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <input type="hidden" name={nome} value={value ?? ""} />
    </div>
  )
}

export function FormCheckBox({ colspan, mdcolspan, nome, label, value, onchange }) {
  return (
    <div className={`${colspan} ${mdcolspan} flex flex-col md:flex-row items-start md:items-center gap-2`}>
      <Label htmlFor={nome}>{label}</Label>
      <Checkbox
        id={nome}
        checked={!!value}
        onCheckedChange={(checked) => {
          const bool = checked === true
          onchange?.({ target: { name: nome, checked: bool } })
        }}
        className="
          h-4 w-4 shrink-0 rounded border border-gray-400
          data-[state=checked]:bg-brand
          data-[state=checked]:border-brand
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-brand
        "
      />
      <input type="hidden" name={nome} value={value ? 'true' : 'false'} />
    </div>
  )
}

