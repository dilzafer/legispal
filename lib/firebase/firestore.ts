// Firestore database service with common operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  DocumentData,
  QueryConstraint,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Firestore Service - Common database operations
 */
export class FirestoreService {
  /**
   * Get a single document by ID
   */
  async getDocument<T = DocumentData>(
    collectionName: string,
    documentId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get all documents from a collection
   */
  async getCollection<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document with auto-generated ID
   */
  async createDocument<T = DocumentData>(
    collectionName: string,
    data: T
  ): Promise<string> {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Set a document with a specific ID (creates or overwrites)
   */
  async setDocument<T = DocumentData>(
    collectionName: string,
    documentId: string,
    data: T,
    merge: boolean = false
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge });
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument<T = Partial<DocumentData>>(
    collectionName: string,
    documentId: string,
    data: T
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(
    collectionName: string,
    documentId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Query documents with filters
   */
  async queryDocuments<T = DocumentData>(
    collectionName: string,
    filters: {
      field: string;
      operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any';
      value: any;
    }[],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const constraints: QueryConstraint[] = [];

      // Add where clauses
      filters.forEach(filter => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });

      // Add orderBy
      if (orderByField) {
        constraints.push(orderBy(orderByField, orderDirection));
      }

      // Add limit
      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error querying documents from ${collectionName}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();

// Export Firestore utilities
export { Timestamp, serverTimestamp };
