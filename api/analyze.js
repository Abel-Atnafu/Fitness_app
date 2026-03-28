export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })

  try {
    const { image_base64, media_type } = req.body

    if (!image_base64) {
      return res.status(400).json({ error: 'image_base64 is required' })
    }

    const prompt = `Analyze this food image. Identify what food is shown and estimate the nutritional content per serving visible in the image. Be realistic with calorie and macro estimates — use typical restaurant/homemade portion sizes.

You are especially knowledgeable about Ethiopian cuisine. Common Ethiopian foods and their approximate nutrition per serving:
- Injera (1 piece ~150g): 190 cal, 6g protein, 37g carbs, 1g fat
- Doro Wat (1 serving): 320 cal, 28g protein, 12g carbs, 18g fat
- Shiro (1 serving): 280 cal, 14g protein, 35g carbs, 8g fat
- Tibs (1 serving ~150g): 260 cal, 24g protein, 5g carbs, 16g fat
- Kitfo (1 serving ~150g): 335 cal, 22g protein, 2g carbs, 27g fat
- Misir Wat (1 serving): 220 cal, 14g protein, 36g carbs, 3g fat
- Gomen (1 serving): 90 cal, 4g protein, 12g carbs, 4g fat
- Beyaynetu / fasting platter: 750 cal, 28g protein, 110g carbs, 18g fat
- Ful (1 cup): 187 cal, 13g protein, 32g carbs, 1g fat
- Firfir (1 serving): 320 cal, 10g protein, 55g carbs, 7g fat
- Kategna (1 piece): 160 cal, 4g protein, 30g carbs, 3g fat
- Chechebsa (1 serving): 350 cal, 8g protein, 48g carbs, 14g fat

When you see injera (the large grey/beige spongy flatbread), always include it in the estimate alongside any stews or toppings on it.

Return ONLY a valid JSON object with no additional text, markdown, or formatting:
{"food_name": "string", "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "confidence": "high|medium|low", "notes": "string"}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: media_type || 'image/jpeg',
                    data: image_base64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({ error: errText })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const clean = text.replace(/```json\s*|```\s*/g, '').trim()

    const parsed = JSON.parse(clean)
    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
