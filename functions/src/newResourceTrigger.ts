import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const database = admin.firestore();

export default functions.firestore.document('groups/{groupId}/resources/{resourceId}')
  .onCreate(async (snapshot, context): Promise<void> => {
  const groupReference = database.collection('groups').doc(context.params.groupId);
  const groupData = (await groupReference.get()).data();

  if (!groupData) throw new Error('Unknown group');

  if (!groupData.students || groupData.students.length === 0) return;

  const batch = database.batch();
  groupData.students.forEach((studentId: string) => {
    const notificationReference = database.collection('notifications').doc();
    batch.set(notificationReference, {
      date: admin.firestore.FieldValue.serverTimestamp(),
      userId: studentId,
      read: false,
      type: 'new-resource',
      groupId: context.params.groupId,
      resourceId: context.params.resourceId,
    });
  });

  await batch.commit();
});
