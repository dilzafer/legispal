export interface LobbyingActivity {
  id: string
  client: string
  lobbyist: string
  amount: number
  quarter: string
  year: number
  issue: string
  description: string
  relatedBills: string[]
  disclosureDate: string
  lobbyingFirm: string
  category: 'Energy' | 'Healthcare' | 'Technology' | 'Finance' | 'Defense' | 'Agriculture' | 'Transportation' | 'Education'
  target: 'House' | 'Senate' | 'Both' | 'Administration'
  status: 'Active' | 'Completed' | 'Pending'
}

export interface LobbyingBill {
  id: string
  title: string
  status: 'Introduced' | 'Committee' | 'House' | 'Senate' | 'Enacted'
  date: string
  summary: string
  controversy: 'Low' | 'Medium' | 'High'
  trendScore: number
  supportersCount: number
  opposersCount: number
  categories: string[]
  sponsor: string
}

export const mockLobbyingActivities: LobbyingActivity[] = [
  {
    id: 'lobby-001',
    client: 'CleanFuture PAC',
    lobbyist: 'Jennifer Martinez',
    amount: 2850000,
    quarter: 'Q3',
    year: 2024,
    issue: 'Renewable Energy Tax Incentives',
    description: 'Lobbying for enhanced federal tax credits for solar and wind energy projects, including residential and commercial installations. Focus on extending current incentives and expanding eligibility criteria.',
    relatedBills: ['HR-2024'],
    disclosureDate: '2024-10-15',
    lobbyingFirm: 'Green Policy Solutions',
    category: 'Energy',
    target: 'Both',
    status: 'Active'
  },
  {
    id: 'lobby-002',
    client: 'TechNet Alliance',
    lobbyist: 'David Chen',
    amount: 4200000,
    quarter: 'Q3',
    year: 2024,
    issue: 'Data Privacy and AI Regulation',
    description: 'Comprehensive lobbying campaign for balanced AI regulation that protects consumer privacy while fostering innovation. Advocating for federal preemption of state privacy laws and industry-friendly AI governance frameworks.',
    relatedBills: ['S-3041'],
    disclosureDate: '2024-10-12',
    lobbyingFirm: 'Digital Futures Group',
    category: 'Technology',
    target: 'Both',
    status: 'Active'
  },
  {
    id: 'lobby-003',
    client: 'Healthcare Access Coalition',
    lobbyist: 'Sarah Williams',
    amount: 3200000,
    quarter: 'Q3',
    year: 2024,
    issue: 'Medicare Expansion and Drug Pricing',
    description: 'Lobbying efforts to expand Medicare coverage to include dental, vision, and hearing benefits. Also advocating for legislation to allow Medicare to negotiate prescription drug prices directly with pharmaceutical companies.',
    relatedBills: ['HR-2024', 'S-3041'],
    disclosureDate: '2024-10-08',
    lobbyingFirm: 'Health Policy Partners',
    category: 'Healthcare',
    target: 'Both',
    status: 'Active'
  },
  {
    id: 'lobby-004',
    client: 'National Security Defense Fund',
    lobbyist: 'Robert Thompson',
    amount: 1850000,
    quarter: 'Q3',
    year: 2024,
    issue: 'Border Security and Immigration Enforcement',
    description: 'Lobbying for increased border security funding, enhanced surveillance technology, and streamlined immigration enforcement procedures. Focus on bipartisan border security legislation.',
    relatedBills: ['S-3041'],
    disclosureDate: '2024-10-05',
    lobbyingFirm: 'Security Policy Associates',
    category: 'Defense',
    target: 'Both',
    status: 'Active'
  },
  {
    id: 'lobby-005',
    client: 'Gun Safety Now Coalition',
    lobbyist: 'Lisa Rodriguez',
    amount: 2200000,
    quarter: 'Q3',
    year: 2024,
    issue: 'Universal Background Checks',
    description: 'Comprehensive lobbying campaign for universal background check legislation covering all firearm sales, including private transactions and gun shows. Advocating for enhanced mental health reporting and closing existing loopholes.',
    relatedBills: ['HR-5555'],
    disclosureDate: '2024-10-02',
    lobbyingFirm: 'Safety First Advocacy',
    category: 'Defense',
    target: 'Both',
    status: 'Active'
  },
  {
    id: 'lobby-006',
    client: 'Big Pharma Alliance',
    lobbyist: 'Michael Foster',
    amount: 4500000,
    quarter: 'Q3',
    year: 2024,
    issue: 'Drug Pricing and Patent Reform',
    description: 'Opposing Medicare drug price negotiation legislation while advocating for alternative cost-control measures. Lobbying for extended patent protections and streamlined FDA approval processes.',
    relatedBills: ['HR-2024'],
    disclosureDate: '2024-09-28',
    lobbyingFirm: 'Pharmaceutical Policy Group',
    category: 'Healthcare',
    target: 'Both',
    status: 'Active'
  },
  {
    id: 'lobby-007',
    client: 'Fossil Fuel Energy Coalition',
    lobbyist: 'Jennifer Adams',
    amount: 3800000,
    quarter: 'Q3',
    year: 2024,
    issue: 'Traditional Energy Infrastructure',
    description: 'Lobbying against renewable energy mandates while advocating for continued support of oil, gas, and coal infrastructure. Focus on maintaining federal subsidies for traditional energy sectors.',
    relatedBills: ['HR-2024'],
    disclosureDate: '2024-09-25',
    lobbyingFirm: 'Energy Policy Solutions',
    category: 'Energy',
    target: 'Both',
    status: 'Active'
  },
  {
    id: 'lobby-008',
    client: 'Silicon Valley Tech Giants',
    lobbyist: 'Alex Kim',
    amount: 5200000,
    quarter: 'Q3',
    year: 2024,
    issue: 'Platform Regulation and Antitrust',
    description: 'Defensive lobbying against increased platform regulation and antitrust enforcement. Advocating for self-regulation frameworks and opposing mandatory content moderation requirements.',
    relatedBills: ['S-3041'],
    disclosureDate: '2024-09-22',
    lobbyingFirm: 'Tech Policy Advisors',
    category: 'Technology',
    target: 'Both',
    status: 'Active'
  },
  {
    id: 'lobby-009',
    client: 'National Rifle Association',
    lobbyist: 'James Mitchell',
    amount: 2100000,
    quarter: 'Q3',
    year: 2024,
    issue: 'Second Amendment Protection',
    description: 'Opposing universal background check legislation and other gun control measures. Advocating for concealed carry reciprocity and opposing assault weapon bans.',
    relatedBills: ['HR-5555'],
    disclosureDate: '2024-09-18',
    lobbyingFirm: 'Second Amendment Advocates',
    category: 'Defense',
    target: 'Both',
    status: 'Active'
  },
  {
    id: 'lobby-010',
    client: 'Progressive Health Alliance',
    lobbyist: 'Maria Santos',
    amount: 2600000,
    quarter: 'Q3',
    year: 2024,
    issue: 'Reproductive Rights Protection',
    description: 'Lobbying for federal legislation to protect and expand reproductive rights, including abortion access. Advocating for comprehensive healthcare coverage and opposing state-level restrictions.',
    relatedBills: ['HR-2024'],
    disclosureDate: '2024-09-15',
    lobbyingFirm: 'Reproductive Rights Advocates',
    category: 'Healthcare',
    target: 'Both',
    status: 'Active'
  }
]

export const lobbyingRelatedBills: Record<string, LobbyingBill> = {
  'HR-4567': {
    id: 'HR-4567',
    title: 'Clean Energy Infrastructure Act',
    status: 'House',
    date: '2024-09-20',
    summary: 'Allocates $50B for renewable energy infrastructure and creates tax incentives for solar adoption nationwide.',
    controversy: 'Medium',
    trendScore: 85,
    supportersCount: 2340,
    opposersCount: 1120,
    categories: ['Climate', 'Energy', 'Infrastructure'],
    sponsor: 'Rep. James Wilson (D-CA)'
  },
  'S-7890': {
    id: 'S-7890',
    title: 'Digital Privacy Protection Act',
    status: 'Senate',
    date: '2024-09-18',
    summary: 'Establishes comprehensive data protection standards for tech companies and strengthens consumer privacy rights.',
    controversy: 'Low',
    trendScore: 88,
    supportersCount: 3450,
    opposersCount: 890,
    categories: ['Privacy', 'Technology', 'Consumer Rights'],
    sponsor: 'Sen. Maria Garcia (D-NY)'
  },
  'HR-1234': {
    id: 'HR-1234',
    title: 'Healthcare Access Expansion Act',
    status: 'Committee',
    date: '2024-09-15',
    summary: 'Expands Medicare coverage and reduces prescription drug costs for seniors and low-income families.',
    controversy: 'High',
    trendScore: 82,
    supportersCount: 1890,
    opposersCount: 2100,
    categories: ['Healthcare', 'Medicare', 'Pharmaceuticals'],
    sponsor: 'Rep. Robert Chen (R-TX)'
  },
  'HR-2024': {
    id: 'HR-2024',
    title: 'Federal Abortion Rights Protection Act',
    status: 'Committee',
    date: '2024-10-01',
    summary: 'This bill creates comprehensive protections for abortion rights at the federal level, establishing a national standard that supersedes state restrictions.',
    controversy: 'High',
    trendScore: 87,
    supportersCount: 8934,
    opposersCount: 6300,
    categories: ['Healthcare', 'Rights', 'Federal'],
    sponsor: 'Rep. Anna Davis (D-CA)'
  },
  'S-3041': {
    id: 'S-3041',
    title: 'Border Security Enhancement Act',
    status: 'Senate',
    date: '2024-09-28',
    summary: 'This bill increases border security funding and establishes new immigration enforcement measures at the southern border.',
    controversy: 'High',
    trendScore: 92,
    supportersCount: 2234,
    opposersCount: 6687,
    categories: ['Immigration', 'Security', 'Border'],
    sponsor: 'Sen. Michael Johnson (R-TX)'
  },
  'HR-5555': {
    id: 'HR-5555',
    title: 'Universal Background Check Act',
    status: 'Introduced',
    date: '2024-09-25',
    summary: 'This bill expands background check requirements to cover all firearm sales, including private transactions and gun shows.',
    controversy: 'High',
    trendScore: 78,
    supportersCount: 8923,
    opposersCount: 3533,
    categories: ['Gun Control', 'Safety', 'Background Checks'],
    sponsor: 'Rep. Sarah Martinez (D-CO)'
  }
}
