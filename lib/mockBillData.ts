import { BillData } from '@/components/Dashboard/BillDashboard'

export const mockBillData: Record<string, BillData> = {
  'HR-2024': {
    id: 'HR-2024',
    title: 'Federal Abortion Rights Protection Act',
    billNumber: 'H.R.2024',
    status: 'Passed House',
    controversy: 'high controversy',
    trendScore: 87,
    aiConfidence: 95,
    sponsor: 'Rep. Anna Davis (D-CA)',
    description: 'This bill creates comprehensive protections for abortion rights at the federal level, establishing a national standard that supersedes state restrictions.',
    categories: ['Healthcare', 'Rights', 'Federal'],
    truthScore: 78,
    voteResults: {
      passed: true,
      chamber: 'House',
      yeas: 220,
      nays: 215,
      democratSupport: { yea: 218, nay: 4 },
      republicanSupport: { yea: 2, nay: 211 },
      independentSupport: { yea: 0, nay: 0 }
    },
    moneyMap: {
      total: '$1.2M',
      change: '+15% vs prior cycle',
      topDonors: 'Planned Parenthood, ACLU, NARAL',
      sources: [
        { name: 'Healthcare Organizations', percentage: 45, color: '#3b82f6' },
        { name: 'Civil Rights Groups', percentage: 30, color: '#10b981' },
        { name: 'Individual Donors', percentage: 15, color: '#8b5cf6' },
        { name: 'Other PACs', percentage: 10, color: '#6b7280' }
      ]
    },
    keyProvisions: [
      'Establishes federal right to abortion up to 24 weeks',
      'Prohibits state restrictions on abortion access',
      'Creates federal funding for abortion services'
    ],
    hiddenImplications: [
      'Could conflict with existing state healthcare regulations',
      'May require significant federal funding increases'
    ],
    factCheck: [
      { label: 'Constitutional basis claims are supported by legal precedent', percentage: 92, color: '#10b981' },
      { label: 'Cost estimates remain uncertain pending implementation', percentage: 73, color: '#f59e0b' }
    ],
    publicSentiment: {
      democratSupport: 85,
      republicanSupport: 15,
      comments: 15234,
      support: 8934,
      oppose: 6300,
      argumentsFor: 'Protects fundamental healthcare rights and bodily autonomy for all Americans.',
      argumentsAgainst: 'Represents federal overreach into state healthcare decisions and religious beliefs.'
    },
    sponsorship: {
      primary: 'Rep. Anna Davis (D-CA, Committee on Health)',
      coSponsors: 12,
      coSponsorList: 'Rep. Lee (D-NY), Rep. Garcia (D-TX)'
    },
    lobbyingActivity: {
      monthlyData: [
        { month: 'Jan', amount: '$20k' },
        { month: 'Feb', amount: '$50k' },
        { month: 'Mar', amount: '$120k' },
        { month: 'Apr', amount: '$190k' },
        { month: 'May', amount: '$150k' }
      ],
      topEntities: [
        { name: 'Planned Parenthood', amount: '$250k', filings: 12 },
        { name: 'ACLU', amount: '$180k', filings: 8 },
        { name: 'NARAL Pro-Choice', amount: '$150k', filings: 6 }
      ]
    },
    impact: {
      fiscalNote: 'CBO estimates a cost of $2.5-3.2B over 10 years for federal funding provisions.',
      beneficiaries: [
        'Women seeking abortion services',
        'Healthcare providers',
        'States with restrictive abortion laws'
      ],
      payers: [
        'Federal taxpayers',
        'States with existing abortion restrictions',
        'Religious organizations opposed to abortion'
      ],
      districtImpact: [
        { district: 'CA-12', jobGrowth: '+500', funding: '$50M' },
        { district: 'NY-14', jobGrowth: '+300', funding: '$35M' },
        { district: 'TX-07', jobGrowth: '+200', funding: '$25M' }
      ]
    }
  },
  'S-3041': {
    id: 'S-3041',
    title: 'Border Security Enhancement Act',
    billNumber: 'S.3041',
    status: 'Committee',
    controversy: 'medium controversy',
    trendScore: 92,
    aiConfidence: 88,
    sponsor: 'Sen. Michael Johnson (R-TX)',
    description: 'This bill increases border security funding and establishes new immigration enforcement measures at the southern border.',
    categories: ['Immigration', 'Security', 'Border'],
    truthScore: 65,
    voteResults: {
      passed: false,
      chamber: 'Committee',
      yeas: 0,
      nays: 0,
      democratSupport: { yea: 0, nay: 0 },
      republicanSupport: { yea: 0, nay: 0 },
      independentSupport: { yea: 0, nay: 0 }
    },
    moneyMap: {
      total: '$850k',
      change: '+22% vs prior cycle',
      topDonors: 'Border Patrol Union, Defense Contractors',
      sources: [
        { name: 'Security Industry', percentage: 55, color: '#ef4444' },
        { name: 'Defense Contractors', percentage: 25, color: '#f59e0b' },
        { name: 'Conservative PACs', percentage: 15, color: '#6b7280' },
        { name: 'Individual Donors', percentage: 5, color: '#8b5cf6' }
      ]
    },
    keyProvisions: [
      'Increases border patrol funding by $5B annually',
      'Establishes new detention facilities',
      'Implements biometric screening systems'
    ],
    hiddenImplications: [
      'Could impact international trade relations',
      'May require additional federal land acquisition'
    ],
    factCheck: [
      { label: 'Border security statistics are accurate', percentage: 85, color: '#10b981' },
      { label: 'Cost projections may be underestimated', percentage: 68, color: '#f59e0b' }
    ],
    publicSentiment: {
      democratSupport: 25,
      republicanSupport: 75,
      comments: 8921,
      support: 2234,
      oppose: 6687,
      argumentsFor: 'Essential for national security and controlling illegal immigration.',
      argumentsAgainst: 'Humanitarian concerns ignored and could harm border communities.'
    },
    sponsorship: {
      primary: 'Sen. Michael Johnson (R-TX, Committee on Homeland Security)',
      coSponsors: 8,
      coSponsorList: 'Sen. Smith (R-AZ), Sen. Brown (R-FL)'
    },
    lobbyingActivity: {
      monthlyData: [
        { month: 'Jan', amount: '$15k' },
        { month: 'Feb', amount: '$35k' },
        { month: 'Mar', amount: '$80k' },
        { month: 'Apr', amount: '$120k' },
        { month: 'May', amount: '$95k' }
      ],
      topEntities: [
        { name: 'Border Patrol Union', amount: '$200k', filings: 10 },
        { name: 'Lockheed Martin', amount: '$150k', filings: 7 },
        { name: 'Raytheon Technologies', amount: '$120k', filings: 5 }
      ]
    },
    impact: {
      fiscalNote: 'CBO estimates a cost of $45-55B over 10 years for enhanced border infrastructure.',
      beneficiaries: [
        'Border patrol agents',
        'Defense contractors',
        'Border state economies'
      ],
      payers: [
        'Federal taxpayers',
        'Border communities',
        'International trade partners'
      ],
      districtImpact: [
        { district: 'TX-23', jobGrowth: '+1,200', funding: '$200M' },
        { district: 'AZ-02', jobGrowth: '+800', funding: '$150M' },
        { district: 'CA-51', jobGrowth: '+600', funding: '$120M' }
      ]
    }
  },
  'HR-5555': {
    id: 'HR-5555',
    title: 'Universal Background Check Act',
    billNumber: 'H.R.5555',
    status: 'Passed House',
    controversy: 'high controversy',
    trendScore: 78,
    aiConfidence: 92,
    sponsor: 'Rep. Sarah Martinez (D-CO)',
    description: 'This bill expands background check requirements to cover all firearm sales, including private transactions and gun shows.',
    categories: ['Gun Control', 'Safety', 'Background Checks'],
    truthScore: 82,
    voteResults: {
      passed: true,
      chamber: 'House',
      yeas: 234,
      nays: 201,
      democratSupport: { yea: 220, nay: 8 },
      republicanSupport: { yea: 14, nay: 193 },
      independentSupport: { yea: 0, nay: 0 }
    },
    moneyMap: {
      total: '$980k',
      change: '+8% vs prior cycle',
      topDonors: 'Everytown for Gun Safety, Brady Campaign',
      sources: [
        { name: 'Gun Safety Organizations', percentage: 60, color: '#10b981' },
        { name: 'Law Enforcement Groups', percentage: 20, color: '#3b82f6' },
        { name: 'Individual Donors', percentage: 15, color: '#8b5cf6' },
        { name: 'Other PACs', percentage: 5, color: '#6b7280' }
      ]
    },
    keyProvisions: [
      'Requires background checks for all gun sales',
      'Establishes federal database for prohibited persons',
      'Creates penalties for unlicensed firearm dealers'
    ],
    hiddenImplications: [
      'Could create privacy concerns with expanded databases',
      'May impact traditional gun show sales'
    ],
    factCheck: [
      { label: 'Background check effectiveness data is supported', percentage: 89, color: '#10b981' },
      { label: 'Implementation timeline may be optimistic', percentage: 71, color: '#f59e0b' }
    ],
    publicSentiment: {
      democratSupport: 87,
      republicanSupport: 13,
      comments: 12456,
      support: 8923,
      oppose: 3533,
      argumentsFor: 'Common-sense gun safety measure that will save lives.',
      argumentsAgainst: 'Infringes on Second Amendment rights and won\'t prevent crime.'
    },
    sponsorship: {
      primary: 'Rep. Sarah Martinez (D-CO, Committee on Judiciary)',
      coSponsors: 15,
      coSponsorList: 'Rep. Thompson (D-CA), Rep. Jackson (D-IL)'
    },
    lobbyingActivity: {
      monthlyData: [
        { month: 'Jan', amount: '$25k' },
        { month: 'Feb', amount: '$45k' },
        { month: 'Mar', amount: '$95k' },
        { month: 'Apr', amount: '$140k' },
        { month: 'May', amount: '$110k' }
      ],
      topEntities: [
        { name: 'Everytown for Gun Safety', amount: '$300k', filings: 15 },
        { name: 'Brady Campaign', amount: '$180k', filings: 9 },
        { name: 'Giffords PAC', amount: '$120k', filings: 6 }
      ]
    },
    impact: {
      fiscalNote: 'CBO estimates a cost of $1.2-1.8B over 10 years for system implementation.',
      beneficiaries: [
        'Law enforcement agencies',
        'Gun safety advocates',
        'Victims of gun violence'
      ],
      payers: [
        'Federal taxpayers',
        'Firearm dealers',
        'Gun show operators'
      ],
      districtImpact: [
        { district: 'CO-01', jobGrowth: '+300', funding: '$40M' },
        { district: 'CA-05', jobGrowth: '+250', funding: '$35M' },
        { district: 'IL-07', jobGrowth: '+200', funding: '$30M' }
      ]
    }
  }
}
