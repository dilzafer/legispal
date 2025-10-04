// OpenStates API Service

import { OPENSTATES_CONFIG, OPENSTATES_ENDPOINTS } from '../config/openstates';
import type {
  Bill,
  BillList,
  BillSearchParams,
  JurisdictionList,
} from '../types/openstates';

class OpenStatesService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = OPENSTATES_CONFIG.BASE_URL;
    this.apiKey = OPENSTATES_CONFIG.API_KEY;
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return searchParams.toString();
  }

  /**
   * Make API request
   */
  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? this.buildQueryString(params) : '';
    const url = `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenStates API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Search for bills
   */
  async searchBills(params: BillSearchParams): Promise<BillList> {
    // Default includes for comprehensive bill data
    const defaultIncludes = [
      'sponsorships',
      'abstracts',
      'actions',
      'votes',
      'versions',
      'documents',
    ];

    const searchParams = {
      ...params,
      include: params.include || defaultIncludes,
      per_page: params.per_page || OPENSTATES_CONFIG.DEFAULT_PER_PAGE,
      page: params.page || 1,
    };

    return this.request<BillList>(OPENSTATES_ENDPOINTS.BILLS, searchParams);
  }

  /**
   * Get bill by ID (ocd-bill format)
   */
  async getBillById(billId: string, include?: string[]): Promise<Bill> {
    const defaultIncludes = [
      'sponsorships',
      'abstracts',
      'actions',
      'votes',
      'versions',
      'documents',
      'sources',
    ];

    const params = {
      include: include || defaultIncludes,
    };

    // Remove 'ocd-bill/' prefix if present since endpoint already includes it
    const cleanId = billId.replace(/^ocd-bill\//, '');

    return this.request<Bill>(
      `${OPENSTATES_ENDPOINTS.BILL_BY_ID}/${cleanId}`,
      params
    );
  }

  /**
   * Get bill by jurisdiction, session, and identifier
   */
  async getBillByIdentifier(
    jurisdiction: string,
    session: string,
    billId: string,
    include?: string[]
  ): Promise<Bill> {
    const defaultIncludes = [
      'sponsorships',
      'abstracts',
      'actions',
      'votes',
      'versions',
      'documents',
      'sources',
    ];

    const params = {
      include: include || defaultIncludes,
    };

    return this.request<Bill>(
      `${OPENSTATES_ENDPOINTS.BILL_DETAIL}/${jurisdiction}/${session}/${billId}`,
      params
    );
  }

  /**
   * Get list of jurisdictions
   */
  async getJurisdictions(params?: {
    classification?: 'state' | 'municipality' | 'country';
    page?: number;
    per_page?: number;
  }): Promise<JurisdictionList> {
    return this.request<JurisdictionList>(
      OPENSTATES_ENDPOINTS.JURISDICTIONS,
      params
    );
  }

  /**
   * Search bills by text query
   */
  async searchBillsByText(
    query: string,
    jurisdiction?: string,
    options?: Partial<BillSearchParams>
  ): Promise<BillList> {
    return this.searchBills({
      q: query,
      jurisdiction,
      ...options,
    });
  }

  /**
   * Get recent bills for a jurisdiction
   */
  async getRecentBills(
    jurisdiction: string,
    limit: number = 10
  ): Promise<BillList> {
    return this.searchBills({
      jurisdiction,
      sort: 'updated_desc',
      per_page: limit,
    });
  }

  /**
   * Get bills by session
   */
  async getBillsBySession(
    jurisdiction: string,
    session: string,
    options?: Partial<BillSearchParams>
  ): Promise<BillList> {
    return this.searchBills({
      jurisdiction,
      session,
      ...options,
    });
  }
}

// Export singleton instance
export const openStatesService = new OpenStatesService();
