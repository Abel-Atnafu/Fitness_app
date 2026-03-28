export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

  try {
    const { image_base64, media_type } = req.body

    if (!image_base64) {
      return res.status(400).json({ error: 'image_base64 is required' })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: media_type || 'image/jpeg',
                  data: image_base64,
                },
              },
              {
                type: 'text',
                text: `Analyze this food image. Identify what food is shown and estimate the nutritional content per serving visible in the image. Be realistic with calorie and macro estimates — use typical restaurant/homemade portion sizes.

Return ONLY a valid JSON object with no additional text, markdown, or formatting:
{"food_name": "string", "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "confidence": "high|medium|low", "notes": "string"}`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({ error: errText })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json\s*|```\s*/g, '').trim()

    const parsed = JSON.parse(clean)
    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
