// src/services/expenseService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Expense } from '@/types/firestore';

type ExpenseData = Omit<Expense, 'id' | 'createdAt'>;

export async function saveExpense(
  expenseId: string | undefined,
  data: ExpenseData
): Promise<string> {
  if (expenseId) {
    const expenseRef = doc(db, 'expenses', expenseId);
    await setDoc(expenseRef, data, { merge: true });
    return expenseId;
  } else {
    const newExpenseData = {
      ...data,
      createdAt: serverTimestamp(),
    };
    const expensesCollection = collection(db, 'expenses');
    const newDocRef = await addDoc(expensesCollection, newExpenseData);
    return newDocRef.id;
  }
}
