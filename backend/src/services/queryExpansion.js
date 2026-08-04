function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function buildPhraseVariants(text) {
  const normalized = normalizeText(text)
  if (!normalized) return []

  const variants = [normalized]
  const lowerText = normalized.toLowerCase()

  const synonymMap = {
    // Neurology
    'deep brain stimulation': ['DBS'],
    dbs: ['deep brain stimulation'],
    "parkinson's disease": ['Parkinson disease', 'PD'],
    'parkinson disease': ["Parkinson's disease", 'PD'],
    pd: ["Parkinson's disease", 'Parkinson disease'],

    // Oncology – Lung
    'non-small cell lung cancer': ['NSCLC', 'non small cell lung carcinoma'],
    'non small cell lung cancer': ['NSCLC', 'non-small cell lung carcinoma'],
    nsclc: ['non-small cell lung cancer', 'non small cell lung carcinoma'],
    'small cell lung cancer': ['SCLC'],
    sclc: ['small cell lung cancer'],
    'lung cancer': ['lung carcinoma', 'pulmonary carcinoma', 'bronchogenic carcinoma'],
    'stage iii nsclc': ['unresectable stage III NSCLC', 'locally advanced NSCLC'],
    'stage 3 nsclc': ['stage III NSCLC', 'locally advanced NSCLC'],

    // Immunotherapy
    immunotherapy: ['immune checkpoint inhibitor', 'ICI', 'PD-1 inhibitor', 'PD-L1 inhibitor'],
    'checkpoint inhibitor': ['immune checkpoint inhibitor', 'ICI'],
    ici: ['immune checkpoint inhibitor', 'checkpoint inhibitor'],
    durvalumab: ['MEDI4736', 'Imfinzi', 'anti-PD-L1'],
    pembrolizumab: ['Keytruda', 'anti-PD-1', 'MK-3475'],
    nivolumab: ['Opdivo', 'anti-PD-1', 'BMS-936558'],
    'pd-l1': ['programmed death ligand 1', 'CD274', 'B7-H1'],
    'pd-1': ['programmed cell death protein 1', 'PDCD1'],
    chemoradiation: ['concurrent chemoradiotherapy', 'CRT', 'chemoradiotherapy', 'CCRT'],

    // Cardiology
    'heart failure': ['HF', 'cardiac failure', 'congestive heart failure', 'CHF'],
    'heart failure with reduced ejection fraction': ['HFrEF', 'systolic heart failure'],
    hfref: ['heart failure with reduced ejection fraction', 'systolic heart failure'],
    'sglt2 inhibitor': ['SGLT2i', 'sodium-glucose cotransporter-2 inhibitor', 'gliflozin'],
    dapagliflozin: ['Farxiga', 'Forxiga', 'BMS-512148'],
    empagliflozin: ['Jardiance', 'BI 10773'],
    'ace inhibitor': ['ACE inhibitor', 'angiotensin converting enzyme inhibitor', 'ACEi'],

    // Endocrinology / Nephrology
    'type 2 diabetes': ['T2DM', 'T2D', 'type II diabetes', 'diabetes mellitus type 2'],
    t2dm: ['type 2 diabetes', 'type II diabetes mellitus'],
    'chronic kidney disease': ['CKD', 'chronic renal disease', 'chronic renal failure'],
    ckd: ['chronic kidney disease', 'chronic renal disease'],
    metformin: ['biguanide', 'glucophage'],
    'egfr': ['estimated glomerular filtration rate', 'renal function'],
  }


  for (const [key, extraVariants] of Object.entries(synonymMap)) {
    if (lowerText.includes(key)) {
      variants.push(...extraVariants)
    }
  }

  return unique(variants)
}

function quoteIfNeeded(value) {
  const normalized = normalizeText(value)
  if (!normalized) return ''

  if (/\s/.test(normalized) || /[()]/.test(normalized)) {
    return `"${normalized}"`
  }

  return normalized
}

function buildBooleanOrClause(terms) {
  const cleanTerms = unique(terms.map(quoteIfNeeded))
  if (!cleanTerms.length) return ''
  if (cleanTerms.length === 1) return cleanTerms[0]
  return `(${cleanTerms.join(' OR ')})`
}

function buildHumanSearchText(...parts) {
  return unique(parts.map(normalizeText)).join(' ')
}

/**
 * Extract known medical keyword variants FROM the query text.
 * Only returns the synonym expansions (not the original question sentence)
 * so PubMed doesn't get a literal long phrase it can never match.
 */
function extractMedicalKeywordsFromQuery(queryText) {
  const lower = queryText.toLowerCase()
  const matched = []

  const keywordMap = {
    // Immunotherapy terms
    immunotherapy: ['immunotherapy', 'immune checkpoint inhibitor', 'ICI'],
    'checkpoint inhibitor': ['immune checkpoint inhibitor', 'checkpoint inhibitor'],
    durvalumab: ['durvalumab', 'MEDI4736'],
    pembrolizumab: ['pembrolizumab', 'Keytruda'],
    nivolumab: ['nivolumab', 'Opdivo'],
    'pd-l1': ['PD-L1', 'programmed death ligand 1'],
    'pd-1': ['PD-1', 'programmed cell death protein 1'],
    chemoradiation: ['chemoradiation', 'chemoradiotherapy', 'concurrent chemoradiotherapy'],
    'overall survival': ['overall survival', 'OS', 'survival benefit'],
    'progression-free': ['progression-free survival', 'PFS'],
    'clinical trial': ['clinical trial', 'randomized controlled trial', 'RCT'],
    'phase iii': ['phase III', 'phase 3'],
    contraindication: ['contraindication', 'safety', 'adverse event'],
    // Cardiology
    'heart failure': ['heart failure', 'HF', 'cardiac failure'],
    dapagliflozin: ['dapagliflozin', 'SGLT2 inhibitor'],
    empagliflozin: ['empagliflozin', 'SGLT2 inhibitor'],
    'ejection fraction': ['ejection fraction', 'HFrEF'],
    // Neurology
    'deep brain stimulation': ['deep brain stimulation', 'DBS'],
    dyskinesia: ['dyskinesia', 'levodopa-induced dyskinesia'],
    levodopa: ['levodopa', 'L-DOPA'],
    // Endocrinology
    metformin: ['metformin'],
    'kidney disease': ['chronic kidney disease', 'CKD'],
    diabetes: ['diabetes mellitus', 'T2DM'],
    'egfr': ['eGFR', 'glomerular filtration rate'],
  }

  for (const [key, terms] of Object.entries(keywordMap)) {
    if (lower.includes(key)) {
      matched.push(...terms)
    }
  }

  return unique(matched)
}

function expandSearchPayload({ query, disease, location, focus }) {
  const cleanedQuery = normalizeText(query)
  const cleanedDisease = normalizeText(disease)
  const cleanedLocation = normalizeText(location)
  const cleanedFocus = normalizeText(focus)

  // For OpenAlex (natural language search), full text is fine
  const queryVariants = buildPhraseVariants(cleanedQuery)
  const diseaseVariants = buildPhraseVariants(cleanedDisease)
  const focusVariants = buildPhraseVariants(cleanedFocus)

  // --- PubMed Boolean query ---
  // Use ONLY extracted keywords + disease synonyms, NOT the full question sentence
  const pubmedQueryKeywords = extractMedicalKeywordsFromQuery(cleanedQuery)

  const publicationQueryParts = []

  // Add query keywords (only synonyms/known terms, never the full sentence)
  if (pubmedQueryKeywords.length) {
    publicationQueryParts.push(buildBooleanOrClause(pubmedQueryKeywords))
  }

  // Add disease variants (already short phrases like "NSCLC", "lung cancer")
  if (diseaseVariants.length) {
    // Exclude extra-long disease phrases that PubMed can't match
    const shortDiseaseVariants = diseaseVariants.filter((v) => v.split(' ').length <= 6)
    if (shortDiseaseVariants.length) {
      publicationQueryParts.push(buildBooleanOrClause(shortDiseaseVariants))
    }
  }

  // Build final queries
  // PubMed: keyword AND disease — short, precise
  const publicationQuery = publicationQueryParts.filter(Boolean).join(' AND ')

  // OpenAlex: natural language, include location + focus
  const openAlexQuery = buildHumanSearchText(
    cleanedQuery,
    cleanedDisease,
    cleanedFocus,
    cleanedLocation,
    ...diseaseVariants.slice(1, 3),
  )

  // ClinicalTrials.gov: plain text
  const trialQuery = buildHumanSearchText(cleanedQuery, cleanedDisease, cleanedLocation, cleanedFocus)

  // Semantic embedding query: query + disease (short)
  const expandedQuery = buildHumanSearchText(cleanedQuery, cleanedDisease)

  return {
    expandedQuery,
    publicationQuery: publicationQuery || expandedQuery,
    openAlexQuery: openAlexQuery || expandedQuery,
    trialQuery: trialQuery || expandedQuery,
    queryVariants,
    diseaseVariants,
    focusVariants,
  }
}


module.exports = {
  expandSearchPayload,
  normalizeText,
}
