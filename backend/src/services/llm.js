const { HfInference } = require('@huggingface/inference')

function getTextModel() {
  return process.env.HF_TEXT_MODEL || 'Qwen/Qwen2.5-7B-Instruct'
}

async function generateAnswer({ systemPrompt, userMessage }) {
  const hfToken = process.env.HF_TOKEN

  if (!hfToken) {
    throw new Error('HF_TOKEN is not configured')
  }

  const hf = new HfInference(hfToken)

  try {
    const response = await hf.chatCompletion({
      model: getTextModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 700,
      temperature: 0.2,
      top_p: 0.9,
    })

    const generatedText = response.choices?.[0]?.message?.content

    if (!generatedText) {
      throw new Error('No generated text returned from Hugging Face')
    }

    return generatedText
  } catch (error) {
    const message = error.message || 'Hugging Face text generation failed'
    throw new Error(`Hugging Face API Error: ${message}`)
  }
}

module.exports = {
  generateAnswer,
}
