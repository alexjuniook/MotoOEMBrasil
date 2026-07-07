import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AdminPartImages(){
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const [part, setPart] = useState<any>(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ if (id) init(id) }, [id])

  async function init(id:string){
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    fetchPart(id)
  }

  async function fetchPart(id:string){
    const res = await fetch(`http://localhost:8080/parts/${id}`)
    const data = await res.json()
    setPart(data)
    setLoading(false)
  }

  const [file, setFile] = useState<File | null>(null)

  async function addImage(){
    try{
      // if a file is selected, upload multipart
      if (file) {
        const session = await supabase.auth.getSession();
        const token = session?.data?.session?.access_token;
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`http://localhost:8080/parts/${id}/upload`, {
          method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {}, body: fd
        });
        if (!res.ok) throw new Error('upload failed')
        setFile(null)
        fetchPart(id as string)
        return
      }

      // fallback to URL-based add
      if (!url) return
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
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      await fetch(`http://localhost:8080/part_images/${imageId}`, { method: 'DELETE', headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
      fetchPart(id as string)
    }catch(err){ console.error(err) }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin - Imagens da peça {part.name}</h1>

      <div className="mt-4 flex gap-4 items-center">
        <input className="border p-2" type="file" onChange={(e:any)=> setFile(e.target.files?.[0] || null)} />
        <input className="border p-2 mr-2 w-1/2" value={url} onChange={e=>setUrl(e.target.value)} placeholder="URL da imagem (fallback)" />
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
