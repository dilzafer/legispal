export interface TruthScoreFactor {
  id: string
  name: string
  category: 'Transparency' | 'Accountability' | 'Integrity' | 'Accuracy' | 'Bias Detection'
  weight: number
  score: number
  description: string
  methodology: string
  dataSources: string[]
  lastUpdated: string
  trend: 'up' | 'down' | 'stable'
  details: {
    subFactors: Array<{
      name: string
      score: number
      weight: number
      description: string
    }>
  }
}

export interface TruthScoreCalculation {
  overall: number
  factors: TruthScoreFactor[]
  confidence: number
  lastCalculated: string
  version: string
  methodology: {
    description: string
    factors: string[]
    weights: string[]
    validation: string[]
  }
}

export const truthScoreFactors: TruthScoreFactor[] = [
  {
    id: 'transparency-lobbying',
    name: 'Lobbying Transparency Index',
    category: 'Transparency',
    weight: 0.25,
    score: 78,
    description: 'Measures the completeness and accuracy of lobbying disclosure data, including financial transparency and conflict of interest reporting.',
    methodology: 'Analyzes lobbying expenditure reports, disclosure timeliness, and completeness of client information against federal reporting requirements.',
    dataSources: ['LDA Database', 'OpenSecrets', 'Federal Election Commission', 'House Clerk', 'Senate Secretary'],
    lastUpdated: '2024-10-15',
    trend: 'up',
    details: {
      subFactors: [
        {
          name: 'Disclosure Completeness',
          score: 85,
          weight: 0.4,
          description: 'Percentage of required fields properly filled in lobbying reports'
        },
        {
          name: 'Timeliness Score',
          score: 72,
          weight: 0.3,
          description: 'On-time filing rate of lobbying disclosure forms'
        },
        {
          name: 'Financial Accuracy',
          score: 76,
          weight: 0.3,
          description: 'Accuracy of reported lobbying expenditures and sources'
        }
      ]
    }
  },
  {
    id: 'bill-integrity',
    name: 'Legislative Integrity Score',
    category: 'Integrity',
    weight: 0.22,
    score: 82,
    description: 'Evaluates the authenticity and completeness of bill information, including sponsor transparency and amendment tracking.',
    methodology: 'Cross-references bill data across multiple sources, validates sponsor information, and tracks amendment authenticity.',
    dataSources: ['Congress.gov', 'GovTrack', 'Ballotpedia', 'CRS Reports', 'Committee Records'],
    lastUpdated: '2024-10-14',
    trend: 'stable',
    details: {
      subFactors: [
        {
          name: 'Source Verification',
          score: 88,
          weight: 0.35,
          description: 'Cross-validation of bill information across multiple authoritative sources'
        },
        {
          name: 'Amendment Tracking',
          score: 79,
          weight: 0.25,
          description: 'Completeness of amendment history and change tracking'
        },
        {
          name: 'Sponsor Verification',
          score: 81,
          weight: 0.4,
          description: 'Accuracy of sponsor and co-sponsor information'
        }
      ]
    }
  },
  {
    id: 'bias-detection',
    name: 'Media Bias Detection Algorithm',
    category: 'Bias Detection',
    weight: 0.18,
    score: 71,
    description: 'Advanced NLP analysis of political discourse to detect partisan bias, misleading statements, and factual accuracy.',
    methodology: 'Machine learning models trained on verified political statements, fact-checking databases, and neutral reporting standards.',
    dataSources: ['FactCheck.org', 'PolitiFact', 'AP News', 'Reuters', 'Congressional Record'],
    lastUpdated: '2024-10-13',
    trend: 'up',
    details: {
      subFactors: [
        {
          name: 'Factual Accuracy',
          score: 74,
          weight: 0.4,
          description: 'Percentage of claims verified against fact-checking databases'
        },
        {
          name: 'Language Bias',
          score: 68,
          weight: 0.3,
          description: 'Detection of partisan language and emotional manipulation'
        },
        {
          name: 'Source Credibility',
          score: 71,
          weight: 0.3,
          description: 'Reliability scoring of information sources'
        }
      ]
    }
  },
  {
    id: 'accountability-metrics',
    name: 'Political Accountability Index',
    category: 'Accountability',
    weight: 0.20,
    score: 69,
    description: 'Tracks voting record consistency, campaign promise fulfillment, and constituent engagement metrics.',
    methodology: 'Compares voting patterns against campaign promises, measures constituent communication responsiveness, and tracks conflict of interest disclosures.',
    dataSources: ['VoteSmart', 'OpenCongress', 'ProPublica', 'Federal Election Commission', 'Congressional Offices'],
    lastUpdated: '2024-10-12',
    trend: 'down',
    details: {
      subFactors: [
        {
          name: 'Promise Fulfillment',
          score: 65,
          weight: 0.35,
          description: 'Rate of campaign promise completion vs. stated commitments'
        },
        {
          name: 'Constituent Engagement',
          score: 72,
          weight: 0.25,
          description: 'Responsiveness to constituent communications and town halls'
        },
        {
          name: 'Conflict Disclosure',
          score: 70,
          weight: 0.4,
          description: 'Timeliness and completeness of financial conflict disclosures'
        }
      ]
    }
  },
  {
    id: 'data-accuracy',
    name: 'Data Accuracy Verification',
    category: 'Accuracy',
    weight: 0.15,
    score: 86,
    description: 'Real-time verification of political data against authoritative sources and detection of inconsistencies.',
    methodology: 'Automated cross-referencing of data points, anomaly detection algorithms, and human verification sampling.',
    dataSources: ['Government APIs', 'Official Records', 'Academic Databases', 'News Archives', 'Fact-Checking Services'],
    lastUpdated: '2024-10-15',
    trend: 'up',
    details: {
      subFactors: [
        {
          name: 'Cross-Source Validation',
          score: 89,
          weight: 0.4,
          description: 'Agreement rate across multiple data sources'
        },
        {
          name: 'Anomaly Detection',
          score: 83,
          weight: 0.3,
          description: 'Effectiveness in identifying data inconsistencies'
        },
        {
          name: 'Real-time Updates',
          score: 86,
          weight: 0.3,
          description: 'Speed and accuracy of data updates'
        }
      ]
    }
  }
]

export const truthScoreCalculation: TruthScoreCalculation = {
  overall: 77,
  factors: truthScoreFactors,
  confidence: 87,
  lastCalculated: '2024-10-15T14:30:00Z',
  version: 'v2.1.3',
  methodology: {
    description: 'Advanced multi-factor analysis combining transparency metrics, integrity verification, bias detection algorithms, and accountability tracking to generate a comprehensive truth score for political information.',
    factors: [
      'Lobbying Transparency Index (25%)',
      'Legislative Integrity Score (22%)',
      'Media Bias Detection Algorithm (18%)',
      'Political Accountability Index (20%)',
      'Data Accuracy Verification (15%)'
    ],
    weights: [
      'Weighted average with confidence intervals',
      'Machine learning confidence scoring',
      'Human verification sampling',
      'Real-time validation against authoritative sources'
    ],
    validation: [
      'Cross-validation with independent fact-checking organizations',
      'Academic peer review of methodology',
      'Government transparency standards compliance',
      'Regular calibration against verified truth benchmarks'
    ]
  }
}

export interface TruthScoreInsight {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: string
  confidence: number
  recommendation: string
}

export const truthScoreInsights: TruthScoreInsight[] = [
  {
    id: 'insight-001',
    title: 'Lobbying Disclosure Lag Detected',
    description: 'Recent analysis shows a 15% increase in delayed lobbying disclosures, particularly in the technology sector. This impacts transparency scoring.',
    impact: 'high',
    category: 'Transparency',
    confidence: 92,
    recommendation: 'Implement automated monitoring for disclosure deadlines and send alerts for late filings.'
  },
  {
    id: 'insight-002',
    title: 'Bill Amendment Tracking Improved',
    description: 'New API integration with Congress.gov has increased amendment tracking accuracy by 12%, boosting legislative integrity scores.',
    impact: 'medium',
    category: 'Integrity',
    confidence: 88,
    recommendation: 'Continue monitoring API performance and expand to state-level legislative tracking.'
  },
  {
    id: 'insight-003',
    title: 'Bias Detection Algorithm Enhanced',
    description: 'Updated NLP models show 8% improvement in detecting subtle partisan language and emotional manipulation in political discourse.',
    impact: 'medium',
    category: 'Bias Detection',
    confidence: 85,
    recommendation: 'Deploy enhanced models across all media monitoring channels and update confidence thresholds.'
  },
  {
    id: 'insight-004',
    title: 'Accountability Metrics Decline',
    description: 'Overall accountability scores have decreased 3% this quarter, primarily due to reduced constituent engagement responsiveness.',
    impact: 'high',
    category: 'Accountability',
    confidence: 79,
    recommendation: 'Investigate causes of engagement decline and implement automated tracking improvements.'
  }
]
