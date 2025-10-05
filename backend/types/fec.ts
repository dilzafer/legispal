// FEC API Types

export interface FECCandidate {
  candidate_id: string;
  name: string;
  party: string;
  office: string;
  state?: string;
  district?: string;
  election_years?: number[];
  cycles?: number[];
  candidate_status?: string;
  incumbent_challenge?: string;
}

export interface FECCandidateTotals {
  candidate_id: string;
  cycle: number;
  receipts: number;
  disbursements: number;
  cash_on_hand_end_period: number;
  debts_owed_by_committee: number;
  individual_contributions: number;
  party_contributions: number;
  other_political_committee_contributions: number;
  candidate_contribution: number;
  transfers_from_other_authorized_committee: number;
  loans_received_from_candidate: number;
  other_receipts: number;
}

export interface FECCommittee {
  committee_id: string;
  name: string;
  committee_type: string;
  designation: string;
  party?: string;
  state?: string;
  treasurer_name?: string;
}

export interface FECContribution {
  sub_id: string;
  committee_id: string;
  committee_name: string;
  contributor_name: string;
  contributor_employer?: string;
  contributor_occupation?: string;
  contributor_state?: string;
  contributor_city?: string;
  contributor_zip?: string;
  contribution_receipt_amount: number;
  contribution_receipt_date: string;
  receipt_type?: string;
  memo_text?: string;
}

export interface FECDisbursement {
  sub_id: string;
  committee_id: string;
  committee_name: string;
  recipient_name: string;
  recipient_state?: string;
  recipient_city?: string;
  disbursement_amount: number;
  disbursement_date: string;
  disbursement_description?: string;
  purpose_category?: string;
  memo_text?: string;
}

export interface FECScheduleAByEmployer {
  employer: string;
  cycle: number;
  total: number;
  count: number;
}

export interface FECScheduleAByOccupation {
  occupation: string;
  cycle: number;
  total: number;
  count: number;
}

export interface FECPaginatedResponse<T> {
  results: T[];
  pagination: {
    count: number;
    page: number;
    pages: number;
    per_page: number;
  };
}

export interface FECMoneyFlowData {
  nodes: Array<{
    id: number;
    name: string;
    type: 'donor' | 'candidate' | 'committee';
  }>;
  links: Array<{
    source: number;
    target: number;
    value: number;
  }>;
  totals: {
    total_receipts: number;
    total_disbursements: number;
    individual_contributions: number;
    pac_contributions: number;
  };
}
