import { supabase } from "@/lib/supabaseClient"

export async function deleteRowUUID(uuid, tabella, nomeAttributo) {
  const { error } = await supabase
    .from(`${tabella}`)              // nome della tabella
    .delete()                     // operazione di delete
    .eq(`${nomeAttributo}`, uuid)     // condizione per scegliere la riga

  if (error) {
    console.error("Errore durante la cancellazione:", error)
    return false
  }
  
  return true
}