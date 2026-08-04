async function testChat() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    console.log('Sending request to /api/chat...');
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Patient',
        disease: 'Stage III NSCLC',
        location: 'Mumbai',
        focus: 'Treatments & therapies',
        query: 'What are the latest immunotherapy options?'
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const data = await res.json();
    
    if (res.ok) {
      console.log('SUCCESS:', JSON.stringify(data, null, 2).slice(0, 500) + '...');
    } else {
      console.error('SERVER ERROR (500):', data);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('FETCH ERROR: Request timed out after 60s');
    } else {
      console.error('FETCH ERROR:', err.message);
    }
  }
}

testChat();
