const { HfInference } = require('@huggingface/inference');

async function test() {
  const hf = new HfInference('test');
  const endpoint = hf.endpoint('Qwen/Qwen2.5-7B-Instruct');
  console.log(endpoint);
}
test();
