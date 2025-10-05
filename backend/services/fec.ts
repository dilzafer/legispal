// FEC API Service

import { FEC_CONFIG, FEC_ENDPOINTS } from '../config/fec';
import type {
  FECCandidate,
  FECCandidateTotals,
  FECCommittee,
  FECContribution,
  FECDisbursement,
  FECScheduleAByEmployer,
  FECScheduleAByOccupation,
  FECPaginatedResponse,
  FECMoneyFlowData,
} from '../types/fec';

class FECService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = FEC_CONFIG.BASE_URL;
    this.apiKey = FEC_CONFIG.API_KEY;
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
      throw new Error(`FEC API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Search for candidates
   */
  async searchCandidates(params: {
    q?: string;
    name?: string;
    office?: 'H' | 'S' | 'P';
    state?: string;
    party?: string;
    cycle?: number;
    is_active_candidate?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<FECPaginatedResponse<FECCandidate>> {
    return this.request<FECPaginatedResponse<FECCandidate>>(
      FEC_ENDPOINTS.CANDIDATES,
      {
        ...params,
        per_page: params.per_page || 20,
        sort: 'name',
      }
    );
  }

  /**
   * Get candidate totals
   */
  async getCandidateTotals(
    candidateId: string,
    params?: {
      cycle?: number;
      election_full?: boolean;
    }
  ): Promise<FECPaginatedResponse<FECCandidateTotals>> {
    return this.request<FECPaginatedResponse<FECCandidateTotals>>(
      `${FEC_ENDPOINTS.CANDIDATE_TOTALS}/${candidateId}/totals`,
      {
        ...params,
        sort: '-cycle',
      }
    );
  }

  /**
   * Get contributions to a candidate (Schedule A)
   */
  async getCandidateContributions(
    candidateId: string,
    params?: {
      two_year_transaction_period?: number;
      min_amount?: number;
      max_amount?: number;
      per_page?: number;
      page?: number;
    }
  ): Promise<FECPaginatedResponse<FECContribution>> {
    return this.request<FECPaginatedResponse<FECContribution>>(
      FEC_ENDPOINTS.SCHEDULE_A,
      {
        candidate_id: candidateId,
        ...params,
        per_page: params?.per_page || 100,
        sort: '-contribution_receipt_date',
      }
    );
  }

  /**
   * Get contributions by employer for a candidate
   */
  async getContributionsByEmployer(
    candidateId: string,
    cycle: number,
    limit: number = 10
  ): Promise<FECPaginatedResponse<FECScheduleAByEmployer>> {
    return this.request<FECPaginatedResponse<FECScheduleAByEmployer>>(
      `${FEC_ENDPOINTS.SCHEDULE_A}/by_employer`,
      {
        candidate_id: candidateId,
        cycle,
        per_page: limit,
        sort: '-total',
      }
    );
  }

  /**
   * Get contributions by occupation for a candidate
   */
  async getContributionsByOccupation(
    candidateId: string,
    cycle: number,
    limit: number = 10
  ): Promise<FECPaginatedResponse<FECScheduleAByOccupation>> {
    return this.request<FECPaginatedResponse<FECScheduleAByOccupation>>(
      `${FEC_ENDPOINTS.SCHEDULE_A}/by_occupation`,
      {
        candidate_id: candidateId,
        cycle,
        per_page: limit,
        sort: '-total',
      }
    );
  }

  /**
   * Get candidate's committees
   */
  async getCandidateCommittees(
    candidateId: string
  ): Promise<FECPaginatedResponse<FECCommittee>> {
    return this.request<FECPaginatedResponse<FECCommittee>>(
      `${FEC_ENDPOINTS.CANDIDATE_TOTALS}/${candidateId}/committees`
    );
  }

  /**
   * Build money flow visualization data for a candidate
   */
  async getMoneyFlowData(
    candidateId: string,
    cycle: number = 2024
  ): Promise<FECMoneyFlowData> {
    try {
      // Get candidate totals
      const totalsResponse = await this.getCandidateTotals(candidateId, { cycle });
      const totals = totalsResponse.results[0];

      // Get top contributors by employer
      const employerResponse = await this.getContributionsByEmployer(candidateId, cycle, 8);
      
      // Get top contributors by occupation
      const occupationResponse = await this.getContributionsByOccupation(candidateId, cycle, 4);

      // Build nodes and links for Sankey diagram
      const nodes: FECMoneyFlowData['nodes'] = [];
      const links: FECMoneyFlowData['links'] = [];
      
      let nodeId = 0;

      // Add candidate node (center)
      const candidateNodeId = nodeId++;
      nodes.push({
        id: candidateNodeId,
        name: 'Candidate',
        type: 'candidate',
      });

      // Add top employer nodes (donors)
      employerResponse.results.forEach((employer) => {
        const employerNodeId = nodeId++;
        nodes.push({
          id: employerNodeId,
          name: employer.employer || 'Unknown',
          type: 'donor',
        });
        
        links.push({
          source: employerNodeId,
          target: candidateNodeId,
          value: employer.total,
        });
      });

      // Add occupation nodes if we have room
      occupationResponse.results.slice(0, 4).forEach((occupation) => {
        const occupationNodeId = nodeId++;
        nodes.push({
          id: occupationNodeId,
          name: occupation.occupation || 'Unknown',
          type: 'donor',
        });
        
        links.push({
          source: occupationNodeId,
          target: candidateNodeId,
          value: occupation.total,
        });
      });

      return {
        nodes,
        links,
        totals: {
          total_receipts: totals?.receipts || 0,
          total_disbursements: totals?.disbursements || 0,
          individual_contributions: totals?.individual_contributions || 0,
          pac_contributions: totals?.other_political_committee_contributions || 0,
        },
      };
    } catch (error) {
      console.error('Error building money flow data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const fecService = new FECService();
