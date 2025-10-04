// OpenStates API Types

export interface Jurisdiction {
  id: string;
  name: string;
  classification: 'state' | 'municipality' | 'country';
  division_id?: string;
  url?: string;
  latest_bill_update?: string;
  latest_people_update?: string;
}

export interface Organization {
  id: string;
  name: string;
  classification: string;
}

export interface BillSponsorship {
  id: string;
  name: string;
  entity_type: string;
  organization?: Organization;
  person?: CompactPerson;
  primary: boolean;
  classification: string;
}

export interface BillAction {
  id: string;
  organization: Organization;
  description: string;
  date: string;
  classification: string[];
  order: number;
  related_entities?: BillActionRelatedEntity[];
}

export interface BillActionRelatedEntity {
  name: string;
  entity_type: string;
  organization?: Organization;
  person?: CompactPerson;
}

export interface BillDocumentLink {
  url: string;
  media_type: string;
}

export interface BillDocumentOrVersion {
  id: string;
  note: string;
  date: string;
  classification: string;
  links: BillDocumentLink[];
}

export interface VoteCount {
  option: string;
  value: number;
}

export interface PersonVote {
  id: string;
  option: string;
  voter_name: string;
  voter?: CompactPerson;
}

export interface VoteEvent {
  id: string;
  motion_text: string;
  motion_classification?: string[];
  start_date: string;
  result: string;
  identifier: string;
  extras: Record<string, any>;
  organization: Organization;
  votes: PersonVote[];
  counts: VoteCount[];
  sources: Link[];
}

export interface Link {
  url: string;
  note?: string;
}

export interface CompactPerson {
  id: string;
  name: string;
  party: string;
  current_role?: CurrentRole;
}

export interface CurrentRole {
  title: string;
  org_classification: string;
  district?: string | number;
  division_id?: string;
}

export interface Bill {
  id: string;
  session: string;
  jurisdiction: Jurisdiction;
  from_organization: Organization;
  identifier: string;
  title: string;
  classification?: string[];
  subject?: string[];
  extras?: Record<string, any>;
  created_at: string;
  updated_at: string;
  openstates_url: string;
  first_action_date?: string;
  latest_action_date?: string;
  latest_action_description?: string;
  latest_passage_date?: string;
  sponsorships?: BillSponsorship[];
  actions?: BillAction[];
  sources?: Link[];
  versions?: BillDocumentOrVersion[];
  documents?: BillDocumentOrVersion[];
  votes?: VoteEvent[];
  abstracts?: BillAbstract[];
  other_titles?: BillTitle[];
  other_identifiers?: BillIdentifier[];
  related_bills?: RelatedBill[];
}

export interface BillAbstract {
  abstract: string;
  note: string;
}

export interface BillTitle {
  title: string;
  note: string;
}

export interface BillIdentifier {
  identifier: string;
}

export interface RelatedBill {
  identifier: string;
  legislative_session: string;
  relation_type: string;
}

export interface PaginationMeta {
  per_page: number;
  page: number;
  max_page: number;
  total_items: number;
}

export interface BillList {
  results: Bill[];
  pagination: PaginationMeta;
}

export interface BillSearchParams {
  jurisdiction?: string;
  session?: string;
  chamber?: string;
  identifier?: string[];
  classification?: string;
  subject?: string[];
  updated_since?: string;
  created_since?: string;
  action_since?: string;
  sort?: 'updated_asc' | 'updated_desc' | 'first_action_asc' | 'first_action_desc' | 'latest_action_asc' | 'latest_action_desc';
  sponsor?: string;
  sponsor_classification?: string;
  q?: string;
  include?: BillInclude[];
  page?: number;
  per_page?: number;
}

export type BillInclude = 
  | 'sponsorships' 
  | 'abstracts' 
  | 'other_titles' 
  | 'other_identifiers' 
  | 'actions' 
  | 'sources' 
  | 'documents' 
  | 'versions' 
  | 'votes' 
  | 'related_bills';

export interface JurisdictionList {
  results: Jurisdiction[];
  pagination: PaginationMeta;
}
