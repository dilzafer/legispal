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
   * Search bills by text - fetches from multiple bill types and filters
   */
  async searchBillsByText(
    query: string,
    options?: Partial<CongressBillSearchParams>
  ): Promise<CongressBillList> {
    // Congress.gov API doesn't have full-text search
    // We fetch from multiple bill types and filter client-side
    const limit = options?.limit || 20;
    const congress = options?.congress || CONGRESS_CONFIG.CURRENT_CONGRESS;
    
    try {
      // Fetch from both House and Senate bills for better coverage
      const [houseResponse, senateResponse] = await Promise.all([
        this.searchBills({
          congress,
          billType: 'hr',
          limit: 100,
          sort: 'updateDate+desc',
        }),
        this.searchBills({
          congress,
          billType: 's',
          limit: 100,
          sort: 'updateDate+desc',
        }),
      ]);

      // Combine bills from both chambers
      const allBills = [...houseResponse.bills, ...senateResponse.bills];

      // Filter bills by query in title, number, or type
      if (query && query.length > 0) {
        const lowerQuery = query.toLowerCase();
        const filtered = allBills.filter(bill => {
          const titleMatch = bill.title?.toLowerCase().includes(lowerQuery);
          const numberMatch = bill.number?.toLowerCase().includes(lowerQuery);
          const typeMatch = bill.type?.toLowerCase().includes(lowerQuery);
          
          // Also check if query matches bill ID format (e.g., "HR 1234" or "S 567")
          const billId = `${bill.type} ${bill.number}`.toLowerCase();
          const idMatch = billId.includes(lowerQuery);
          
          return titleMatch || numberMatch || typeMatch || idMatch;
        });

        // Sort by update date (most recent first)
        filtered.sort((a, b) => {
          const dateA = new Date(a.updateDate || 0).getTime();
          const dateB = new Date(b.updateDate || 0).getTime();
          return dateB - dateA;
        });

        return {
          bills: filtered.slice(0, limit),
          pagination: {
            count: filtered.length,
            next: filtered.length > limit ? 'more available' : undefined,
          },
        };
      }

      // No query - return recent bills from both chambers
      const combined = allBills
        .sort((a, b) => {
          const dateA = new Date(a.updateDate || 0).getTime();
          const dateB = new Date(b.updateDate || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, limit);

      return {
        bills: combined,
        pagination: {
          count: combined.length,
          next: allBills.length > limit ? 'more available' : undefined,
        },
      };
    } catch (error) {
      console.error('Error searching bills by text:', error);
      // Fallback to single request
      return this.searchBills({
        congress,
        limit,
        sort: 'updateDate+desc',
      });
    }
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
