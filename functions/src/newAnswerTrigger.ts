import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const database = admin.firestore();

export default functions.firestore.document('groups/{groupId}/resources/{resourceId}/answers/{answerId}')
  .onCreate(async (snapshot, context): Promise<void> => {
  const groupReference = database.collection('groups').doc(context.params.groupId);
  const groupData = (await groupReference.get()).data();

  if (!groupData) throw new Error('Unknown group');

  if (!groupData.teachers || groupData.teachers.length === 0) return;

  const data = snapshot.data();

  if (!data) throw new Error('No data');

  const batch = database.batch();
  groupData.teachers.forEach((teacherId: string) => {
    const notificationReference = database.collection('notifications').doc();
    batch.set(notificationReference, {
      date: admin.firestore.FieldValue.serverTimestamp(),
      userId: teacherId,
      read: false,
      type: 'new-answer',
      groupId: context.params.groupId,
      resourceId: context.params.resourceId,
      answerId: context.params.answerId,
      answerUserId: data.userId,
    });
  });

  await batch.commit();
});
