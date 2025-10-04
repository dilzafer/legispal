// Congress.gov API Types

export interface CongressBill {
  congress: number;
  type: string;
  number: string;
  originChamber?: string;
  originChamberCode?: string;
  title: string;
  latestAction?: {
    actionDate: string;
    text: string;
    actionTime?: string;
  };
  introducedDate?: string;
  updateDate?: string;
  sponsors?: CongressMember[];
  cosponsors?: {
    count: number;
    countIncludingWithdrawnCosponsors: number;
    url?: string;
  };
  committees?: {
    count: number;
    url?: string;
  };
  subjects?: {
    count: number;
    url?: string;
  };
  summaries?: {
    count: number;
    url?: string;
  };
  textVersions?: {
    count: number;
    url?: string;
  };
  actions?: {
    count: number;
    url?: string;
  };
  amendments?: {
    count: number;
    url?: string;
  };
  relatedBills?: {
    count: number;
    url?: string;
  };
  policyArea?: {
    name: string;
  };
  url?: string;
}

export interface CongressMember {
  bioguideId?: string;
  district?: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  party?: string;
  state?: string;
  url?: string;
  byRequestType?: string;
  isByRequest?: string;
}

export interface CongressBillList {
  bills: CongressBill[];
  pagination?: {
    count: number;
    next?: string;
  };
}

export interface CongressAmendment {
  congress: number;
  type: string;
  number: string;
  description?: string;
  purpose?: string;
  latestAction?: {
    actionDate: string;
    text: string;
    actionTime?: string;
  };
  sponsors?: CongressMember[];
  updateDate?: string;
  url?: string;
}

export interface CongressAmendmentList {
  amendments: CongressAmendment[];
  pagination?: {
    count: number;
    next?: string;
  };
}

export interface CongressBillSearchParams {
  congress?: number;
  billType?: string;
  limit?: number;
  offset?: number;
  fromDateTime?: string;
  toDateTime?: string;
  sort?: 'updateDate+asc' | 'updateDate+desc';
}
