// Firebase exports - single import point for all Firebase functionality

// Firebase app and core services
export { app, db, analytics } from './config';

// Firestore service and utilities
export { firestoreService, Timestamp, serverTimestamp } from './firestore';

// Collection services
export {
  COLLECTIONS,
  userService,
  savedBillsService,
  savedSearchesService,
  alertsService,
  commentsService,
  type UserProfile,
  type SavedBill,
  type SavedSearch,
  type UserAlert,
  type BillComment,
} from './collections';

// Bill caching service
export {
  billCacheService,
  type CachedBill,
  type RecentSearch,
} from './billCache';

// Dashboard caching service
export {
  dashboardCacheService,
  type DashboardStats,
  type GeminiAnalysisCache,
} from './dashboardCache';
