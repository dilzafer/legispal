// Dashboard widget caching service using Firebase Firestore
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Dashboard Stats Cache
 */
export interface DashboardStats {
  id: string;
  activeBills: {
    total: number;
    federal: number;
    state: number;
    trend: 'up' | 'down' | 'stable';
    percentChange: number;
  };
  lobbyingActivity: {
    totalSpent: number;
    activeLobbies: number;
    topIndustries: string[];
    trend: 'up' | 'down' | 'stable';
    percentChange: number;
  };
  citizenEngagement: {
    totalComments: number;
    activeUsers: number;
    topIssues: string[];
    trend: 'up' | 'down' | 'stable';
    percentChange: number;
  };
  cachedAt: Timestamp;
  expiresAt: Timestamp;
}

/**
 * Gemini Analysis Cache
 */
export interface GeminiAnalysisCache {
  id: string;
  type: 'news' | 'analysis' | 'trends';
  content: string;
  metadata?: any;
  cachedAt: Timestamp;
  expiresAt: Timestamp;
}

const COLLECTIONS = {
  DASHBOARD_STATS: 'dashboardStats',
  GEMINI_CACHE: 'geminiCache',
} as const;

// Cache durations
const DASHBOARD_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
const GEMINI_CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Dashboard Cache Service
 */
export class DashboardCacheService {
  /**
   * Cache dashboard stats
   */
  async cacheDashboardStats(stats: Omit<DashboardStats, 'id' | 'cachedAt' | 'expiresAt'>): Promise<void> {
    try {
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(now.toMillis() + DASHBOARD_CACHE_DURATION);

      const cacheData: Omit<DashboardStats, 'id'> = {
        ...stats,
        cachedAt: now,
        expiresAt,
      };

      const docRef = doc(db, COLLECTIONS.DASHBOARD_STATS, 'current');
      await setDoc(docRef, cacheData);

      console.log('✅ Dashboard stats cached');
    } catch (error) {
      console.error('Error caching dashboard stats:', error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Get cached dashboard stats
   */
  async getCachedDashboardStats(): Promise<DashboardStats | null> {
    try {
      const docRef = doc(db, COLLECTIONS.DASHBOARD_STATS, 'current');
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log('📊 No cached dashboard stats found');
        return null;
      }

      const stats = { id: docSnap.id, ...docSnap.data() } as DashboardStats;

      // Check if cache is expired
      const now = Timestamp.now();
      if (stats.expiresAt.toMillis() < now.toMillis()) {
        console.log('⏰ Dashboard stats cache expired');
        return null;
      }

      console.log('✅ Retrieved cached dashboard stats');
      return stats;
    } catch (error) {
      console.error('Error getting cached dashboard stats:', error);
      return null;
    }
  }

  /**
   * Cache Gemini analysis
   */
  async cacheGeminiAnalysis(
    type: 'news' | 'analysis' | 'trends',
    content: string,
    metadata?: any
  ): Promise<void> {
    try {
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(now.toMillis() + GEMINI_CACHE_DURATION);

      const cacheData: Omit<GeminiAnalysisCache, 'id'> = {
        type,
        content,
        metadata,
        cachedAt: now,
        expiresAt,
      };

      const docRef = doc(db, COLLECTIONS.GEMINI_CACHE, type);
      await setDoc(docRef, cacheData);

      console.log(`✅ Gemini ${type} cached`);
    } catch (error) {
      console.error(`Error caching Gemini ${type}:`, error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Get cached Gemini analysis
   */
  async getCachedGeminiAnalysis(type: 'news' | 'analysis' | 'trends'): Promise<GeminiAnalysisCache | null> {
    try {
      const docRef = doc(db, COLLECTIONS.GEMINI_CACHE, type);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log(`📊 No cached Gemini ${type} found`);
        return null;
      }

      const analysis = { id: docSnap.id, ...docSnap.data() } as GeminiAnalysisCache;

      // Check if cache is expired
      const now = Timestamp.now();
      if (analysis.expiresAt.toMillis() < now.toMillis()) {
        console.log(`⏰ Gemini ${type} cache expired`);
        return null;
      }

      console.log(`✅ Retrieved cached Gemini ${type}`);
      return analysis;
    } catch (error) {
      console.error(`Error getting cached Gemini ${type}:`, error);
      return null;
    }
  }

  /**
   * Cache active bills count
   */
  async cacheActiveBills(total: number, federal: number, state: number, trend: 'up' | 'down' | 'stable', percentChange: number): Promise<void> {
    try {
      const cached = await this.getCachedDashboardStats();
      const stats = cached || {
        activeBills: { total: 0, federal: 0, state: 0, trend: 'stable' as const, percentChange: 0 },
        lobbyingActivity: { totalSpent: 0, activeLobbies: 0, topIndustries: [], trend: 'stable' as const, percentChange: 0 },
        citizenEngagement: { totalComments: 0, activeUsers: 0, topIssues: [], trend: 'stable' as const, percentChange: 0 },
      };

      await this.cacheDashboardStats({
        ...stats,
        activeBills: { total, federal, state, trend, percentChange },
      });
    } catch (error) {
      console.error('Error caching active bills:', error);
    }
  }

  /**
   * Cache lobbying activity
   */
  async cacheLobbyingActivity(
    totalSpent: number,
    activeLobbies: number,
    topIndustries: string[],
    trend: 'up' | 'down' | 'stable',
    percentChange: number
  ): Promise<void> {
    try {
      const cached = await this.getCachedDashboardStats();
      const stats = cached || {
        activeBills: { total: 0, federal: 0, state: 0, trend: 'stable' as const, percentChange: 0 },
        lobbyingActivity: { totalSpent: 0, activeLobbies: 0, topIndustries: [], trend: 'stable' as const, percentChange: 0 },
        citizenEngagement: { totalComments: 0, activeUsers: 0, topIssues: [], trend: 'stable' as const, percentChange: 0 },
      };

      await this.cacheDashboardStats({
        ...stats,
        lobbyingActivity: { totalSpent, activeLobbies, topIndustries, trend, percentChange },
      });
    } catch (error) {
      console.error('Error caching lobbying activity:', error);
    }
  }

  /**
   * Cache citizen engagement
   */
  async cacheCitizenEngagement(
    totalComments: number,
    activeUsers: number,
    topIssues: string[],
    trend: 'up' | 'down' | 'stable',
    percentChange: number
  ): Promise<void> {
    try {
      const cached = await this.getCachedDashboardStats();
      const stats = cached || {
        activeBills: { total: 0, federal: 0, state: 0, trend: 'stable' as const, percentChange: 0 },
        lobbyingActivity: { totalSpent: 0, activeLobbies: 0, topIndustries: [], trend: 'stable' as const, percentChange: 0 },
        citizenEngagement: { totalComments: 0, activeUsers: 0, topIssues: [], trend: 'stable' as const, percentChange: 0 },
      };

      await this.cacheDashboardStats({
        ...stats,
        citizenEngagement: { totalComments, activeUsers, topIssues, trend, percentChange },
      });
    } catch (error) {
      console.error('Error caching citizen engagement:', error);
    }
  }
}

// Export singleton instance
export const dashboardCacheService = new DashboardCacheService();
