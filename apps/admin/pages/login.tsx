import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: any){
    e.preventDefault()
    setErr(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setErr(error.message); return }
    router.push('/')
  }

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input className="w-full border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="text-red-600">{err}</div>}
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Entrar</button>
        </div>
      </form>
    </main>
  )
}
