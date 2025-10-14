"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomScrollbar from "@/app/componenti/customeScrollbar";
import { VscDebugRestart } from "react-icons/vsc";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function InserisciProgressi(props) {
  const onDisplay = props.onDisplay;
  const today = new Date();
  const dataOggi = new Date().toISOString().split("T")[0];
  const dataOggiSottoscrizioni = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [sottoscrizioni, setSottoscrizioni] = useState([]);
  const [statusSend, setStatusSend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openSchede, setOpenSchede] = useState(false);
  const [eserciziSchedaSelezionata, setEserciziSchedaSelezionata] = useState([]);
  const [clienteSelezionato, setClienteSelezionato] = useState("");
  const [schedaSelezionata, setSchedaSelezionata] = useState("");
  const [pianiAllenamento, setPianiAllenamento] = useState([]);
  const [pianoAllenamentoSelezionato, setPianoAllenamentoSelezionato] = useState({});
  const [mediaDifficolta, setMediaDifficolta] = useState(0);

  const [formData, setFormData] = useState({
    dataInizio: "",
    dataFine: "",
    clienteUuid: clienteSelezionato,
    ptUuid: "",
    nutUuid: "",
    tipologiaAbbonamento: "",
    costoAbbonamento: "",
    scontoAbbonamento: "",
    noteAbbonamento: "",
    condizionePagamento: "",
  });

  //formattazione data
  function conversioneData(x) {
    if (!x) return "";
    const d = new Date(x);
    return d.toLocaleString("it-IT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  // Carica le sottoscrizioni
  useEffect(() => {
    (async () => {
      const { data: sottoscrizioniData, error } = await supabase
        .from("sottoscrizioni")
        .select(
          `
            uuid_sottoscrizione,
            uuid_cliente,
            data_inizio_sottoscrizione,
            data_fine_sottoscrizione,
            attivo_sottoscrizione,
            cliente:clienti (
                nome_cliente,
                cognome_cliente
            )`
        )
        .eq("attivo_sottoscrizione", true)
        .order("cliente(cognome_cliente)", { ascending: true })
        .order("cliente(nome_cliente)", { ascending: true });

      if (error) {
        console.error(error);
        console.error("Errore nel caricamento delle sottoscrizioni");
        return;
      }
      setSottoscrizioni(sottoscrizioniData ?? []);
    })();
  }, [loading]);

  // Carica le schede del cliente selezionato
  useEffect(() => {
    if (!clienteSelezionato) return;
    (async () => {
      const { data: piani, error } = await supabase
        .from("schede_allenamenti")
        .select(
          `
            uuid_scheda_allenamento,
            uuid_sottoscrizione,
            data_inizio_allenamento,
            data_fine_allenamento,
            note_scheda_allenamento,
            created_at_allenamento,
            scheda_completata_allenamento,
            giornate_allenamento,
            sottoscrizione:sottoscrizioni(
            uuid_sottoscrizione,
            uuid_cliente,
            data_inizio_sottoscrizione,
            data_fine_sottoscrizione,
            uuid_pt,
            attivo_sottoscrizione,
            cliente:clienti(
                nome_cliente,
                cognome_cliente,
                data_nascita_cliente,
                telefono_cliente,
                attivo_cliente
            )
            )
        `
        )
        .eq("uuid_sottoscrizione", clienteSelezionato)
        .eq("sottoscrizione.attivo_sottoscrizione", true)
        // .eq("sottoscrizione.uuid_pt", ptUuid)                 // per un PT specifico
        .order("created_at_allenamento", { ascending: false }); // ordina per data creazione scheda

      if (error) {
        console.error(error);
        toast.error("Errore nel caricamento dei piani di allenamento");
        return;
      }
      setPianiAllenamento(piani ?? []);
      setEserciziSchedaSelezionata([]);
    })();
  }, [clienteSelezionato]);

  // Carica le scheda selezionata
  useEffect(() => {
    if (!schedaSelezionata) return;
    (async () => {
      const { data: esercizi, error } = await supabase
        .from("esercizi_assegnati")
        .select(
          `
            uuid_esercizio_assegnato,
            uuid_scheda_allenamento,
            uuid_esercizio,
            serie,
            peso,
            ripetizioni,
            giorno,
            esercizio:esercizi(
                difficolta_esercizio,
                gruppo_muscolare_esercizio,
                tempo_esecuzione_esercizio,
                codice_esercizio
            )
        `
        )
        .eq("uuid_scheda_allenamento", schedaSelezionata);
      // .order("giorno", { ascending: false })   // ordina per data creazione scheda

      if (error) {
        console.error(error);
        toast.error("Errore nel caricamento dei piani di allenamento");
        return;
      }
      setEserciziSchedaSelezionata(esercizi ?? []);
    })();
  }, [schedaSelezionata, clienteSelezionato]);

  const opzioniSottoscrizioni = (sottoscrizioni ?? []).map((sot) => ({
    value: sot.uuid_sottoscrizione,
    label: `${sot.cliente?.cognome_cliente ?? ""} ${
      sot.cliente?.nome_cliente ?? ""
    } --> ${sot.data_fine_sottoscrizione ?? ""}`,
  }));

  const opzioniPianiAllenamento = (pianiAllenamento ?? []).map((scheda) => ({
    value: scheda.uuid_scheda_allenamento,
    label: `Inizio: ${conversioneData(
      scheda.data_inizio_allenamento ?? null
    )} --> Fine: ${conversioneData(scheda.data_fine_allenamento ?? null)}`,
  }));

  useEffect(() => {
    if (!pianiAllenamento) return;
    const piano = pianiAllenamento.find(
      (p) => p.uuid_scheda_allenamento === schedaSelezionata
    );
    setPianoAllenamentoSelezionato(piano ?? null);
  }, [pianiAllenamento, schedaSelezionata]);

  useEffect(() => {
    if (
      !Array.isArray(eserciziSchedaSelezionata) ||
      eserciziSchedaSelezionata.length === 0
    ) {
      setMediaDifficolta(0);
      return;
    }

    const { total, count } = eserciziSchedaSelezionata.reduce(
      (acc, x) => {
        const n = Number(x.esercizio?.difficolta_esercizio);
        if (Number.isFinite(n)) {
          acc.total += n;
          acc.count += 1;
        }
        return acc;
      },
      { total: 0, count: 0 }
    );

    const media = count ? total / count : 0;

    setMediaDifficolta((media).toFixed(2));
  }, [eserciziSchedaSelezionata]);

  function handleChangeDataInizio(e) {
    const { name, value } = e.target;

    if (value < dataOggi) {
      toast.error("Non è possibile impostare una data passata");
      return;
    }
    if (formData.dataFine && value >= formData.dataFine) {
      toast.error("La Data Inizio deve essere precedente alla Data Fine");
      return;
    }

    {
      sottoscrizioniFiltrateCliente.map((sc, index) => {
        if (value <= sc.data_fine_sottoscrizione) {
          console.log("sottoscrizione già attiva");
          return;
        }
      });
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleChangeDataFine(e) {
    const { name, value } = e.target;

    if (value <= dataOggi) {
      toast.error("La Data Fine deve essere futura");
      return;
    }
    if (formData.dataInizio && value <= formData.dataInizio) {
      toast.error("La Data Fine deve essere successiva alla Data Inizio");
      return;
    }
    if (!formData.dataInizio) {
      console.log("Scegli prima la data di inizio");
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!clienteSelezionato) {
      console.error("Seleziona un cliente");
      return;
    }
    if (!formData.dataInizio) {
      console.error("Imposta la Data Inizio");
      return;
    }
    if (!formData.dataFine) {
      console.error("Imposta la Data di Fine");
      return;
    }
    if (!formData.ptUuid) {
      console.error("Scegli un Personal Trainer");
      return;
    }

    const payload = {
      uuid_cliente: clienteSelezionato,
      uuid_pt: formData.ptUuid || null,
      uuid_nut: formData.nutUuid || null,
      data_inizio_sottoscrizione: formData.dataInizio,
      data_fine_sottoscrizione: formData.dataFine || null,
      tipologia_abbonamento: formData.tipologiaAbbonamento,
      costo_abbonamento: formData.costoAbbonamento,
      sconto_abbonamento: formData.scontoAbbonamento || null,
      note_abbonamento: formData.noteAbbonamento || null,
      condizione_pagamento: formData.condizionePagamento,
    };

    setLoading(true);
    const { data, error } = await supabase
      .from("sottoscrizioni")
      .insert(payload)
      .select()
      .single();
    setLoading(false);

    if (error) {
      console.error(error);
      toast.error(`Errore salvataggio: ${error.message}`);
      return;
    }

    setFormData({
      dataInizio: "",
      dataFine: "",
      clienteUuid: "",
      ptUuid: "",
      nutUuid: "",
      tipologiaAbbonamento: "",
      costoAbbonamento: "",
      scontoAbbonamento: "",
      noteAbbonamento: "",
      condizionePagamento: "",
    });

    setStatusSend((prev) => !prev);

    console.log("Inserito:", data);
    toast.success("Abbonamento inserito con successo!");
  }

  function resetFormSottoscrizione() {
    setFormData({
      dataInizio: "",
      dataFine: "",
      clienteUuid: "",
      ptUuid: "",
      nutUuid: "",
    });

    setClienteSelezionato("");
    setEserciziSchedaSelezionata("");
    setPianiAllenamento([]);
  }

  return (
    <>
      <div
        className={`${
          onDisplay === "on" ? "" : "hidden"
        } w-full flex flex-col gap-3 p-3`}
      >
        <div>
          {/* <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
            REGISTRA ISCRIZIONE
          </h4> */}
        </div>
        <div>
          <form
            id="formSottoscrizioni"
            onSubmit={handleSubmit}
            className="grid grid-cols-12 gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg"
          >
            <div className="col-span-12 lg:col-span-6">
              <label className="block text-sm font-semibold mb-1">
                Sottoscrizioni
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
                    data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2"
                  >
                    {clienteSelezionato
                      ? opzioniSottoscrizioni.find(
                          (opt) => opt.value === clienteSelezionato
                        )?.label
                      : "seleziona un cliente ..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={4}
                  className="p-0 w-[var(--radix-popover-trigger-width)]"
                >
                  <Command className="p-1">
                    <CommandInput
                      placeholder="Cerca..."
                      className="h-8 focus:ring-1 focus:ring-brand focus:border-brand outline-none focus:outline-none my-2"
                    />
                    <CommandList className="my-1">
                      <CommandEmpty>Nessun risultato</CommandEmpty>
                      <CommandGroup>
                        {opzioniSottoscrizioni.map((opt) => (
                          <CommandItem
                            key={opt.value}
                            // ciò che viene usato per il filtro:
                            value={`${opt.label} ${opt.value}`}
                            onSelect={() => {
                              setClienteSelezionato(opt.value);
                              setOpen(false);
                            }}
                          >
                            {opt.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                clienteSelezionato === opt.value
                                  ? "opacity-100"
                                  : "opacity-0"
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
            <div className="col-span-12 lg:col-span-6">
              <label className="block text-sm font-semibold mb-1">
                Schede Cliente
              </label>
              <Popover
                open={openSchede}
                onOpenChange={setOpenSchede}
                className="w-full"
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSchede}
                    className="w-full justify-between
                    outline-none focus:outline-none focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    ring-offset-background
                    data-[state=openSchede]:ring-2 data-[state=openSchede]:ring-ring data-[state=openSchede]:ring-offset-2"
                  >
                    {clienteSelezionato
                      ? opzioniPianiAllenamento.find(
                          (opt) => opt.value === schedaSelezionata
                        )?.label
                      : "... nessun cliente selezionato"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={4}
                  className="p-0 w-[var(--radix-popover-trigger-width)]"
                >
                  <Command className="p-1">
                    <CommandInput
                      placeholder="Cerca..."
                      className="h-8 focus:ring-1 focus:ring-brand focus:border-brand outline-none focus:outline-none my-2"
                    />
                    <CommandList className="my-1">
                      <CommandEmpty>Nessun risultato</CommandEmpty>
                      <CommandGroup>
                        {opzioniPianiAllenamento.map((opt) => (
                          <CommandItem
                            key={opt.value}
                            // ciò che viene usato per il filtro:
                            value={`${opt.label} ${opt.value}`}
                            onSelect={() => {
                              setSchedaSelezionata(opt.value);
                              setOpenSchede(false);
                            }}
                          >
                            {opt.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                clienteSelezionato === opt.value
                                  ? "opacity-100"
                                  : "opacity-0"
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
            <FormTextarea
              nome="noteAbbonamento"
              label="Note"
              value={formData.noteAbbonamento}
              colspan="col-span-12"
              mdcolspan="lg:col-span-12"
              onchange={handleChange}
              type="text-area"
            />
            {schedaSelezionata ? 
            <div className="col-span-12">
              <div className="flex lg:flex-row flex-col w-full border border-brand p-5 rounded-xl gap-3 overflow-auto">
                <div className="flex flex-col border border-neutral-700 rounded-xl p-3 shadow-lg gap-2">
                  <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border uppercase border-brand px-2 py-1 w-fit rounded-md">
                    DIFFICOLTà SCHEDA
                  </h4>
                  <div className="flex flex-row justify-start items-end">
                    {mediaDifficolta > 0 ? (
                      <>
                        <span className="text-5xl"> {mediaDifficolta} </span>
                        <span className="text-xs text-neutral-500">
                          &ensp;/ media
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col border border-neutral-700 rounded-xl p-3 shadow-lg gap-2">
                  <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border uppercase border-brand px-2 py-1 w-fit rounded-md">
                    NUMERO ESERCIZI
                  </h4>
                  <div className="flex flex-row justify-start items-end">
                    {
                      eserciziSchedaSelezionata.length > 0 ? (
                        <span className="text-5xl">
                          {eserciziSchedaSelezionata.length}
                          <span className="text-xs text-neutral-500">
                            &ensp;/ eserciz*
                          </span>
                        </span>
                      ) : null
                    }
                  </div>
                </div>
                <div className="flex flex-col border border-neutral-700 rounded-xl p-3 shadow-lg gap-2">
                  <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border uppercase border-brand px-2 py-1 w-fit rounded-md">
                    GIORNI DI ALLENAMENTO
                  </h4>
                  <div className="flex flex-row justify-start items-end">
                    {pianoAllenamentoSelezionato ? (
                    <>
                      <span className="text-5xl">
                        {pianoAllenamentoSelezionato.giornate_allenamento}
                      </span><span className="text-xs text-neutral-500">
                      &ensp;/ giorni
                    </span>
                    </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>: null}
            
            <div className="col-span-12 flex justify-end gap-2">
              <button
                form="formSottoscrizioni"
                type="submit"
                disabled={loading}
                className="border border-brand hover:bg-brand text-white px-6 py-1 text-xs rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Salvataggio..." : "Inserisci"}
              </button>
              <button
                type="button"
                onClick={resetFormSottoscrizione}
                className="bg-brand hover:bg-brand/70 text-white px-3 rounded-xl text-xs font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {<VscDebugRestart />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export function FormField({
  colspan,
  mdcolspan,
  nome,
  label,
  value,
  onchange,
  type,
}) {
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
  );
}

export function FormSelect({
  colspan,
  mdcolspan,
  nome,
  label,
  value,
  onchange,
  options = [],
}) {
  const handleValueChange = (val) => {
    onchange?.({ target: { name: nome, value: val } });
  };

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
  );
}

export function FormTextarea({
  colspan,
  mdcolspan,
  nome,
  label,
  value,
  onchange,
  rows = 4,
}) {
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
  );
}
