import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type Part = any

export default function PartDetail(){
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const [part, setPart] = useState<Part | null>(null)

  useEffect(()=>{ if (id) fetchPart(id) }, [id])

  async function fetchPart(id: string){
    try{
      const res = await fetch(`http://localhost:8080/parts/${id}`)
      if (!res.ok) throw new Error('not found')
      const data = await res.json()
      setPart(data)
    }catch(err){ console.error(err) }
  }

  if (!part) return <div className="p-8">Carregando...</div>

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{part.name} {part.sku ? `(${part.sku})` : ''}</h1>
      <div className="mt-2 text-sm text-gray-600">{part.manufacturer_name} — {part.assembly_name}</div>
      <p className="mt-4">{part.description}</p>

      <section className="mt-6">
        <h2 className="font-semibold">Imagens</h2>
        <div className="mt-2 grid grid-cols-2 gap-4">
          {part.images && part.images.length ? part.images.map((img:any)=> (
            <img key={img.id} src={img.url} alt={`${part.name}-${img.id}`} className="w-full h-48 object-contain border" />
          )) : <div className="text-sm text-gray-500">Sem imagens</div>}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Equivalentes</h2>
        <ul className="mt-2">
          {part.equivalents && part.equivalents.length ? part.equivalents.map((e:any)=> (
            <li key={e.id}>{e.equivalent_name} — {e.note}</li>
          )) : <li className="text-sm text-gray-500">Nenhum equivalente</li>}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Compatibilidades</h2>
        <ul className="mt-2">
          {part.compatibilities && part.compatibilities.length ? part.compatibilities.map((c:any)=> (
            <li key={c.id}>{`Model ID ${c.model_id} - ${c.trim || ''} ${c.engine || ''} — ${c.note || ''}`}</li>
          )) : <li className="text-sm text-gray-500">Nenhuma compatibilidade</li>}
        </ul>
      </section>
    </main>
  )
}
