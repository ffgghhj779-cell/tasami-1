import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from './firebase';

export async function submitContractQuote(input: {
  packageType: string;
  companyName: string;
  phone: string;
  requiredService: string;
}): Promise<void> {
  let user = auth.currentUser;
  if (!user) {
    const cred = await signInAnonymously(auth);
    user = cred.user;
  }

  const message = [
    `الشركة: ${input.companyName}`,
    `الجوال: ${input.phone}`,
    `الخدمة المطلوبة: ${input.requiredService}`,
  ].join('\n');

  await addDoc(collection(db, 'contracts'), {
    userId: user.uid,
    packageType: input.packageType,
    message,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}
