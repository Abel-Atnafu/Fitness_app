export async function analyzeFood(imageBase64, mediaType = 'image/jpeg') {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: imageBase64,
      media_type: mediaType,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Analysis failed: ${response.status} - ${err}`)
  }

  return response.json()
}
