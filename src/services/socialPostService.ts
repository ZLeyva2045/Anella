// src/services/socialPostService.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { SocialPost } from '@/types/firestore';

const postsCollection = collection(db, 'socialPosts');

type PostData = Omit<SocialPost, 'id' | 'createdAt'>;

/**
 * Saves or updates a social media post.
 * @param postId The ID of the post to update, or undefined to create a new one.
 * @param data The post data.
 */
export async function saveSocialPost(
  postId: string | undefined,
  data: PostData
): Promise<string> {
  if (postId) {
    const postRef = doc(db, 'socialPosts', postId);
    await updateDoc(postRef, data);
    return postId;
  } else {
    const newPostData = {
      ...data,
      createdAt: serverTimestamp(),
    };
    const newDocRef = await addDoc(postsCollection, newPostData);
    return newDocRef.id;
  }
}

/**
 * Deletes a social media post.
 * @param postId The ID of the post to delete.
 */
export async function deleteSocialPost(postId: string): Promise<void> {
  const postRef = doc(db, 'socialPosts', postId);
  await deleteDoc(postRef);
}
