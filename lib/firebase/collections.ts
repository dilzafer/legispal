// Firestore collection services for Oversight USA
import { firestoreService, Timestamp } from './firestore';
import { where, orderBy, limit } from 'firebase/firestore';

/**
 * Collection names
 */
export const COLLECTIONS = {
  USERS: 'users',
  SAVED_BILLS: 'savedBills',
  SAVED_SEARCHES: 'savedSearches',
  USER_ALERTS: 'userAlerts',
  BILL_COMMENTS: 'billComments',
  REPRESENTATIVE_NOTES: 'representativeNotes',
  ANALYTICS: 'analytics',
} as const;

/**
 * User Profile
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  location?: {
    city: string;
    state: string;
    zip: string;
  };
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    favoriteTopics: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Saved Bill
 */
export interface SavedBill {
  id: string;
  userId: string;
  billId: string;
  billTitle: string;
  billType: 'state' | 'federal';
  jurisdiction?: string;
  notes?: string;
  tags?: string[];
  savedAt: Timestamp;
}

/**
 * Saved Search
 */
export interface SavedSearch {
  id: string;
  userId: string;
  searchQuery: string;
  filters: {
    jurisdiction?: string;
    billType?: string;
    dateRange?: string;
  };
  name: string;
  createdAt: Timestamp;
}

/**
 * User Alert
 */
export interface UserAlert {
  id: string;
  userId: string;
  type: 'bill_update' | 'representative_vote' | 'new_bill' | 'custom';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Timestamp;
}

/**
 * Bill Comment
 */
export interface BillComment {
  id: string;
  userId: string;
  userName: string;
  billId: string;
  comment: string;
  sentiment: 'support' | 'oppose' | 'neutral';
  likes: number;
  createdAt: Timestamp;
}

/**
 * User Service - Manage user profiles
 */
export class UserService {
  async getUser(userId: string): Promise<UserProfile | null> {
    return firestoreService.getDocument<UserProfile>(COLLECTIONS.USERS, userId);
  }

  async createUser(userId: string, data: Partial<UserProfile>): Promise<void> {
    await firestoreService.setDocument(COLLECTIONS.USERS, userId, data);
  }

  async updateUser(userId: string, data: Partial<UserProfile>): Promise<void> {
    await firestoreService.updateDocument(COLLECTIONS.USERS, userId, data);
  }
}

/**
 * Saved Bills Service
 */
export class SavedBillsService {
  async getSavedBills(userId: string): Promise<SavedBill[]> {
    return firestoreService.queryDocuments<SavedBill>(
      COLLECTIONS.SAVED_BILLS,
      [{ field: 'userId', operator: '==', value: userId }],
      'savedAt',
      'desc'
    );
  }

  async saveBill(data: Omit<SavedBill, 'id'>): Promise<string> {
    return firestoreService.createDocument(COLLECTIONS.SAVED_BILLS, data);
  }

  async unsaveBill(billId: string): Promise<void> {
    await firestoreService.deleteDocument(COLLECTIONS.SAVED_BILLS, billId);
  }

  async isBillSaved(userId: string, billId: string): Promise<boolean> {
    const saved = await firestoreService.queryDocuments<SavedBill>(
      COLLECTIONS.SAVED_BILLS,
      [
        { field: 'userId', operator: '==', value: userId },
        { field: 'billId', operator: '==', value: billId }
      ]
    );
    return saved.length > 0;
  }
}

/**
 * Saved Searches Service
 */
export class SavedSearchesService {
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return firestoreService.queryDocuments<SavedSearch>(
      COLLECTIONS.SAVED_SEARCHES,
      [{ field: 'userId', operator: '==', value: userId }],
      'createdAt',
      'desc'
    );
  }

  async saveSearch(data: Omit<SavedSearch, 'id'>): Promise<string> {
    return firestoreService.createDocument(COLLECTIONS.SAVED_SEARCHES, data);
  }

  async deleteSearch(searchId: string): Promise<void> {
    await firestoreService.deleteDocument(COLLECTIONS.SAVED_SEARCHES, searchId);
  }
}

/**
 * Alerts Service
 */
export class AlertsService {
  async getUserAlerts(userId: string, unreadOnly: boolean = false): Promise<UserAlert[]> {
    const filters = [{ field: 'userId', operator: '==' as const, value: userId }];
    
    if (unreadOnly) {
      filters.push({ field: 'read', operator: '==', value: false });
    }

    return firestoreService.queryDocuments<UserAlert>(
      COLLECTIONS.USER_ALERTS,
      filters,
      'createdAt',
      'desc',
      50
    );
  }

  async createAlert(data: Omit<UserAlert, 'id'>): Promise<string> {
    return firestoreService.createDocument(COLLECTIONS.USER_ALERTS, data);
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await firestoreService.updateDocument(COLLECTIONS.USER_ALERTS, alertId, { read: true });
  }

  async markAllAlertsAsRead(userId: string): Promise<void> {
    const alerts = await this.getUserAlerts(userId, true);
    await Promise.all(
      alerts.map(alert => this.markAlertAsRead(alert.id))
    );
  }
}

/**
 * Comments Service
 */
export class CommentsService {
  async getBillComments(billId: string, limitCount: number = 50): Promise<BillComment[]> {
    return firestoreService.queryDocuments<BillComment>(
      COLLECTIONS.BILL_COMMENTS,
      [{ field: 'billId', operator: '==', value: billId }],
      'createdAt',
      'desc',
      limitCount
    );
  }

  async addComment(data: Omit<BillComment, 'id'>): Promise<string> {
    return firestoreService.createDocument(COLLECTIONS.BILL_COMMENTS, data);
  }

  async deleteComment(commentId: string): Promise<void> {
    await firestoreService.deleteDocument(COLLECTIONS.BILL_COMMENTS, commentId);
  }

  async likeComment(commentId: string): Promise<void> {
    const comment = await firestoreService.getDocument<BillComment>(
      COLLECTIONS.BILL_COMMENTS,
      commentId
    );
    if (comment) {
      await firestoreService.updateDocument(COLLECTIONS.BILL_COMMENTS, commentId, {
        likes: comment.likes + 1
      });
    }
  }
}

// Export service instances
export const userService = new UserService();
export const savedBillsService = new SavedBillsService();
export const savedSearchesService = new SavedSearchesService();
export const alertsService = new AlertsService();
export const commentsService = new CommentsService();
