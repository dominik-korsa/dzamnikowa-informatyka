import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import sendNotification from "./sendNotification";

const database = admin.firestore();

export default functions.firestore.document('groups/{groupId}/resources/{resourceId}')
  .onCreate(async (snapshot, context): Promise<void> => {
    const groupReference = database.collection('groups').doc(context.params.groupId);
    const groupData = (await groupReference.get()).data();

    if (!groupData) throw new Error('Unknown group');

    if (!groupData.students || groupData.students.length === 0) return;

    const data = snapshot.data();

    if (!data) throw new Error('No data');

    const batch = database.batch();
    await Promise.all(groupData.students.map(async (studentId: string) => {
      const notificationReference = database.collection('notifications').doc();
      batch.set(notificationReference, {
        date: admin.firestore.FieldValue.serverTimestamp(),
        userId: studentId,
        read: false,
        type: 'new-resource',
        groupId: context.params.groupId,
        resourceId: context.params.resourceId,
      });

      await sendNotification(
        studentId,
        'Dodano nowy materiał',
        `${data.name}\n` +
        `Grupa: ${groupData.name}`,
        `/grupy/${context.params.groupId}/zasoby/${context.params.resourceId}`,
      );
    }));

    await batch.commit();
  });
