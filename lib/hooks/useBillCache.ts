// React hook for bill caching
import { useState, useEffect } from 'react';
import { billCacheService, type CachedBill } from '@/lib/firebase/billCache';

/**
 * Hook to get or cache a bill
 */
export function useBillCache(billId: string | null, billType: 'state' | 'federal') {
  const [cachedBill, setCachedBill] = useState<CachedBill | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!billId) {
      setCachedBill(null);
      setIsLoading(false);
      return;
    }

    async function loadCachedBill() {
      setIsLoading(true);
      try {
        const bill = await billCacheService.getCachedBill(billId);
        setCachedBill(bill);
      } catch (error) {
        console.error('Error loading cached bill:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCachedBill();
  }, [billId]);

  const cacheBill = async (billData: any) => {
    if (!billId) return;
    await billCacheService.cacheBill(billId, billType, billData);
  };

  return { cachedBill, isLoading, cacheBill };
}

/**
 * Hook to get recently accessed bills
 */
export function useRecentBills(limit: number = 10) {
  const [recentBills, setRecentBills] = useState<CachedBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecentBills() {
      try {
        const bills = await billCacheService.getRecentlyAccessedBills(limit);
        setRecentBills(bills);
      } catch (error) {
        console.error('Error loading recent bills:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecentBills();
  }, [limit]);

  return { recentBills, isLoading };
}

/**
 * Hook to get trending bills (most accessed)
 */
export function useTrendingBills(limit: number = 10) {
  const [trendingBills, setTrendingBills] = useState<CachedBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrendingBills() {
      try {
        const bills = await billCacheService.getMostAccessedBills(limit);
        setTrendingBills(bills);
      } catch (error) {
        console.error('Error loading trending bills:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTrendingBills();
  }, [limit]);

  return { trendingBills, isLoading };
}
