const NLP_API_URL = process.env.REACT_APP_NLP_API_URL || 'http://127.0.0.1:8000';

export async function restructureSentence(text) {
  const response = await fetch(`${NLP_API_URL}/restructure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `NLP service returned ${response.status}`);
  }

  return response.json();
}

export { NLP_API_URL };
