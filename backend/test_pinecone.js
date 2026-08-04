require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function main() {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  try {
    const response = await pc.inference.embed('multilingual-e5-large', ['test'], { inputType: 'passage', truncate: 'END' });
    console.log(response);
    console.log("Type of response:", typeof response);
    console.log("Is array?", Array.isArray(response));
    if (response.data) {
        console.log("Has data property");
    } else {
        console.log("No data property");
    }
  } catch(e) {
    console.error(e);
  }
}
main();
