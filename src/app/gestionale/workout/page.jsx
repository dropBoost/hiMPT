'use client'

import { useState } from "react";

import InserimentoScheda from "./inserimentoScheda";
import AreaWorkout from "./areaWorkout";
import AreaSchede from "./areaSchede";

export default function Workout() {

  const [onDisplaySectionOne, setOnDisplaySectionOne] = useState("on")
  const [onDisplaySectionTwo, setOnDisplaySectionTwo] = useState("off")
  const [onDisplaySectionThree, setOnDisplaySectionThree] = useState("off")
  const [statusEsercizi, setStatusEsercizi] = useState(false)

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
        <ButtonSection click={ClickSectionOne} nome="INSERIMENTO SCHEDA" section={onDisplaySectionOne}/>
        <ButtonSection click={ClickSectionTwo} nome="AREA WORKOUT" section={onDisplaySectionTwo}/>
        <ButtonSection click={ClickSectionThree} nome="AREA SCHEDE" section={onDisplaySectionThree}/>
      </div>
      <div className="flex flex-1 justify-start items-start lg:p-5 p-4 pe-3 h-full w-full lg:border lg:rounded-s-2xl lg:rounded-e-sm border-t rounded-none border-brand dark:bg-neutral-800/50 overflow-hidden">
        <InserimentoScheda onDisplay={onDisplaySectionOne} statusEsercizi={statusEsercizi} setStatusEsercizi={setStatusEsercizi}/>
        <AreaWorkout onDisplay={onDisplaySectionTwo} statusEsercizi={statusEsercizi} setStatusEsercizi={setStatusEsercizi}/>
        <AreaSchede onDisplay={onDisplaySectionThree} statusEsercizi={statusEsercizi}/>
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