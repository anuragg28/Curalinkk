const PUBMED_ESEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
const PUBMED_EFETCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
const OPENALEX_WORKS_URL = 'https://api.openalex.org/works'
const CLINICAL_TRIALS_V2_URL = 'https://clinicaltrials.gov/api/v2/studies'
const CLINICAL_TRIALS_OLD_URL = 'https://clinicaltrials.gov/api/query/study_fields'

function decodeXmlEntities(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function stripXml(value) {
  return decodeXmlEntities(String(value || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function extractFirst(matchString, pattern) {
  const match = matchString.match(pattern)
  return match?.[1] || ''
}

function extractYearFromText(value) {
  const match = String(value || '').match(/(19|20)\d{2}/)
  return match ? Number(match[0]) : new Date().getFullYear()
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function reconstructOpenAlexAbstract(index) {
  if (!index || typeof index !== 'object') return ''

  const tokens = []
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions || []) {
      tokens.push([position, word])
    }
  }

  tokens.sort((a, b) => a[0] - b[0])
  return tokens.map(([, word]) => word).join(' ')
}

function formatAuthorName(author) {
  if (!author) return ''
  if (typeof author === 'string') return author.trim()

  const first = author.fore_name || author.foreName || author.first_name || author.firstName || ''
  const last = author.last_name || author.lastName || author.surname || ''
  const combined = `${last}${first ? ` ${first}` : ''}`.trim()
  return combined || author.name || ''
}

function extractPubMedAuthors(articleXml) {
  const authorBlocks = articleXml.match(/<Author\b[\s\S]*?<\/Author>/g) || []
  const authors = authorBlocks
    .map((block) => {
      const collective = extractFirst(block, /<CollectiveName>([\s\S]*?)<\/CollectiveName>/)
      if (collective) {
        return stripXml(collective)
      }

      const lastName = stripXml(extractFirst(block, /<LastName>([\s\S]*?)<\/LastName>/))
      const foreName = stripXml(extractFirst(block, /<ForeName>([\s\S]*?)<\/ForeName>/))
      const initials = stripXml(extractFirst(block, /<Initials>([\s\S]*?)<\/Initials>/))

      if (lastName && foreName) {
        return `${lastName} ${foreName}`
      }

      if (lastName && initials) {
        return `${lastName} ${initials}`
      }

      return lastName || foreName || ''
    })
    .filter(Boolean)

  return authors
}

function extractPubMedYear(articleXml) {
  const yearMatch =
    articleXml.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>[\s\S]*?<\/PubDate>/) ||
    articleXml.match(/<ArticleDate>[\s\S]*?<Year>(\d{4})<\/Year>[\s\S]*?<\/ArticleDate>/)

  if (yearMatch?.[1]) {
    return Number(yearMatch[1])
  }

  const medlineDate = extractFirst(articleXml, /<MedlineDate>([\s\S]*?)<\/MedlineDate>/)
  if (medlineDate) {
    return extractYearFromText(medlineDate)
  }

  return new Date().getFullYear()
}

function extractPubMedAbstract(articleXml) {
  const sections = [...articleXml.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map(
    (match) => stripXml(match[1]),
  )

  return sections.filter(Boolean).join(' ')
}

function parsePubMedXml(xml) {
  const articles = xml.match(/<PubmedArticle[\s\S]*?<\/PubmedArticle>/g) || []

  return articles
    .map((articleXml) => {
      const pmid = stripXml(extractFirst(articleXml, /<PMID[^>]*>([\s\S]*?)<\/PMID>/))
      const title = stripXml(extractFirst(articleXml, /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/))
      const abstract = extractPubMedAbstract(articleXml) || title
      const authors = extractPubMedAuthors(articleXml)
      const year = extractPubMedYear(articleXml)

      if (!title) {
        return null
      }

      return {
        title,
        abstract,
        authors: authors.length ? authors : ['PubMed record'],
        year,
        source: 'PubMed',
        url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : 'https://pubmed.ncbi.nlm.nih.gov/',
        citationCount: 0,
        status: '',
      }
    })
    .filter(Boolean)
}

function getStudyValue(study, path) {
  return path.split('.').reduce((value, key) => value?.[key], study)
}

function pickClinicalTrialTitle(study) {
  return (
    getStudyValue(study, 'protocolSection.identificationModule.briefTitle') ||
    getStudyValue(study, 'protocolSection.identificationModule.officialTitle') ||
    getStudyValue(study, 'protocolSection.identificationModule.acronym') ||
    getStudyValue(study, 'briefTitle') ||
    getStudyValue(study, 'title') ||
    'Clinical trial'
  )
}

function pickClinicalTrialAbstract(study) {
  // Extract core summary
  const summary = (
    getStudyValue(study, 'protocolSection.descriptionModule.briefSummary') ||
    getStudyValue(study, 'protocolSection.descriptionModule.detailedDescription') ||
    getStudyValue(study, 'descriptionModule.briefSummary') ||
    getStudyValue(study, 'briefSummary') ||
    getStudyValue(study, 'summary') ||
    ''
  )

  // Extract eligibility criteria
  const eligibility = getStudyValue(study, 'protocolSection.eligibilityModule.eligibilityCriteria') || ''

  // Extract location
  const locationsData = getStudyValue(study, 'protocolSection.contactsLocationsModule.locations') || []
  const locationStrings = locationsData.map(loc => {
    return [loc.facility, loc.city, loc.state, loc.country].filter(Boolean).join(', ')
  }).filter(Boolean)
  const locationsStr = locationStrings.length ? `Locations: ${locationStrings.join(' | ')}` : ''

  // Extract contacts
  const centralContacts = getStudyValue(study, 'protocolSection.contactsLocationsModule.centralContacts') || []
  const contactStrings = centralContacts.map(c => {
    return [c.name, c.email, c.phone].filter(Boolean).join(' - ')
  }).filter(Boolean)
  const contactsStr = contactStrings.length ? `Contacts: ${contactStrings.join(' | ')}` : ''

  // Combine
  const parts = [summary, eligibility ? `Eligibility: ${eligibility}` : '', locationsStr, contactsStr]
  return parts.filter(Boolean).join('\n\n')
}

function pickClinicalTrialAuthors(study) {
  const leadSponsor = getStudyValue(study, 'protocolSection.sponsorCollaboratorsModule.leadSponsor.name')
  const overallOfficials = getStudyValue(study, 'protocolSection.contactsLocationsModule.overallOfficials')
  const officials = Array.isArray(overallOfficials)
    ? overallOfficials.map((official) => official?.name).filter(Boolean)
    : []

  const authors = [leadSponsor, ...officials].filter(Boolean)
  return authors.length ? [...new Set(authors)] : ['ClinicalTrials.gov']
}

function pickClinicalTrialYear(study) {
  const date =
    getStudyValue(study, 'protocolSection.statusModule.startDateStruct.date') ||
    getStudyValue(study, 'protocolSection.statusModule.lastUpdatePostDateStruct.date') ||
    getStudyValue(study, 'statusModule.startDateStruct.date') ||
    getStudyValue(study, 'statusModule.lastUpdatePostDateStruct.date') ||
    getStudyValue(study, 'protocolSection.statusModule.startDate') ||
    getStudyValue(study, 'protocolSection.statusModule.lastUpdatePostDate') ||
    ''

  return extractYearFromText(date)
}

function pickClinicalTrialStatus(study) {
  return (
    getStudyValue(study, 'protocolSection.statusModule.overallStatus') ||
    getStudyValue(study, 'statusModule.overallStatus') ||
    getStudyValue(study, 'overallStatus') ||
    ''
  )
}

function pickClinicalTrialId(study) {
  return (
    getStudyValue(study, 'protocolSection.identificationModule.nctId') ||
    getStudyValue(study, 'identificationModule.nctId') ||
    getStudyValue(study, 'nctId') ||
    ''
  )
}

function parseClinicalTrialsV2(payload) {
  const studies = toArray(payload?.studies || payload?.data)

  return studies
    .map((study) => {
      const nctId = pickClinicalTrialId(study)
      const title = pickClinicalTrialTitle(study)
      const abstract = pickClinicalTrialAbstract(study) || title
      const authors = pickClinicalTrialAuthors(study)
      const year = pickClinicalTrialYear(study)
      const status = pickClinicalTrialStatus(study)

      if (!title) {
        return null
      }

      return {
        title,
        abstract,
        authors,
        year,
        source: 'ClinicalTrials',
        url: nctId ? `https://clinicaltrials.gov/study/${nctId}` : 'https://clinicaltrials.gov/',
        citationCount: 0,
        status,
      }
    })
    .filter(Boolean)
}

function parseClinicalTrialsClassic(payload) {
  const rows =
    payload?.StudyFieldsResponse?.StudyFields ||
    payload?.StudyFieldsResponse?.StudyFieldsResponse?.StudyFields ||
    payload?.StudyFields

  const rowList = toArray(rows)

  return rowList
    .map((row) => {
      const title = (row.BriefTitle?.[0] || row.OfficialTitle?.[0] || row.Acronym?.[0] || '').trim()
      const nctId = (row.NCTId?.[0] || '').trim()
      const status = (row.OverallStatus?.[0] || '').trim()
      const year = extractYearFromText(row.LastUpdatePostDate?.[0] || row.StartDate?.[0] || '')
      const eligibility = row.EligibilityCriteria?.[0] ? `Eligibility: ${row.EligibilityCriteria[0]}` : ''
      const locations = row.LocationCity?.map((city, i) => [row.LocationFacility?.[i], city, row.LocationCountry?.[i]].filter(Boolean).join(', ')).filter(Boolean) || []
      const locationsStr = locations.length ? `Locations: ${locations.join(' | ')}` : ''
      const contacts = row.CentralContactName?.map((name, i) => [name, row.CentralContactEMail?.[i], row.CentralContactPhone?.[i]].filter(Boolean).join(' - ')).filter(Boolean) || []
      const contactsStr = contacts.length ? `Contacts: ${contacts.join(' | ')}` : ''

      const abstract = [row.BriefSummary?.[0], row.Condition?.join(', '), row.InterventionName?.join(', '), eligibility, locationsStr, contactsStr]
        .filter(Boolean)
        .join('\n\n')

      if (!title) {
        return null
      }

      return {
        title,
        abstract: abstract || title,
        authors: [row.LeadSponsorName?.[0] || 'ClinicalTrials.gov'].filter(Boolean),
        year,
        source: 'ClinicalTrials',
        url: nctId ? `https://clinicaltrials.gov/study/${nctId}` : 'https://clinicaltrials.gov/',
        citationCount: 0,
        status,
      }
    })
    .filter(Boolean)
}

async function fetchJson(url) {
  const response = await fetch(url)
  const text = await response.text()

  let payload = null
  try {
    payload = JSON.parse(text)
  } catch (_error) {
    payload = null
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || text || `Request failed for ${url}`
    throw new Error(message)
  }

  return payload
}

async function fetchPubMed(searchQuery, fallbackQuery = '') {
  async function runSearch(term) {
    const esearchUrl = new URL(PUBMED_ESEARCH_URL)
    esearchUrl.searchParams.set('db', 'pubmed')
    esearchUrl.searchParams.set('term', term)
    esearchUrl.searchParams.set('retmode', 'json')
    esearchUrl.searchParams.set('retmax', '100')
    esearchUrl.searchParams.set('sort', 'relevance')

    const esearchPayload = await fetchJson(esearchUrl.toString())
    const ids = esearchPayload?.esearchresult?.idlist || []
    if (!ids.length) return []

    const efetchUrl = new URL(PUBMED_EFETCH_URL)
    efetchUrl.searchParams.set('db', 'pubmed')
    efetchUrl.searchParams.set('id', ids.slice(0, 100).join(','))
    efetchUrl.searchParams.set('retmode', 'xml')
    efetchUrl.searchParams.set('rettype', 'abstract')

    const response = await fetch(efetchUrl.toString())
    const xml = await response.text()
    if (!response.ok) throw new Error(`PubMed efetch failed: ${xml || response.statusText}`)
    return parsePubMedXml(xml).slice(0, 100)
  }

  // Primary search with Boolean query
  let results = await runSearch(searchQuery)

  // If primary returns very few results, fall back to a simpler keyword search
  if (results.length < 3 && fallbackQuery && fallbackQuery !== searchQuery) {
    const fallbackResults = await runSearch(fallbackQuery)
    // Merge, deduplicate by title
    const seen = new Set(results.map((r) => r.title))
    for (const r of fallbackResults) {
      if (!seen.has(r.title)) {
        results.push(r)
        seen.add(r.title)
      }
    }
  }

  return results
}


async function fetchOpenAlex(searchQuery) {
  const url = new URL(OPENALEX_WORKS_URL)
  url.searchParams.set('search', searchQuery)
  url.searchParams.set('per-page', '100')
  url.searchParams.set(
    'select',
    [
      'id',
      'display_name',
      'abstract_inverted_index',
      'authorships',
      'publication_year',
      'cited_by_count',
      'primary_location',
      'doi',
    ].join(','),
  )

  const payload = await fetchJson(url.toString())
  const works = payload?.results || []

  return works
    .map((work) => {
      const title = work.display_name || ''
      const abstract = reconstructOpenAlexAbstract(work.abstract_inverted_index) || title
      const authors = (work.authorships || [])
        .map((authorship) => formatAuthorName(authorship?.author))
        .filter(Boolean)
      const urlValue =
        work.doi && typeof work.doi === 'string'
          ? work.doi.startsWith('http')
            ? work.doi
            : `https://doi.org/${work.doi}`
          : work.id || 'https://openalex.org'

      if (!title) {
        return null
      }

      return {
        title,
        abstract,
        authors: authors.length ? authors.slice(0, 8) : ['OpenAlex record'],
        year: work.publication_year || new Date().getFullYear(),
        source: 'OpenAlex',
        url: urlValue,
        citationCount: work.cited_by_count || 0,
        status: '',
      }
    })
    .filter(Boolean)
    .slice(0, 100)
}

async function fetchClinicalTrialsModern(searchQuery, location) {
  const url = new URL(CLINICAL_TRIALS_V2_URL)
  url.searchParams.set('query.term', searchQuery)
  if (location) {
    url.searchParams.set('query.locn', location)
  }
  url.searchParams.set('pageSize', '50')

  const payload = await fetchJson(url.toString())
  return parseClinicalTrialsV2(payload).slice(0, 50)
}

async function fetchClinicalTrialsClassic(searchQuery) {
  const url = new URL(CLINICAL_TRIALS_OLD_URL)
  url.searchParams.set('expr', searchQuery)
  url.searchParams.set(
    'fields',
    [
      'NCTId',
      'BriefTitle',
      'OfficialTitle',
      'Acronym',
      'BriefSummary',
      'Condition',
      'InterventionName',
      'OverallStatus',
      'LastUpdatePostDate',
      'StartDate',
      'LeadSponsorName',
      'EligibilityCriteria',
      'LocationFacility',
      'LocationCity',
      'LocationCountry',
      'CentralContactName',
      'CentralContactEMail',
      'CentralContactPhone',
    ].join(','),
  )
  url.searchParams.set('min_rnk', '1')
  url.searchParams.set('max_rnk', '50')
  url.searchParams.set('fmt', 'json')

  const payload = await fetchJson(url.toString())
  return parseClinicalTrialsClassic(payload).slice(0, 50)
}

async function fetchTrials(searchQuery, location) {
  try {
    const modernResults = await fetchClinicalTrialsModern(searchQuery, location)
    if (modernResults.length) {
      return modernResults
    }
  } catch (_error) {
    // fall back to the classic API shape below
  }

  try {
    return await fetchClinicalTrialsClassic(searchQuery)
  } catch (_error) {
    return []
  }
}

module.exports = {
  fetchPubMed,
  fetchOpenAlex,
  fetchTrials,
}
