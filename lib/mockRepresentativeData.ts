export interface Representative {
  id: string
  name: string
  title: string
  party: 'Democrat' | 'Republican' | 'Independent'
  state: string
  district?: string
  chamber: 'House' | 'Senate'
  imageUrl?: string
  bio: string
  yearsInOffice: number
  committeeMemberships: string[]
  sponsoredBills: string[]
  votingRecord: {
    totalVotes: number
    partyUnity: number
    bipartisanVotes: number
  }
  contactInfo: {
    website: string
    email: string
    phone: string
    office: string
  }
}

export interface RepresentativeBill {
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
}

export const mockRepresentatives: Representative[] = [
  {
    id: 'rep-davis-ca',
    name: 'Anna Davis',
    title: 'Representative',
    party: 'Democrat',
    state: 'California',
    district: '12th',
    chamber: 'House',
    bio: 'Anna Davis has served California\'s 12th Congressional District since 2019. A former environmental lawyer, she focuses on climate change legislation and healthcare reform.',
    yearsInOffice: 5,
    committeeMemberships: ['Energy and Commerce', 'Natural Resources', 'Climate Crisis'],
    sponsoredBills: ['HR-2024', 'HR-4567'],
    votingRecord: {
      totalVotes: 1247,
      partyUnity: 94,
      bipartisanVotes: 23
    },
    contactInfo: {
      website: 'https://davis.house.gov',
      email: 'anna.davis@house.gov',
      phone: '(202) 225-1234',
      office: '1234 Longworth House Office Building'
    }
  },
  {
    id: 'sen-johnson-tx',
    name: 'Michael Johnson',
    title: 'Senator',
    party: 'Republican',
    state: 'Texas',
    chamber: 'Senate',
    bio: 'Senator Michael Johnson has represented Texas since 2015. A former state prosecutor, he focuses on border security, energy independence, and law enforcement issues.',
    yearsInOffice: 9,
    committeeMemberships: ['Judiciary', 'Homeland Security', 'Energy and Natural Resources'],
    sponsoredBills: ['S-3041'],
    votingRecord: {
      totalVotes: 2156,
      partyUnity: 97,
      bipartisanVotes: 18
    },
    contactInfo: {
      website: 'https://johnson.senate.gov',
      email: 'michael.johnson@senate.gov',
      phone: '(202) 224-5234',
      office: '5678 Russell Senate Office Building'
    }
  },
  {
    id: 'rep-martinez-co',
    name: 'Sarah Martinez',
    title: 'Representative',
    party: 'Democrat',
    state: 'Colorado',
    district: '3rd',
    chamber: 'House',
    bio: 'Representative Sarah Martinez has served Colorado\'s 3rd District since 2021. A former public defender, she advocates for criminal justice reform and gun safety legislation.',
    yearsInOffice: 3,
    committeeMemberships: ['Judiciary', 'Education and Labor', 'Oversight and Reform'],
    sponsoredBills: ['HR-5555'],
    votingRecord: {
      totalVotes: 892,
      partyUnity: 91,
      bipartisanVotes: 34
    },
    contactInfo: {
      website: 'https://martinez.house.gov',
      email: 'sarah.martinez@house.gov',
      phone: '(202) 225-5678',
      office: '9012 Cannon House Office Building'
    }
  },
  {
    id: 'rep-wilson-ca',
    name: 'James Wilson',
    title: 'Representative',
    party: 'Republican',
    state: 'California',
    district: '45th',
    chamber: 'House',
    bio: 'Representative James Wilson has served California\'s 45th District since 2017. A former business executive, he focuses on economic growth, tax reform, and healthcare access.',
    yearsInOffice: 7,
    committeeMemberships: ['Ways and Means', 'Financial Services', 'Small Business'],
    sponsoredBills: ['HR-1234'],
    votingRecord: {
      totalVotes: 1567,
      partyUnity: 95,
      bipartisanVotes: 21
    },
    contactInfo: {
      website: 'https://wilson.house.gov',
      email: 'james.wilson@house.gov',
      phone: '(202) 225-9012',
      office: '3456 Rayburn House Office Building'
    }
  },
  {
    id: 'sen-garcia-ny',
    name: 'Maria Garcia',
    title: 'Senator',
    party: 'Democrat',
    state: 'New York',
    chamber: 'Senate',
    bio: 'Senator Maria Garcia has represented New York since 2019. A former technology executive, she focuses on digital privacy, cybersecurity, and innovation policy.',
    yearsInOffice: 5,
    committeeMemberships: ['Commerce, Science, and Transportation', 'Intelligence', 'Small Business'],
    sponsoredBills: ['S-7890'],
    votingRecord: {
      totalVotes: 1345,
      partyUnity: 93,
      bipartisanVotes: 28
    },
    contactInfo: {
      website: 'https://garcia.senate.gov',
      email: 'maria.garcia@senate.gov',
      phone: '(202) 224-3456',
      office: '7890 Dirksen Senate Office Building'
    }
  },
  {
    id: 'rep-chen-tx',
    name: 'Robert Chen',
    title: 'Representative',
    party: 'Republican',
    state: 'Texas',
    district: '8th',
    chamber: 'House',
    bio: 'Representative Robert Chen has served Texas\'s 8th District since 2020. A former healthcare administrator, he focuses on healthcare reform, veterans affairs, and agriculture policy.',
    yearsInOffice: 4,
    committeeMemberships: ['Veterans\' Affairs', 'Agriculture', 'Energy and Commerce'],
    sponsoredBills: ['HR-1234'],
    votingRecord: {
      totalVotes: 678,
      partyUnity: 96,
      bipartisanVotes: 19
    },
    contactInfo: {
      website: 'https://chen.house.gov',
      email: 'robert.chen@house.gov',
      phone: '(202) 225-7890',
      office: '2468 Longworth House Office Building'
    }
  }
]

export const representativeBills: Record<string, RepresentativeBill[]> = {
  'rep-davis-ca': [
    {
      id: 'HR-2024',
      title: 'Federal Abortion Rights Protection Act',
      status: 'Committee',
      date: '2024-10-01',
      summary: 'This bill creates comprehensive protections for abortion rights at the federal level, establishing a national standard that supersedes state restrictions.',
      controversy: 'High',
      trendScore: 87,
      supportersCount: 8934,
      opposersCount: 6300,
      categories: ['Healthcare', 'Rights', 'Federal']
    },
    {
      id: 'HR-4567',
      title: 'Clean Energy Infrastructure Act',
      status: 'House',
      date: '2024-09-20',
      summary: 'Allocates $50B for renewable energy infrastructure and creates tax incentives for solar adoption nationwide.',
      controversy: 'Medium',
      trendScore: 85,
      supportersCount: 2340,
      opposersCount: 1120,
      categories: ['Climate', 'Energy', 'Infrastructure']
    }
  ],
  'sen-johnson-tx': [
    {
      id: 'S-3041',
      title: 'Border Security Enhancement Act',
      status: 'Senate',
      date: '2024-09-28',
      summary: 'This bill increases border security funding and establishes new immigration enforcement measures at the southern border.',
      controversy: 'High',
      trendScore: 92,
      supportersCount: 2234,
      opposersCount: 6687,
      categories: ['Immigration', 'Security', 'Border']
    }
  ],
  'rep-martinez-co': [
    {
      id: 'HR-5555',
      title: 'Universal Background Check Act',
      status: 'Introduced',
      date: '2024-09-25',
      summary: 'This bill expands background check requirements to cover all firearm sales, including private transactions and gun shows.',
      controversy: 'High',
      trendScore: 78,
      supportersCount: 8923,
      opposersCount: 3533,
      categories: ['Gun Control', 'Safety', 'Background Checks']
    }
  ],
  'rep-wilson-ca': [
    {
      id: 'HR-1234',
      title: 'Healthcare Access Expansion Act',
      status: 'Committee',
      date: '2024-09-15',
      summary: 'Expands Medicare coverage and reduces prescription drug costs for seniors and low-income families.',
      controversy: 'High',
      trendScore: 82,
      supportersCount: 1890,
      opposersCount: 2100,
      categories: ['Healthcare', 'Medicare', 'Pharmaceuticals']
    }
  ],
  'sen-garcia-ny': [
    {
      id: 'S-7890',
      title: 'Digital Privacy Protection Act',
      status: 'Senate',
      date: '2024-09-18',
      summary: 'Establishes comprehensive data protection standards for tech companies and strengthens consumer privacy rights.',
      controversy: 'Low',
      trendScore: 88,
      supportersCount: 3450,
      opposersCount: 890,
      categories: ['Privacy', 'Technology', 'Consumer Rights']
    }
  ],
  'rep-chen-tx': [
    {
      id: 'HR-1234',
      title: 'Healthcare Access Expansion Act',
      status: 'Committee',
      date: '2024-09-15',
      summary: 'Expands Medicare coverage and reduces prescription drug costs for seniors and low-income families.',
      controversy: 'High',
      trendScore: 82,
      supportersCount: 1890,
      opposersCount: 2100,
      categories: ['Healthcare', 'Medicare', 'Pharmaceuticals']
    }
  ]
}
