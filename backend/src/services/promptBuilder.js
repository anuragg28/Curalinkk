function buildSourcesText(top8) {
  return top8
    .map((result, index) => {
      const abstract = (result.abstract || '').slice(0, 1000)
      const authors = Array.isArray(result.authors) ? result.authors.slice(0, 3).join(', ') : 'Unknown Authors'
      return `[${index + 1}] Title: ${result.title}\nAuthors: ${authors}\nYear: ${result.year}\nPlatform: ${result.source}\nURL: ${result.url || 'None'}\nAbstract snippet: ${abstract}...`
    })
    .join('\n\n---\n\n')
}

/**
 * Build the Source Attribution block directly from real data.
 * The LLM is instructed to copy this block verbatim and only fill in
 * the "Supporting snippet" field — preventing it from inventing metadata.
 */
function buildAttributionTemplate(top8) {
  return top8
    .map((result, index) => {
      const authors = Array.isArray(result.authors) ? result.authors.slice(0, 3).join(', ') : 'Unknown Authors'
      return [
        `[${index + 1}]`,
        `- **Title**: ${result.title}`,
        `  - Authors: ${authors}`,
        `  - Year: ${result.year}`,
        `  - Platform: ${result.source}`,
        `  - URL: ${result.url || 'None'}`,
        `  - Supporting snippet: <copy a direct quote from the abstract above that proves relevance>`,
      ].join('\n')
    })
    .join('\n\n')
}

function buildHistoryText(history) {
  return history
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n')
}

function buildLlmPrompt({ query, top8, history, patientContext }) {
  const sourcesText = buildSourcesText(top8)
  const attributionTemplate = buildAttributionTemplate(top8)
  const historyText = buildHistoryText(history)

  const systemPrompt = [
    'You are a specialized medical research assistant.',
    'STRICT RULE: You must ONLY use information explicitly stated in the RESEARCH SOURCES below.',
    'NEVER infer, extrapolate, or use your training knowledge to fill gaps.',
    'If a source does not directly answer the question, say "The provided sources do not contain sufficient information to answer this question directly." DO NOT guess.',
    'Always cite sources using bracketed numbers [1], [2]. Every factual claim must have a citation.',
    'CRITICAL: In the Source Attribution section, you MUST copy the pre-filled metadata (Title, Authors, Year, Platform, URL) EXACTLY as given. DO NOT change any field. Only fill in the "Supporting snippet".',
    `Patient context: ${JSON.stringify(patientContext)}`,
  ].join(' ')

  const userMessage = [
    'RESEARCH SOURCES:',
    sourcesText,
    '',
    'PREVIOUS CONVERSATION:',
    historyText || 'No prior conversation.',
    '',
    `CURRENT QUESTION: ${query}`,
    '',
    'CRITICAL INSTRUCTION: You MUST structure your response EXACTLY with the following 4 sections. Do not include any other sections.',
    '',
    '1. **Condition Overview**',
    'Provide a brief overview of the patient\'s condition.',
    '',
    '2. **Research Insights**',
    'Summarize findings from the provided publications. Cite heavily using [1], [2].',
    '',
    '3. **Clinical Trials**',
    'Summarize any clinical trials provided. If none are applicable, state that no clinical trials match.',
    '',
    '4. **Source Attribution**',
    'COPY the following block EXACTLY. Only replace the <copy a direct quote...> placeholder with a real quote from the abstract. Do NOT change Title, Authors, Year, Platform, or URL:',
    '',
    attributionTemplate,
  ].join('\n')

  return {
    systemPrompt,
    userMessage,
  }
}

module.exports = {
  buildLlmPrompt,
}

