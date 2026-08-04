const { Pinecone } = require('@pinecone-database/pinecone');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    console.error('No PINECONE_API_KEY');
    return;
  }
  const pinecone = new Pinecone({ apiKey });
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME || 'medical-index');
  
  const vectors = [{
    id: 'test-1',
    values: new Array(1024).fill(0.1),
    metadata: { test: true }
  }];

  try {
    console.log('Testing .upsert({ records: vectors })...');
    await index.upsert({ records: vectors });
    console.log('SUCCESS with { records: vectors }');
  } catch (e) {
    console.error('FAILED with { records: vectors }:', e.message);
  }

  try {
    console.log('Testing .upsert(vectors)...');
    await index.upsert(vectors);
    console.log('SUCCESS with vectors');
  } catch (e) {
    console.error('FAILED with vectors:', e.message);
  }
}

test();
