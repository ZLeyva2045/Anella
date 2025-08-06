// src/services/payrollService.ts
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Evaluation } from '@/types/firestore';

type EvaluationData = Omit<Evaluation, 'id' | 'createdAt'> & { createdAt: Date };

/**
 * Saves a performance evaluation to the 'evaluations' collection.
 * @param data - The evaluation data to be saved.
 */
export async function saveEvaluation(data: EvaluationData): Promise<string> {
  const evaluationWithTimestamp = {
    ...data,
    createdAt: Timestamp.fromDate(data.createdAt),
  };

  const newDocRef = await addDoc(collection(db, 'evaluations'), evaluationWithTimestamp);
  return newDocRef.id;
}
