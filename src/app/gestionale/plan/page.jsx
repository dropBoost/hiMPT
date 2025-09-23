'use client'

import { useState } from "react";

import SottoscrizioniAbbonamenti from "./sottoscrizioneAbbonamento";
import RegistrazionePagamenti from "./registrazionePagamento";
import SituazioneDebitoria from "./situazioneDebitoria";

export default function Customer() {

  const [onDisplaySectionOne, setOnDisplaySectionOne] = useState("on")
  const [onDisplaySectionTwo, setOnDisplaySectionTwo] = useState("off")
  const [onDisplaySectionThree, setOnDisplaySectionThree] = useState("off")

  function ClickSectionOne () {
    setOnDisplaySectionOne("on")
    setOnDisplaySectionTwo("off")
    setOnDisplaySectionThree("off")
  }

  function ClickSectionTwo () {
    setOnDisplaySectionOne("off")
    setOnDisplaySectionTwo("on")
    setOnDisplaySectionThree("off")
  }

  function ClickSectionThree () {
    setOnDisplaySectionOne("off")
    setOnDisplaySectionTwo("off")
    setOnDisplaySectionThree("on")
  }

  return (
    <>
    <div className="flex flex-col h-full w-full justify-center items-center">
      <div className="flex items-start md:justify-start justify-center w-full gap-3 py-3">
        <ButtonSection click={ClickSectionOne} nome="NUOVO ABBONAMENTO" section={onDisplaySectionOne}/>
        <ButtonSection click={ClickSectionTwo} nome="REGISTRAZIONE PAGAMENTI" section={onDisplaySectionTwo}/>
        <ButtonSection click={ClickSectionThree} nome="SITUAZIONE DEBITORIA" section={onDisplaySectionThree}/>
      </div>
      <div className="flex flex-1 justify-start items-start lg:p-5 p-4 pe-3 h-full w-full lg:border lg:rounded-s-2xl lg:rounded-e-sm border-t rounded-none border-brand dark:bg-neutral-800/50 overflow-auto">
        <SottoscrizioniAbbonamenti onDisplay={onDisplaySectionOne}/>
        <RegistrazionePagamenti onDisplay={onDisplaySectionTwo}/>
        <SituazioneDebitoria onDisplay={onDisplaySectionThree}/>
      </div>
    </div>
    </>
  );
}

export function ButtonSection ({section, nome, click}) {

  return (
    <>
    <button
      onClick={click}
      className={`
      flex items-center justify-center text-xs font-bold border rounded-2xl px-3 py-1 
      ${section === "on" ? `text-neutral-100 bg-brand  border-brand` : `text-brand border border-brand`}
      `}
      >{nome}</button>
    </>
  )
}



