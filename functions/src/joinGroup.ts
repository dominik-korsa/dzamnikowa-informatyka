import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const database = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  if (!data.code) {
    throw new functions.https.HttpsError('invalid-argument', 'Parameter code not provided');
  }

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'This function requires auth');
  }

  const codeReference = database.collection('group-join-codes').doc(data.code);
  const codeSnapshot = await codeReference.get();

  if (!codeSnapshot.exists) {
    return {
      success: false,
      reason: 'unknown-code',
    };
  } else if (codeSnapshot.data()!.maxUses !== null && codeSnapshot.data()!.uses.length >= codeSnapshot.data()!.maxUses) {
    return {
      success: false,
      reason: 'use-limit-reached',
    }
  }

  const groupReference = (await codeSnapshot.data())!.group;
  const groupSnapshot = await groupReference.get();
  if (!groupSnapshot.exists) {
    throw new functions.https.HttpsError('not-found', 'Group doesn\'t exist');
  }

  if (codeSnapshot.data()!.role === 'student') {
    if (groupSnapshot.data()?.students?.includes(context.auth.uid)) {
      return {
        success: false,
        reason: 'already-joined',
      }
    }

    await groupReference.update({
      students: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
    })
  } else if (codeSnapshot.data()!.role === 'teacher') {
    if (groupSnapshot.data()?.teachers?.includes(context.auth.uid)) {
      return {
        success: false,
        reason: 'already-joined',
      }
    }

    await groupReference.update({
      teachers: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
    })
  }

  await codeReference.update({
    uses: admin.firestore.FieldValue.arrayUnion(context.auth.uid),
  })

  return {
    success: true,
    groupId: groupReference.id,
  };
});
