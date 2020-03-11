import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { random } from 'lodash';

admin.initializeApp();

const database = admin.firestore();

function generateRandomCode(): number {
  return random(10000000, 99999999, false);
}

export const generateNewJoinCode = functions.https.onCall(async (data, context) => {
  if (!data.groupId) {
    throw new functions.https.HttpsError('invalid-argument', 'Parameter groupId not provided');
  } if (!data.role) {
    throw new functions.https.HttpsError('invalid-argument', 'Parameter role not provided');
  } if (!['teacher', 'student'].includes(data.role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Only "student" and "teacher" values are accepted for role parameter')
  }

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'This function requires auth');
  }

  const groupSnapshot = await database.collection('groups').doc(data.groupId).get();
  if (!groupSnapshot.exists) {
    throw new functions.https.HttpsError('not-found', 'Group doesn\'t exist');
  } if (!groupSnapshot.data()?.teachers?.includes(context.auth.uid)) {
    throw new functions.https.HttpsError('permission-denied', 'User must be the teacher of the group');
  }

  const collectionReference = database.collection('group-join-codes');
  let code: number;
  do {
    code = generateRandomCode();
  } while ((await collectionReference.doc(code.toString(10)).get()).exists)

  await collectionReference.doc(code.toString(10)).set({
    group: database.collection('groups').doc(data.groupId),
    uses: [],
    role: data.role,
    maxUses: data.maxUses ?? null,
  });

  return code;
});
