/**
 * PRIVDATA — private-data / identity-enrichment API registry for OpenCode (V2).
 *
 * The operator supplies API keys for identity, phone, email, IP and enrichment
 * services. This plugin stores the registry + keys, exposes the APIs as tools so
 * the agent can call them, merges multi-source results into one dossier, and
 * persists raw responses as evidence.
 *
 * Storage: ~/.raptor/apis.json   (mode 0600)
 */

import { execFileSync } from "node:child_process"
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

type Json = any

const BASE = join(homedir(), ".raptor")
const STORE = join(BASE, "apis.json")

/* ------------------------------------------------------------------ registry */

const BUILTIN: Json[] = [
  /* ---------------- phone ---------------- */
  { id: "hikerapi_phone", name: "HikerAPI — phone to full profile", category: "phone", method: "GET",
    url: "https://api.hikerapi.com/v2/user/by/id?id={phone}", params: ["phone"], auth: "header",
    headers: { accept: "application/json", "x-access-key": "{key}" },
    fields: ["name", "gender", "age", "country", "state", "city", "pincode", "address", "email", "carrier", "line_type", "sim"],
    notes: "Returns name, gender, location, carrier, email for an Indian mobile number." },
  { id: "hikerapi_username", name: "HikerAPI — username to profile", category: "phone", method: "GET",
    url: "https://api.hikerapi.com/v2/user/by/username?username={username}", params: ["username"], auth: "header",
    headers: { accept: "application/json", "x-access-key": "{key}" },
    notes: "Username lookup on the same provider." },
  { id: "numverify", name: "NumVerify / apilayer — phone validation", category: "phone", method: "GET",
    url: "https://api.apilayer.com/validate/phone?api_key={key}&phone={phone}", params: ["phone"], auth: "query",
    fields: ["valid", "country_code", "country_name", "location", "carrier", "line_type"],
    notes: "Validity, carrier, line type, location." },
  { id: "abstractapi_phone", name: "AbstractAPI — phone validation", category: "phone", method: "GET",
    url: "https://phoneenquiry.p.rapidapi.com/phone?api_key={key}&phoneNumber={phone}", params: ["phone"], auth: "query",
    notes: "RapidAPI variant. Needs x-rapidapi-key + x-rapidapi-host headers." },
  { id: "veriphone", name: "Veriphone — phone intelligence", category: "phone", method: "GET",
    url: "https://api.veriphone.io/v2/validate?api_key={key}&phone={phone}", params: ["phone"], auth: "query",
    fields: ["phone_number", "country", "location", "carrier", "line_type", "status"] },
  { id: "melissa_phone", name: "Melissa — phone reverse lookup", category: "phone", method: "GET",
    url: "https://api.melissa.com/v2/phone?key={key}&phone={phone}", params: ["phone"], auth: "query",
    fields: ["phone", "name", "address", "ip_address"], notes: "Name + address from a phone number." },
  { id: "twilio_lookup", name: "Twilio Lookup — carrier & line type", category: "phone", method: "GET",
    url: "https://lookup.twilio.com/v2/PhoneNumbers/{phone}", params: ["phone"], auth: "basic",
    fields: ["caller_name", "country_code", "phone_number", "carrier", "line_type_intelligence", "sim_swap"] },
  { id: "telnyx_lookup", name: "Telnyx Lookup — caller name", category: "phone", method: "GET",
    url: "https://lookup.telnyx.com/v2/phone_numbers/{phone}", params: ["phone"], auth: "bearer",
    fields: ["caller_name", "carrier_name", "line_type", "valid_number"] },

  /* ---------------- email ---------------- */
  { id: "emailrep", name: "EmailRep — email reputation & presence", category: "email", method: "GET",
    url: "https://emailrep.io/{email}?key={key}", params: ["email"], auth: "query",
    fields: ["reputation", "details", "blacklisted", "details.profiles", "details.suspicious_email"], notes: "Needs an EmailRep API key now (unauthenticated disabled). Checks social-profile presence and breach flags." },
  { id: "zerobounce", name: "ZeroBounce — email validation", category: "email", method: "GET",
    url: "https://api.zerobounce.net/v2/validate?api_key={key}&email={email}", params: ["email"], auth: "query",
    fields: ["status", "sub_status", "country", "city", "free_email", "did_you_mean"] },
  { id: "neverbounce", name: "NeverBounce — email validation", category: "email", method: "GET",
    url: "https://api.neverbounce.com/v2/validate/email?api_key={key}&email={email}", params: ["email"], auth: "query",
    fields: ["status", "reason", "is_disposable", "accept_all"] },
  { id: "apilayer_email", name: "apilayer — email validation", category: "email", method: "GET",
    url: "https://api.apilayer.com/email_validation?api_key={key}&email={email}", params: ["email"], auth: "query",
    fields: ["valid", "deliverability", "is_disposable", "country", "region"] },
  { id: "hibp_account", name: "HaveIBeenPwned — breach presence", category: "email", method: "GET",
    url: "https://haveibeenpwned.com/api/v3/breachedaccount/{email}?truncateResponse=false", params: ["email"], auth: "header",
    headers: { accept: "application/json", "hibp-api-key": "{key}" },
    fields: ["Name", "BreachDate", "DataClasses"] },
  { id: "dehashed", name: "DeHashed — email in breach corpora", category: "email", method: "GET",
    url: "https://api.dehashed.com/search?query=email:{email}&api_key={key}", params: ["email"], auth: "query",
    notes: "Returns matched records. Use the operator's own licensed account." },
  { id: "intelx", name: "IntelligenceX — phone/email/domain records", category: "email", method: "GET",
    url: "https://2.intelx.io/phonebook/search?query={query}&api_key={key}", params: ["query"], auth: "query",
    fields: ["phone", "email", "name", "domain"] },

  /* ---------------- ip / geo ---------------- */
  { id: "ipinfo", name: "ipinfo.io — IP & ASN", category: "ip", method: "GET",
    url: "https://ipinfo.io/{ip}/json?token={key}", params: ["ip"], auth: "query",
    fields: ["ip", "city", "region", "country", "loc", "org", "postal", "timezone", "hostname"] },
  { id: "ipwhois", name: "ipwho.is — IP geolocation", category: "ip", method: "GET",
    url: "https://ipwho.is/{ip}", params: ["ip"], auth: "none",
    fields: ["success", "ip", "city", "region", "country", "connection", "timezone"] },
  { id: "ipapi_co", name: "ipapi.co — IP geolocation", category: "ip", method: "GET",
    url: "https://ipapi.co/{ip}/json/", params: ["ip"], auth: "none",
    fields: ["ip", "city", "region", "country_name", "latitude", "longitude", "org", "asn"] },
  { id: "ip_api_com", name: "ip-api.com — IP geolocation", category: "ip", method: "GET",
    url: "http://ip-api.com/json/{ip}?fields=status,message,continent,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,reverse,query", params: ["ip"], auth: "none",
    fields: ["country", "city", "isp", "as", "reverse"] },
  { id: "abstractapi_ip", name: "AbstractAPI — IP geolocation", category: "ip", method: "GET",
    url: "https://ipgeolocation.abstractapi.com/v1/?api_key={key}&ip_address={ip}", params: ["ip"], auth: "query",
    fields: ["ip", "city", "region", "country", "latitude", "longitude", "timezone", "asn"] },
  { id: "ipqualityscore", name: "IPQualityScore — proxy / fraud flags", category: "ip", method: "GET",
    url: "https://ipqualityscore.com/api/json/ip/{key}/{ip}", params: ["ip"], auth: "query",
    fields: ["fraud_score", "proxy", "vpn", "tor", "active_vpn", "recent_abuse", "country"] },
  { id: "criminalip", name: "CriminalIP — IP intelligence", category: "ip", method: "GET",
    url: "https://api.criminalip.io/v1/banner?api_key={key}&query={ip}", params: ["ip"], auth: "query",
    fields: ["ip", "is_vpn", "is_proxy", "is_tor", "country_code"] },
  { id: "shodan_host", name: "Shodan — host services & vulns", category: "ip", method: "GET",
    url: "https://api.shodan.io/shodan/host/{ip}?key={key}", params: ["ip"], auth: "query",
    fields: ["ports", "vulns", "hostnames", "org", "isp", "os", "country_name"] },
  { id: "censys_host", name: "Censys — host services", category: "ip", method: "GET",
    url: "https://search.censys.io/api/v2/hosts/{ip}", params: ["ip"], auth: "basic",
    fields: ["services", "location", "autonomous_system"] },
  { id: "virustotal_ip", name: "VirusTotal — IP reputation", category: "ip", method: "GET",
    url: "https://www.virustotal.com/api/v3/ip_addresses/{ip}", params: ["ip"], auth: "header",
    headers: { "x-apikey": "{key}", accept: "application/json" },
    fields: ["last_analysis_stats", "country", "as_owner"] },
  { id: "otx_ip", name: "AlienVault OTX — IP pulses", category: "ip", method: "GET",
    url: "https://otx.alienvault.com/api/v1/indicators/IPv4/{ip}/general", params: ["ip"], auth: "none",
    fields: ["pulse_info", "reputation"] },

  /* ---------------- geo ---------------- */
  { id: "opencage", name: "OpenCage — forward geocoding", category: "geo", method: "GET",
    url: "https://api.opencagedata.com/geocode/v1/json?q={q}&key={key}", params: ["q"], auth: "query",
    fields: ["results.lat", "results.lng", "results.components", "results.formatted"] },
  { id: "geocode_maps_co", name: "geocode.maps.co — geocoding", category: "geo", method: "GET",
    url: "https://geocode.maps.co/search?q={q}&api_key={key}", params: ["q"], auth: "query",
    fields: ["lat", "lon", "address", "type"] },
  { id: "google_geocode", name: "Google Geocoding — address to coords", category: "geo", method: "GET",
    url: "https://maps.googleapis.com/maps/api/geocode/json?address={q}&key={key}", params: ["q"], auth: "query",
    fields: ["results.geometry.location", "results.formatted_address"] },

  /* ---------------- domain / infra / breach ---------------- */
  { id: "hunter_domain", name: "Hunter.io — corporate email finder", category: "domain", method: "GET",
    url: "https://api.hunter.io/v2/domain-search?domain={domain}&api_key={key}", params: ["domain"], auth: "query",
    fields: ["data.email", "data.pattern", "data.emails"], notes: "Also gives the org's email naming pattern." },
  { id: "clearbit", name: "Clearbit — company enrichment", category: "domain", method: "GET",
    url: "https://company.clearbit.com/v2/companies/find?domain={domain}&key={key}", params: ["domain"], auth: "query",
    fields: ["name", "description", "metrics", "tech"] },
  { id: "whoisxml", name: "WhoisXML — whois & history", category: "domain", method: "GET",
    url: "https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey={key}&domainName={domain}&outputFormat=JSON", params: ["domain"], auth: "query",
    fields: ["WhoisRecord", "DomainName"] },
  { id: "securitytrails", name: "SecurityTrails — subdomain history", category: "domain", method: "GET",
    url: "https://api.securitytrails.com/v1/domain/{domain}/subdomains", params: ["domain"], auth: "header",
    headers: { accept: "application/json", key: "{key}" },
    fields: ["subdomains"] },
  { id: "hibp_pwrange", name: "HaveIBeenPwned — password range (k-anonymity)", category: "breach", method: "GET",
    url: "https://api.pwnedpasswords.com/range/{prefix}", params: ["prefix"], auth: "none",
    notes: "Feed the first 5 chars of the hash. Response is the suffix list — matches are computed locally." },
  { id: "otx_domain", name: "AlienVault OTX — domain pulses", category: "domain", method: "GET",
    url: "https://otx.alienvault.com/api/v1/indicators/domain/{domain}/general", params: ["domain"], auth: "none",
    fields: ["pulse_info", "reputation"] },

  /* ---------------- people / search ---------------- */
  { id: "serpapi", name: "SerpAPI — search-engine intelligence", category: "person", method: "GET",
    url: "https://serpapi.com/search.json?api_key={key}&q={q}", params: ["q"], auth: "query",
    fields: ["organic_results", "knowledge_graph"], notes: "Use for people/dork searches." },
  { id: "google_cse", name: "Google Custom Search — dorking", category: "person", method: "GET",
    url: "https://www.googleapis.com/customsearch/v1?key={key}&cx={cx}&q={q}", params: ["q", "cx"], auth: "query",
    fields: ["items", "searchInformation"] },
  { id: "telegram_check", name: "Telegram — public profile check", category: "person", method: "GET",
    url: "https://t.me/{username}", params: ["username"], auth: "none", raw: "text",
    notes: "Unauthenticated profile read: existence, display name, bio, subscriber count." },
]

/* ------------------------------------------------------------------- store */

function ensureStore(): Json {
  if (!existsSync(BASE)) mkdirSync(BASE, { recursive: true })
  if (!existsSync(STORE)) {
    const seed = { version: 1, apis: BUILTIN, keys: {}, custom: [] }
    writeFileSync(STORE, JSON.stringify(seed, null, 1))
    try { chmodSync(STORE, 0o600) } catch {}
  }
  return loadStore()
}

function loadStore(): Json {
  try {
    return JSON.parse(readFileSync(STORE, "utf8"))
  } catch {
    return { version: 1, apis: BUILTIN, keys: {}, custom: [] }
  }
}

function saveStore(s: Json) {
  writeFileSync(STORE, JSON.stringify(s, null, 1))
  try { chmodSync(STORE, 0o600) } catch {}
}

function allApis(store: Json): Json[] {
  return [...(store.apis || []), ...(store.custom || [])]
}

function findApi(store: Json, id: string): Json | undefined {
  const q = id.toLowerCase().trim()
  return allApis(store).find((a) => a.id === q || a.id.toLowerCase() === q || (a.name || "").toLowerCase().includes(q))
}

/** key lookup: exact id first, then the provider family prefix (hikerapi_phone -> hikerapi) */
function keyFor(store: Json, api: Json): string {
  const keys = store.keys || {}
  if (keys[api.id]) return keys[api.id]
  const family = String(api.id).split("_")[0]
  return keys[family] || ""
}

/* --------------------------------------------------------------- calling */

function fill(tpl: string, params: Json, key: string): string {
  return tpl.replace(/\{(\w+)\}/g, (_m, k) => {
    if (k === "key") return encodeURIComponent(key || "")
    const v = params[k]
    if (v === undefined || v === null || v === "") throw new Error(`missing parameter '${k}'`)
    return encodeURIComponent(String(v))
  })
}

async function callApi(store: Json, api: Json, params: Json): Promise<Json> {
  const key = keyFor(store, api)
  const method = (api.method || "GET").toUpperCase()
  let url = fill(api.url, params, key)
  const headers: Json = {}
  for (const [h, v] of Object.entries(api.headers || {})) {
    headers[h] = String(v).replace(/\{key\}/g, key || "")
  }
  let body: string | undefined
  if (method !== "GET" && method !== "HEAD") {
    body = JSON.stringify(params.body || {})
    headers["content-type"] = headers["content-type"] || "application/json"
  }
  if (api.auth === "bearer") headers["authorization"] = `Bearer ${key}`
  if (api.auth === "basic") {
    const [u, p] = key.includes(":") ? key.split(":") : [key, ""]
    headers["authorization"] = "Basic " + Buffer.from(`${u}:${p}`).toString("base64")
  }
  if (!key && api.auth !== "none" && api.auth !== "query") {
    // header-key APIs still work without a key if the provider allows it
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 30000)
  try {
    const res = await fetch(url, { method, headers, body, signal: ctrl.signal })
    const text = await res.text()
    let parsed: Json = text
    if (api.raw !== "text") {
      try { parsed = JSON.parse(text) } catch { parsed = text }
    }
    const out: Json = {
      ok: res.ok,
      status: res.status,
      api: api.id,
      name: api.name,
      url: url.replace(/([?&](?:api_?key|key|token|hibp-api-key|x-access-key|access_key)=)[^&]+/gi, "$1***"),
      data: parsed,
    }
    if (res.ok && parsed && typeof parsed === "object" && api.fields?.length) {
      out.fields = api.fields
        .map((f: string) => ({ path: f, value: pick(parsed, f) }))
        .filter((x: Json) => x.value !== undefined && x.value !== null && x.value !== "")
    }
    return out
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e), api: api.id, name: api.name, url }
  } finally {
    clearTimeout(timer)
  }
}

/** pull a dotted path out of a response */
function pick(obj: Json, path: string): Json {
  return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
}

/* ------------------------------------------------------------- engagement */

function workspaceDir(): string {
  try {
    const p = join(BASE, "active")
    if (existsSync(p)) {
      const d = readFileSync(p, "utf8").trim()
      if (d && existsSync(join(d, "state.json"))) return d
    }
  } catch {}
  return ""
}

function saveEvidence(name: string, payload: Json): string {
  const dir = workspaceDir()
  if (!dir) return ""
  const ev = join(dir, "evidence", "privdata")
  try {
    mkdirSync(ev, { recursive: true })
    const f = join(ev, `${name}-${Date.now()}.json`)
    writeFileSync(f, JSON.stringify(payload, null, 2))
    return f
  } catch {
    return ""
  }
}

/* --------------------------------------------------------------- the tools */

function listApis(category: string): Json {
  const store = ensureStore()
  const cat = category.toLowerCase().trim()
  const rows = allApis(store)
    .filter((a) => !cat || (a.category || "").toLowerCase() === cat || (a.category || "").toLowerCase().includes(cat))
    .map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      params: a.params || [],
      auth: a.auth || "query",
      key_set: Boolean(keyFor(store, a)),
      url: a.url,
      notes: a.notes || "",
    }))
  const cats: Json = {}
  for (const a of allApis(store)) cats[a.category] = (cats[a.category] || 0) + 1
  return {
    ok: true,
    store: STORE,
    total: rows.length,
    configured: rows.filter((r: Json) => r.key_set).length,
    categories: cats,
    apis: rows,
    next: rows.length ? "privdata_call(api=<id>, params={...}) to run one" : "privdata_key(api=<id>, key=...) to add a key",
  }
}

function setKey(input: Json): Json {
  const store = ensureStore()
  const id = (input.api || "").toLowerCase().trim()
  let api = findApi(store, id)
  if (!api) {
    // create a custom entry so unknown providers still work
    api = {
      id,
      name: input.name || id,
      category: input.category || "custom",
      method: input.method || "GET",
      url: input.url || "",
      params: input.params || [],
      auth: input.auth || "header",
      headers: input.headers || { "x-access-key": "{key}" },
    }
    store.custom = store.custom || []
    store.custom.push(api)
    ensureStore()
    const s2 = loadStore()
    s2.custom = store.custom
    saveStore(s2)
    store.keys = store.keys || {}
    store.keys[id] = input.key || ""
    saveStore(store)
    return { ok: true, added: true, api: id, key_set: true, note: "custom API registered and key stored" }
  }
  store.keys = store.keys || {}
  if (input.key === "" || input.key === null) {
    delete store.keys[api.id]
    const fam = String(api.id).split("_")[0]
    if (fam !== api.id) delete store.keys[fam]
  } else {
    // store under the exact id AND the provider family, so one key serves every variant
    store.keys[api.id] = input.key
    const fam = String(api.id).split("_")[0]
    if (fam !== api.id) store.keys[fam] = input.key
  }
  saveStore(store)
  return { ok: true, api: api.id, name: api.name, key_set: Boolean(store.keys[api.id]), store: STORE }
}

async function callOne(input: Json): Promise<Json> {
  const store = ensureStore()
  const api = findApi(store, input.api || "")
  if (!api) {
    return {
      ok: false,
      error: `unknown api '${input.api}'`,
      hint: "privdata_apis() lists every registered id",
    }
  }
  const res = await callApi(store, api, input.params || {})
  if (res.ok && input.save !== false) {
    const f = saveEvidence(api.id, res)
    if (f) res.evidence = f
  }
  return res
}

/** guess what kind of identifier we were handed */
function identifierType(v: string): string {
  const s = v.trim()
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) return "email"
  if (/^\+?\d[\d\s-]{7,15}$/.test(s)) return "phone"
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(s)) return "ip"
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(s)) return "domain"
  if (/^@?\w[\w.-]*$/.test(s)) return "username"
  return "text"
}

async function searchAll(input: Json): Promise<Json> {
  const store = ensureStore()
  const ident = (input.identifier || "").trim()
  if (!ident) return { ok: false, error: "identifier required (phone / email / ip / domain / username)" }
  const kind = input.type || identifierType(ident)
  const limit = input.limit || 12

  const candidates = allApis(store).filter((a) => {
    if (input.only) return a.id === input.only
    const p = (a.params || []).map((x: Json) => String(x).toLowerCase())
    const wants =
      kind === "phone" ? p.includes("phone") :
      kind === "email" ? p.includes("email") :
      kind === "ip" ? p.includes("ip") :
      kind === "domain" ? p.includes("domain") :
      kind === "username" ? p.includes("username") :
      p.includes("q") || p.includes("query")
    return wants
  }).filter((a) => (store.keys || {})[a.id] || (a.auth === "none"))

  const paramKey =
    kind === "phone" ? "phone" :
    kind === "email" ? "email" :
    kind === "ip" ? "ip" :
    kind === "domain" ? "domain" :
    kind === "username" ? "username" : "q"

  const results: Json[] = []
  for (const api of candidates.slice(0, limit)) {
    const params: Json = { [paramKey]: ident }
    if (api.params?.includes("q")) params.q = ident
    if (api.params?.includes("query")) params.query = ident
    const r = await callApi(store, api, params)
    results.push({
      api: api.id,
      name: api.name,
      ok: r.ok,
      status: r.status,
      error: r.error,
      fields: r.fields,
      data: r.ok && r.data && typeof r.data === "object" ? r.data : r.data,
    })
  }

  // merged view
  const merged: Json = {}
  const provenance: Json = []
  for (const r of results) {
    if (!r.ok || !r.fields) continue
    for (const f of r.fields) {
      if (f.value === null || f.value === undefined || f.value === "") continue
      const key = String(f.path).split(".").pop()
      if (merged[key] === undefined) {
        merged[key] = f.value
        provenance.push({ field: key, value: f.value, source: r.api })
      }
    }
  }

  const f = saveEvidence(`search-${kind}-${ident}`, { identifier: ident, type: kind, merged, provenance, results })
  return {
    ok: true,
    identifier: ident,
    type: kind,
    apis_tried: candidates.length,
    successful: results.filter((r) => r.ok).length,
    merged,
    provenance,
    per_api: results.map((r) => ({ api: r.api, ok: r.ok, status: r.status, error: r.error })),
    evidence: f,
    next: "privdata_save(data=<the merged object>, label='<what this is>') to record it on the engagement",
  }
}

function saveResult(input: Json): Json {
  const dir = workspaceDir()
  if (!dir) return { ok: false, error: "no active engagement. Call raptor_engage first." }
  const label = input.label || "private-data result"
  const payload = input.data || {}
  const f = join(dir, "evidence", `privdata-${Date.now()}.json`)
  try {
    mkdirSync(join(dir, "evidence"), { recursive: true })
    writeFileSync(f, JSON.stringify({ label, saved_at: new Date().toISOString(), data: payload }, null, 2))
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
  try {
    appendFileSync(join(dir, "notes.md"), `\n## ${label}\n${JSON.stringify(payload, null, 2)}\n`)
  } catch {}
  return { ok: true, saved: f, label }
}

/* ----------------------------------------------------------------- plugin */

export default {
  id: "privdata",
  async setup(ctx: Json) {
    ensureStore()

    // tell the raptor agent which data sources are live
    await ctx.session.hook("context", (event: Json) => {
      if (event.agent !== "raptor") return
      const store = loadStore()
      const live = allApis(store)
        .filter((a) => (store.keys || {})[a.id])
        .map((a) => `${a.id} (${a.category})`)
      if (!live.length) return
      event.system.push({
        type: "text",
        text:
          `<privdata-sources>` +
          `configured private-data APIs: ${live.join(", ")}` +
          `\nuse privdata_call(api=<id>, params={...}) for one, or privdata_search(identifier=...) to fan out.` +
          `\n</privdata-sources>`,
      })
    })

    await ctx.tool.transform((editor: Json) => {
      editor.namespace({
        name: "privdata",
        description:
          "Private-data and identity-enrichment APIs — phone reverse lookup, email validation and breach exposure, IP geolocation and fraud flags, domain/company enrichment, people search. Registry + keys are stored so the same sources are reused every run.",
      })

      editor.add({
        name: "apis",
        description: "List every registered private-data API with its category, parameters and whether a key is configured. Also lists the categories available.",
        input: {
          type: "object",
          properties: { category: { type: "string", description: "phone | email | ip | geo | domain | breach | person | custom" } },
          additionalProperties: false,
        },
        options: { namespace: "privdata", codemode: true },
        execute: async (input: Json) => ({ content: JSON.stringify(listApis(input.category || ""), null, 2) }),
      })

      editor.add({
        name: "key",
        description:
          "Store (or clear) the API key for a registered API. The key is persisted so it is reused in later runs. Pass a name/url/params for a provider that is not registered yet and it will be added as a custom API.",
        input: {
          type: "object",
          properties: {
            api: { type: "string", description: "api id, or any substring of its name" },
            key: { type: "string", description: "the key/token. Pass empty string to clear it." },
            name: { type: "string", description: "display name (custom APIs)" },
            url: { type: "string", description: "url template with {param} placeholders (custom APIs)" },
            method: { type: "string", enum: ["GET", "POST", "PUT"] },
            params: { type: "array", items: { type: "string" }, description: "parameter names the api accepts" },
            category: { type: "string" },
            auth: { type: "string", enum: ["query", "header", "bearer", "basic", "none"], description: "how the key is sent" },
            headers: { type: "object", description: "extra headers for a custom api; use {key} for the key" },
          },
          required: ["api"],
          additionalProperties: false,
        },
        options: { namespace: "privdata", codemode: true },
        execute: async (input: Json) => ({ content: JSON.stringify(setKey(input), null, 2) }),
      })

      editor.add({
        name: "call",
        description:
          "Call one registered API and get the parsed result plus the interesting projected fields. Parameters are filled into the URL template ({phone}, {email}, {ip}, {domain}, {username}, {q}). The raw response is saved as evidence in the active engagement.",
        input: {
          type: "object",
          properties: {
            api: { type: "string", description: "api id, e.g. hikerapi_phone, emailrep, ipwhois" },
            params: { type: "object", description: "e.g. {\"phone\": \"9876543210\"}" },
            save: { type: "boolean", description: "save the raw response as evidence (default true)" },
          },
          required: ["api"],
          additionalProperties: false,
        },
        options: { namespace: "privdata", codemode: true },
        execute: async (input: Json) => ({ content: JSON.stringify(await callOne(input), null, 2) }),
      })

      editor.add({
        name: "search",
        description:
          "Fan out across every configured API that accepts the given identifier (phone, email, IP, domain or username) and return a merged dossier with per-field provenance. This is the fastest way to enrich a subject.",
        input: {
          type: "object",
          properties: {
            identifier: { type: "string", description: "phone / email / IP / domain / username" },
            type: { type: "string", description: "force the type: phone|email|ip|domain|username|text" },
            only: { type: "string", description: "restrict to a single api id" },
            limit: { type: "number", description: "max APIs to fan out to (default 12)" },
          },
          required: ["identifier"],
          additionalProperties: false,
        },
        options: { namespace: "privdata", codemode: true },
        execute: async (input: Json) => ({ content: JSON.stringify(await searchAll(input), null, 2) }),
      })

      editor.add({
        name: "save",
        description: "Persist a private-data result into the active engagement workspace (evidence + notes) so it is part of the report.",
        input: {
          type: "object",
          properties: {
            label: { type: "string", description: "what this result is" },
            data: { type: "object", description: "the payload to persist" },
          },
          required: ["data"],
          additionalProperties: false,
        },
        options: { namespace: "privdata", codemode: true },
        execute: async (input: Json) => ({ content: JSON.stringify(saveResult(input), null, 2) }),
      })
    })

    return () => {}
  },
}
