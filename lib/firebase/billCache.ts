// Bill caching service using Firebase Firestore
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Cached Bill Structure
 */
export interface CachedBill {
  id: string;
  billId: string;
  billType: 'state' | 'federal';
  title: string;
  summary?: string;
  status?: string;
  jurisdiction?: string;
  sponsor?: string;
  lastAction?: string;
  lastActionDate?: string;
  url?: string;
  fullData: any; // Complete bill data from API
  accessCount: number;
  lastAccessed: Timestamp;
  cachedAt: Timestamp;
  expiresAt: Timestamp;
}

/**
 * Recent Search Entry
 */
export interface RecentSearch {
  id: string;
  userId?: string;
  searchQuery: string;
  searchType: 'state' | 'federal';
  jurisdiction?: string;
  resultsCount: number;
  timestamp: Timestamp;
}

const COLLECTIONS = {
  CACHED_BILLS: 'cachedBills',
  RECENT_SEARCHES: 'recentSearches',
  USER_BILL_HISTORY: 'userBillHistory',
} as const;

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Bill Cache Service
 */
export class BillCacheService {
  /**
   * Cache a bill in Firestore
   */
  async cacheBill(
    billId: string,
    billType: 'state' | 'federal',
    billData: any
  ): Promise<void> {
    try {
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(now.toMillis() + CACHE_DURATION_MS);

      const cachedBill: Omit<CachedBill, 'id'> = {
        billId,
        billType,
        title: billData.title || billData.name || 'Untitled Bill',
        summary: billData.summary || billData.description,
        status: billData.status || billData.latestAction?.description,
        jurisdiction: billData.jurisdiction || billData.state,
        sponsor: billData.sponsor?.name || billData.sponsorName,
        lastAction: billData.latestAction?.description || billData.lastAction,
        lastActionDate: billData.latestAction?.date || billData.lastActionDate,
        url: billData.url,
        fullData: billData,
        accessCount: 1,
        lastAccessed: now,
        cachedAt: now,
        expiresAt,
      };

      const docRef = doc(db, COLLECTIONS.CACHED_BILLS, billId);
      await setDoc(docRef, cachedBill, { merge: true });

      console.log(`✅ Cached bill: ${billId}`);
    } catch (error) {
      console.error('Error caching bill:', error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Get a cached bill
   */
  async getCachedBill(billId: string): Promise<CachedBill | null> {
    try {
      const docRef = doc(db, COLLECTIONS.CACHED_BILLS, billId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const bill = { id: docSnap.id, ...docSnap.data() } as CachedBill;

      // Check if cache is expired
      const now = Timestamp.now();
      if (bill.expiresAt.toMillis() < now.toMillis()) {
        console.log(`⏰ Cache expired for bill: ${billId}`);
        return null;
      }

      // Update access count and last accessed time
      await setDoc(
        docRef,
        {
          accessCount: bill.accessCount + 1,
          lastAccessed: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`✅ Retrieved cached bill: ${billId}`);
      return bill;
    } catch (error) {
      console.error('Error getting cached bill:', error);
      return null;
    }
  }

  /**
   * Get recently accessed bills
   */
  async getRecentlyAccessedBills(limitCount: number = 10): Promise<CachedBill[]> {
    try {
      const billsRef = collection(db, COLLECTIONS.CACHED_BILLS);
      const q = query(
        billsRef,
        orderBy('lastAccessed', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const bills = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CachedBill[];

      // Filter out expired bills
      const now = Timestamp.now();
      return bills.filter(bill => bill.expiresAt.toMillis() > now.toMillis());
    } catch (error) {
      console.error('Error getting recently accessed bills:', error);
      return [];
    }
  }

  /**
   * Get most accessed bills (trending)
   */
  async getMostAccessedBills(limitCount: number = 10): Promise<CachedBill[]> {
    try {
      const billsRef = collection(db, COLLECTIONS.CACHED_BILLS);
      const q = query(
        billsRef,
        orderBy('accessCount', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const bills = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CachedBill[];

      // Filter out expired bills
      const now = Timestamp.now();
      return bills.filter(bill => bill.expiresAt.toMillis() > now.toMillis());
    } catch (error) {
      console.error('Error getting most accessed bills:', error);
      return [];
    }
  }

  /**
   * Save a search query
   */
  async saveSearch(
    searchQuery: string,
    searchType: 'state' | 'federal',
    resultsCount: number,
    jurisdiction?: string,
    userId?: string
  ): Promise<void> {
    try {
      const searchData: Omit<RecentSearch, 'id'> = {
        userId,
        searchQuery,
        searchType,
        jurisdiction,
        resultsCount,
        timestamp: Timestamp.now(),
      };

      const searchesRef = collection(db, COLLECTIONS.RECENT_SEARCHES);
      await setDoc(doc(searchesRef), searchData);

      console.log(`✅ Saved search: "${searchQuery}"`);
    } catch (error) {
      console.error('Error saving search:', error);
      // Don't throw - search tracking is optional
    }
  }

  /**
   * Get recent searches
   */
  async getRecentSearches(limitCount: number = 10, userId?: string): Promise<RecentSearch[]> {
    try {
      const searchesRef = collection(db, COLLECTIONS.RECENT_SEARCHES);
      let q;

      if (userId) {
        q = query(
          searchesRef,
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          searchesRef,
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecentSearch[];
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  /**
   * Track user bill view (for personalized recommendations)
   */
  async trackBillView(billId: string, userId?: string): Promise<void> {
    if (!userId) return;

    try {
      const historyRef = collection(db, COLLECTIONS.USER_BILL_HISTORY);
      const docId = `${userId}_${billId}`;

      await setDoc(
        doc(historyRef, docId),
        {
          userId,
          billId,
          viewCount: 1,
          lastViewed: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error tracking bill view:', error);
    }
  }

  /**
   * Get user's bill history
   */
  async getUserBillHistory(userId: string, limitCount: number = 20): Promise<any[]> {
    try {
      const historyRef = collection(db, COLLECTIONS.USER_BILL_HISTORY);
      const q = query(
        historyRef,
        where('userId', '==', userId),
        orderBy('lastViewed', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user bill history:', error);
      return [];
    }
  }

  /**
   * Clear expired cache entries (run periodically)
   */
  async clearExpiredCache(): Promise<number> {
    try {
      const billsRef = collection(db, COLLECTIONS.CACHED_BILLS);
      const now = Timestamp.now();
      const querySnapshot = await getDocs(billsRef);

      let deletedCount = 0;
      const deletePromises: Promise<void>[] = [];

      querySnapshot.docs.forEach(docSnap => {
        const bill = docSnap.data() as CachedBill;
        if (bill.expiresAt.toMillis() < now.toMillis()) {
          deletePromises.push(deleteDoc(docSnap.ref));
          deletedCount++;
        }
      });

      await Promise.all(deletePromises);
      console.log(`🗑️ Cleared ${deletedCount} expired cache entries`);
      return deletedCount;
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const billCacheService = new BillCacheService();
