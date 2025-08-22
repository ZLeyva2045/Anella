// src/services/payrollService.ts
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Evaluation, Feedback } from '@/types/firestore';

type EvaluationData = Omit<Evaluation, 'id' | 'createdAt'>;
type FeedbackData = Omit<Feedback, 'id' | 'createdAt'> & { createdAt: Date };

/**
 * Saves or updates a performance evaluation in the 'evaluations' collection.
 * @param data - The evaluation data to be saved.
 * @param evaluationId - The ID of the evaluation to update (optional).
 */
export async function saveEvaluation(data: EvaluationData, evaluationId?: string): Promise<string> {
  const evaluationWithTimestamp = {
    ...data,
    createdAt: data.createdAt ? Timestamp.fromDate(data.createdAt as Date) : serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (evaluationId) {
    const docRef = doc(db, 'evaluations', evaluationId);
    await setDoc(docRef, evaluationWithTimestamp, { merge: true });
    return evaluationId;
  } else {
    const newDocRef = await addDoc(collection(db, 'evaluations'), evaluationWithTimestamp);
    return newDocRef.id;
  }
}

/**
 * Fetches evaluations based on employee and period.
 * @param employeeId - The ID of the employee.
 * @param period - The evaluation period (e.g., "Agosto 2024").
 */
export async function getEvaluations(employeeId: string, period: string): Promise<Evaluation[]> {
    const q = query(
        collection(db, 'evaluations'),
        where('employeeId', '==', employeeId),
        where('period', '==', period)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evaluation));
}


/**
 * Deletes a performance evaluation.
 * @param evaluationId - The ID of the evaluation to delete.
 */
export async function deleteEvaluation(evaluationId: string): Promise<void> {
    const docRef = doc(db, 'evaluations', evaluationId);
    await deleteDoc(docRef);
}


/**
 * Saves a feedback entry to the 'feedback' collection.
 * @param data - The feedback data to be saved.
 */
export async function saveFeedback(data: FeedbackData): Promise<string> {
    const feedbackWithTimestamp = {
        ...data,
        createdAt: Timestamp.fromDate(data.createdAt),
    };
    
    const newDocRef = await addDoc(collection(db, 'feedback'), feedbackWithTimestamp);
    return newDocRef.id;
}
