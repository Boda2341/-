export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ error: 'GEMINI_API_KEY is not configured' })

  const { mode, prompt, context = '' } = request.body || {}
  const system = mode === 'habits'
    ? 'حلل النص العربي وأعد JSON array فقط. كل عنصر يجب أن يحتوي title وtime وcategory، والتصنيف واحد من صحة أو عقل أو بدن. عند طلب الصلوات أعد خمس عادات منفصلة.'
    : `أنت مرشد عادات عربي لطيف وعملي. أجب باختصار وبالعربية. سياق المستخدم: ${context}`
  const body = { contents: [{ parts: [{ text: prompt || '' }] }], systemInstruction: { parts: [{ text: system }] }, generationConfig: mode === 'habits' ? { responseMimeType: 'application/json' } : undefined }

  try {
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await upstream.json()
    if (!upstream.ok) return response.status(upstream.status).json({ error: data.error?.message || 'Gemini error' })
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    if (mode === 'habits') return response.status(200).json(JSON.parse(text.replace(/^```json\s*|\s*```$/g, '')))
    return response.status(200).json({ text })
  } catch (error) { return response.status(500).json({ error: error.message }) }
}
