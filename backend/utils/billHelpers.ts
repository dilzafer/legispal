// Helper utilities for working with bill data

import type { Bill, VoteEvent } from '../types/openstates';

/**
 * Calculate vote percentages from a vote event
 */
export function calculateVotePercentages(vote: VoteEvent): {
  yes: number;
  no: number;
  other: number;
  total: number;
} {
  const totals = vote.counts.reduce(
    (acc, count) => {
      const option = count.option.toLowerCase();
      if (option === 'yes') {
        acc.yes = count.value;
      } else if (option === 'no') {
        acc.no = count.value;
      } else {
        acc.other += count.value;
      }
      acc.total += count.value;
      return acc;
    },
    { yes: 0, no: 0, other: 0, total: 0 }
  );

  return totals;
}

/**
 * Get the latest vote from a bill
 */
export function getLatestVote(bill: Bill): VoteEvent | null {
  if (!bill.votes || bill.votes.length === 0) {
    return null;
  }

  return bill.votes.reduce((latest, current) => {
    return new Date(current.start_date) > new Date(latest.start_date)
      ? current
      : latest;
  });
}

/**
 * Format bill identifier for URL
 */
export function formatBillIdForUrl(
  jurisdiction: string,
  session: string,
  identifier: string
): string {
  return `${jurisdiction}_${session}_${identifier}`;
}

/**
 * Parse bill ID from URL format
 */
export function parseBillIdFromUrl(urlId: string): {
  jurisdiction: string;
  session: string;
  identifier: string;
} | null {
  const parts = urlId.split('_');
  if (parts.length !== 3) {
    return null;
  }

  return {
    jurisdiction: parts[0],
    session: parts[1],
    identifier: parts[2],
  };
}

/**
 * Get primary sponsors from a bill
 */
export function getPrimarySponsors(bill: Bill) {
  if (!bill.sponsorships) {
    return [];
  }

  return bill.sponsorships.filter((sponsor) => sponsor.primary);
}

/**
 * Get bill status based on latest action
 */
export function getBillStatus(bill: Bill): string {
  if (!bill.latest_action_description) {
    return 'Unknown';
  }

  const description = bill.latest_action_description.toLowerCase();

  if (description.includes('signed') || description.includes('enacted')) {
    return 'Enacted';
  }
  if (description.includes('vetoed')) {
    return 'Vetoed';
  }
  if (description.includes('passed')) {
    return 'Passed';
  }
  if (description.includes('committee')) {
    return 'In Committee';
  }
  if (description.includes('introduced') || description.includes('filed')) {
    return 'Introduced';
  }

  return 'In Progress';
}

/**
 * Check if a bill has recent activity (within last 30 days)
 */
export function hasRecentActivity(bill: Bill): boolean {
  if (!bill.latest_action_date) {
    return false;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return new Date(bill.latest_action_date) > thirtyDaysAgo;
}
