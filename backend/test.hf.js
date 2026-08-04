const { HfInference } = require('@huggingface/inference');

async function test() {
  const hf = new HfInference(process.env.HF_TOKEN);
  try {
    const out = await hf.chatCompletion({
      model: 'Qwen/Qwen2.5-7B-Instruct',
      messages: [{ role: 'user', content: 'Hello world!' }],
      max_tokens: 10
    });
    console.log('SUCCESS:', out);
  } catch (error) {
    console.error('ERROR:', error);
  }
}
test();
