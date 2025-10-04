// Congress.gov API Service

import { CONGRESS_CONFIG, CONGRESS_ENDPOINTS } from '../config/congress';
import type {
  CongressBill,
  CongressBillList,
  CongressBillSearchParams,
  CongressAmendmentList,
} from '../types/congress';

class CongressService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = CONGRESS_CONFIG.BASE_URL;
    this.apiKey = CONGRESS_CONFIG.API_KEY;
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    // Always add API key
    searchParams.append('api_key', this.apiKey);

    return searchParams.toString();
  }

  /**
   * Make API request
   */
  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = this.buildQueryString(params || {});
    const url = `${this.baseUrl}${endpoint}?${queryString}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Congress.gov API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Search for bills
   */
  async searchBills(params: CongressBillSearchParams = {}): Promise<CongressBillList> {
    const searchParams = {
      limit: params.limit || CONGRESS_CONFIG.DEFAULT_LIMIT,
      offset: params.offset || 0,
      sort: params.sort || 'updateDate+desc',
      ...params,
    };

    let endpoint: string = CONGRESS_ENDPOINTS.BILLS;

    // Build endpoint based on parameters
    if (params.congress && params.billType) {
      endpoint = `${CONGRESS_ENDPOINTS.BILLS}/${params.congress}/${params.billType}`;
      delete searchParams.congress;
      delete searchParams.billType;
    } else if (params.congress) {
      endpoint = `${CONGRESS_ENDPOINTS.BILLS}/${params.congress}`;
      delete searchParams.congress;
    }

    return this.request<CongressBillList>(endpoint, searchParams);
  }

  /**
   * Get bill by congress, type, and number
   */
  async getBillDetail(
    congress: number,
    billType: string,
    billNumber: string
  ): Promise<{ bill: CongressBill }> {
    const endpoint = `${CONGRESS_ENDPOINTS.BILL_DETAIL}/${congress}/${billType}/${billNumber}`;
    return this.request<{ bill: CongressBill }>(endpoint);
  }

  /**
   * Get recent bills for current congress
   */
  async getRecentBills(limit: number = 10): Promise<CongressBillList> {
    return this.searchBills({
      congress: CONGRESS_CONFIG.CURRENT_CONGRESS,
      limit,
      sort: 'updateDate+desc',
    });
  }

  /**
   * Search bills by text (using fromDateTime filter as proxy)
   */
  async searchBillsByText(
    query: string,
    options?: Partial<CongressBillSearchParams>
  ): Promise<CongressBillList> {
    // Note: Congress.gov API doesn't have full-text search like OpenStates
    // We'll return recent bills and let the frontend filter
    // For production, you'd want to implement a proper search backend
    return this.searchBills({
      congress: CONGRESS_CONFIG.CURRENT_CONGRESS,
      limit: options?.limit || 20,
      ...options,
    });
  }

  /**
   * Get bill actions
   */
  async getBillActions(
    congress: number,
    billType: string,
    billNumber: string,
    limit: number = 100
  ): Promise<any> {
    const endpoint = `${CONGRESS_ENDPOINTS.BILL_DETAIL}/${congress}/${billType}/${billNumber}/actions`;
    return this.request(endpoint, { limit });
  }

  /**
   * Get bill cosponsors
   */
  async getBillCosponsors(
    congress: number,
    billType: string,
    billNumber: string,
    limit: number = 100
  ): Promise<any> {
    const endpoint = `${CONGRESS_ENDPOINTS.BILL_DETAIL}/${congress}/${billType}/${billNumber}/cosponsors`;
    return this.request(endpoint, { limit });
  }

  /**
   * Get bill summaries
   */
  async getBillSummaries(
    congress: number,
    billType: string,
    billNumber: string
  ): Promise<any> {
    const endpoint = `${CONGRESS_ENDPOINTS.BILL_DETAIL}/${congress}/${billType}/${billNumber}/summaries`;
    return this.request(endpoint);
  }

  /**
   * Get amendments
   */
  async getAmendments(
    congress?: number,
    amendmentType?: string,
    limit: number = 10
  ): Promise<CongressAmendmentList> {
    let endpoint: string = CONGRESS_ENDPOINTS.AMENDMENTS;
    
    if (congress && amendmentType) {
      endpoint = `${endpoint}/${congress}/${amendmentType}`;
    } else if (congress) {
      endpoint = `${endpoint}/${congress}`;
    }

    return this.request<CongressAmendmentList>(endpoint, { limit });
  }
}

// Export singleton instance
export const congressService = new CongressService();
