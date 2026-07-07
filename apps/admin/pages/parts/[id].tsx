import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminPartImages(){
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const [part, setPart] = useState<any>(null)
  const [url, setUrl] = useState('')

  useEffect(()=>{ if (id) fetchPart(id) }, [id])

  async function fetchPart(id:string){
    const res = await fetch(`http://localhost:8080/parts/${id}`)
    const data = await res.json()
    setPart(data)
  }

  async function addImage(){
    if (!url) return
    try{
      const res = await fetch(`http://localhost:8080/parts/${id}/images`, {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ url })
      })
      if (!res.ok) throw new Error('failed')
      setUrl('')
      fetchPart(id as string)
    }catch(err){ console.error(err) }
  }

  async function deleteImage(imageId:number){
    try{
      await fetch(`http://localhost:8080/part_images/${imageId}`, { method: 'DELETE' })
      fetchPart(id as string)
    }catch(err){ console.error(err) }
  }

  if (!part) return <div className="p-8">Carregando...</div>

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin - Imagens da peça {part.name}</h1>

      <div className="mt-4">
        <input className="border p-2 mr-2 w-1/2" value={url} onChange={e=>setUrl(e.target.value)} placeholder="URL da imagem" />
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={addImage}>Adicionar imagem</button>
      </div>

      <ul className="mt-6 space-y-4">
        {part.images && part.images.length ? part.images.map((img:any)=> (
          <li key={img.id} className="border p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={img.url} alt={img.url} className="w-28 h-20 object-contain" />
              <div>{img.url}</div>
            </div>
            <div>
              <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={()=>deleteImage(img.id)}>Remover</button>
            </div>
          </li>
        )) : <li className="text-sm text-gray-500">Nenhuma imagem cadastrada</li>}
      </ul>
    </main>
  )
}
