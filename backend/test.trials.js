const CLINICAL_TRIALS_V2_URL = 'https://clinicaltrials.gov/api/v2/studies'

async function test() {
  const url = new URL(CLINICAL_TRIALS_V2_URL)
  url.searchParams.set('query.term', 'asthma')
  url.searchParams.set('pageSize', '1')

  const response = await fetch(url.toString())
  const payload = await response.json()
  const study = payload.studies[0]

  console.log(JSON.stringify({
    eligibility: study.protocolSection.eligibilityModule,
    contacts: study.protocolSection.contactsLocationsModule,
    status: study.protocolSection.statusModule
  }, null, 2))
}

test()
