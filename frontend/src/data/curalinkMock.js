export const appCopy = {
  sidebar: {
    brand: 'Curalink',
    tagline: 'AI Medical Research Assistant',
    sectionLabel: 'Patient context',
    fields: [
      { key: 'name', label: 'Patient name', placeholder: 'Enter patient name' },
      {
        key: 'disease',
        label: 'Disease / condition',
        placeholder: 'Enter disease or condition',
      },
      {
        key: 'additionalQuery',
        label: 'Additional query',
        placeholder: 'Enter the research question',
      },
      { key: 'location', label: 'Location (optional)', placeholder: 'Optional location' },
    ],
    focusLabel: 'Research focus',
    focusPlaceholder: 'Choose a research focus',
    focusOptions: ['Treatments & therapies', 'Diagnostics & monitoring', 'Clinical trials'],
    actionLabel: 'Start research session',
    recentLabel: 'Recent sessions',
    emptyRecentLabel: 'No saved sessions yet',
  },
  workspace: {
    queryLabel: 'Ask a follow-up question',
    queryPlaceholder: 'What are the latest deep brain stimulation treatments?',
  },
}
