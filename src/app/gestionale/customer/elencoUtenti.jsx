'use client'

export default function ElencoUtenti(props) {

  const onDisplay = props.onDisplay

  return (
    <>
      <div className={`${onDisplay === 'on' ? '' : 'hidden'}`}>
        <h1>Elenco UTENTI</h1>
      </div>
    </>
  )
}