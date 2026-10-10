import { useEffect, useRef, useState } from 'react'
type Match = { page: number; text: string }
const policies: Record<string, [string, string[]]> = {
 privacy: ['Privacy policy', ['Shhhh is a free portfolio demonstration. No account, name, email, payment or marketing signup is required.', 'With your permission, uploaded PDF text is processed on the application server to find relevant excerpts. Use only non-sensitive sample documents you are authorised to use. No text is sent to external AI providers.', 'Uploads are not saved to disk. Extracted text stays in server memory for a 30-minute session and is removed on expiry cleanup or server restart. Expired sessions cannot be accessed. Delete document removes your active session immediately. Reloading loses access but does not immediately delete the server session.', 'Session tokens, search results and timer state stay in browser memory. The app uses no cookies, local storage, analytics, advertising or third-party embeds. Hosting providers may process IP addresses and request logs; deployment settings and retention require review.', 'The portfolio owner has not supplied a public privacy contact. Use sample documents only until contact and hosting details are published. Depending on applicable law, rights may include access, correction, deletion, objection and complaints to a privacy regulator.']],
 terms: ['Terms and conditions', ['This is a free portfolio demonstration, with no purchases, subscriptions or accounts.', 'Upload only documents you own or are authorised to process. Do not upload personal, confidential or unlawful material. Do not attempt to access another visitor’s session or overload the service.', 'Results are keyword-matched excerpts, not AI-generated answers or verified advice. Check the original source. No learning outcomes, accuracy or uninterrupted availability are promised.', 'You keep your rights to uploaded material. Processing permission is limited to your current study session. Mandatory legal rights are unaffected.', 'Operator contact, hosting arrangements, audience and applicable jurisdiction must be reviewed before this demo becomes a public service.']],
 cookies: ['Cookie policy', ['This app sets no cookies and uses no local storage, analytics, advertising scripts or third-party embeds. Study state is held in memory and lost on reload.', 'There are no optional trackers to accept or reject, so this version displays no tracking consent banner. Audit the deployed host before launch. If optional tracking or embeds are added, reassess applicable consent requirements and block them until any required consent is obtained.']],
 refunds: ['Refund policy', ['This portfolio demo is free and accepts no payments. There are no charges to refund.', 'Before introducing paid services, publish seller details, prices, cancellation terms, a refund contact and applicable consumer rights. Mandatory consumer rights are unaffected.']],
 about: ['About this demo', ['Shhhh is a personal portfolio project demonstrating PDF search and a focus timer. It is not presented as a registered business or paid service.', 'No operator name, public contact or business address has been supplied. These details have not been invented. Use sample documents for evaluation. Public service launch requires a real operator contact and a review of security, hosting and applicable law.']],
}
const currentPage = () => window.location.hash.slice(1) || 'study'
async function request(path: string, options: RequestInit) {
 const response = await fetch(`/api${path}`, { ...options, signal: AbortSignal.timeout(60000) })
 if (!response.ok) { const error = await response.json().catch(() => null); throw new Error(typeof error?.detail === 'string' ? error.detail : 'Request failed. Check the server and try again.') }
 return response.status === 204 ? null : response.json()
}
export default function App() {
 const [page, setPage] = useState(currentPage)
 const [token, setToken] = useState('')
 const [name, setName] = useState('')
 const [question, setQuestion] = useState('')
 const [matches, setMatches] = useState<Match[]>([])
 const [busy, setBusy] = useState(false)
 const [notice, setNotice] = useState('')
 const [seconds, setSeconds] = useState(1500)
 const [running, setRunning] = useState(false)
 const deadline = useRef(0)
 const heading = useRef<HTMLHeadingElement>(null)
 useEffect(() => { const change = () => { setPage(currentPage()); requestAnimationFrame(() => heading.current?.focus()) }; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change) }, [])
 useEffect(() => { if (!running) return; const id = window.setInterval(() => { const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setSeconds(remaining); if (!remaining) setRunning(false) }, 1000); return () => window.clearInterval(id) }, [running])
 async function upload(event: React.SubmitEvent<HTMLFormElement>) {
  event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const file = data.get('file') as File
  if (file.size > 8 * 1024 * 1024) { setNotice('Choose a PDF smaller than 8 MB.'); return }
  setBusy(true); setNotice('Reading PDF…')
  try { const result = await request('/upload', { method: 'POST', body: data }); setToken(result.token); setName(file.name); setMatches([]); setNotice(`${result.pages} readable pages ready. Session expires in 30 minutes.`); form.reset() }
  catch (error) { setNotice(error instanceof Error ? error.message : 'Upload failed.') } finally { setBusy(false) }
 }
 async function search(event: React.SubmitEvent<HTMLFormElement>) {
  event.preventDefault(); setBusy(true); setNotice('Searching…'); setMatches([])
  try { const result = await request('/ask', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ question }) }); setMatches(result.matches); setNotice(result.matches.length ? 'Search complete.' : 'No matching excerpts. Try a more specific topic.') }
  catch (error) { setNotice(error instanceof Error ? error.message : 'Search failed.') } finally { setBusy(false) }
 }
 async function remove() {
  setBusy(true)
  try { await request('/document', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); setToken(''); setName(''); setQuestion(''); setMatches([]); setNotice('Document session deleted.') }
  catch { setNotice('Deletion could not be confirmed. Try again. The session expires after 30 minutes.') } finally { setBusy(false) }
 }
 const policy = policies[page]
 return <><a className="skip" href="#main">Skip to content</a><header><a className="brand" href="#study" aria-label="Shhhh home">shhhh<span> / a little focus goes a long way</span></a><span className="badge">Free portfolio demo</span></header><main id="main">
 {policy ? <article className="policy"><a href="#study">← Back to study</a><h1 ref={heading} tabIndex={-1}>{policy[0]}</h1><p className="muted">Updated 10 October 2026 · Portfolio demonstration</p>{policy[1].map(p => <p key={p}>{p}</p>)}</article> : <><div className="intro"><p className="eyebrow">YOUR QUIET STUDY SPACE</p><h1 ref={heading} tabIndex={-1}>One page.<br/>One step forward.</h1><p>Find passages in your PDF and make room for a focused study session.</p></div><div className="grid"><section className="card"><p className="eyebrow">01 / YOUR MATERIAL</p><h2>Study your document</h2>
 {!token ? <form onSubmit={upload}><label htmlFor="file">Choose a text-based PDF</label><input id="file" name="file" type="file" accept="application/pdf,.pdf" required aria-describedby="file-help" disabled={busy}/><p id="file-help" className="muted">Up to 8 MB, 150 pages. Scanned PDFs are not supported. Use non-sensitive sample material.</p><label className="check"><input type="checkbox" name="consent" value="true" required disabled={busy}/><span>I have permission to use this document and agree to temporary processing as described in the <a href="#privacy">privacy policy</a>.</span></label><button disabled={busy} type="submit">{busy ? 'Reading PDF…' : 'Upload PDF to study'}</button></form> : <><p className="filename">{name}</p><button className="secondary" disabled={busy} onClick={remove}>Delete document</button><form onSubmit={search}><label htmlFor="question">What topic would you like to find?</label><input id="question" value={question} onChange={e => setQuestion(e.target.value)} minLength={2} maxLength={500} required placeholder="e.g. CSS layout" disabled={busy}/><button disabled={busy} type="submit">{busy ? 'Working…' : 'Find relevant passages'}</button></form></>}
 <p role="status">{notice}</p>{matches.length > 0 && <div><h3>Document excerpts</h3><p className="muted">Keyword matches, not generated answers. Check the original source.</p>{matches.map((m, i) => <blockquote key={i}><p>{m.text}</p><cite>Page {m.page}</cite></blockquote>)}</div>}</section>
 <section className="card timer"><p className="eyebrow">02 / A MOMENT TO FOCUS</p><h2>Your focus session</h2><p>Give one thing your attention.</p><p className="clock" aria-label={`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds remaining`}>{Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}</p><div className="actions"><button disabled={seconds === 0} onClick={() => { if (!running) deadline.current = Date.now() + seconds * 1000; setRunning(!running) }}>{running ? 'Pause timer' : 'Start timer'}</button><button className="secondary" onClick={() => { setRunning(false); setSeconds(1500) }}>Reset timer</button></div><p role="status">{seconds === 0 ? 'Session complete. Take a break.' : running ? 'Focus session in progress.' : 'Ready when you are.'}</p><p className="muted">No sounds, tracking or background animations.</p></section></div></>}
 </main><footer><p>Shhhh · A free portfolio study demo</p><nav aria-label="Information and policies">{Object.entries(policies).map(([key, value]) => <a key={key} href={`#${key}`} aria-current={page === key ? 'page' : undefined}>{value[0]}</a>)}</nav></footer></>
}
