import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const database = admin.firestore();

export default functions.firestore.document('groups/{groupId}/resources/{resourceId}/grades/{answerId}')
  .onUpdate(async (snapshot, context): Promise<void> => {
  const groupReference = database.collection('groups').doc(context.params.groupId);
  const groupData = (await groupReference.get()).data();

  if (!groupData) throw new Error('Unknown group');

  if (!groupData.students || groupData.students.length === 0) return;

  const data = snapshot.after.data();

  if (!data) throw new Error('No data');

  const notificationReference = database.collection('notifications').doc();
  await notificationReference.set({
    date: admin.firestore.FieldValue.serverTimestamp(),
    userId: data.userId,
    read: false,
    type: 'edit-grade',
    groupId: context.params.groupId,
    resourceId: context.params.resourceId,
    answerId: context.params.answerId,
    points: data.points,
  });
});
