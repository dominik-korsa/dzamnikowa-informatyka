import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import sendNotification from "./sendNotification";

const database = admin.firestore();

export default functions.firestore.document('groups/{groupId}/resources/{resourceId}/answers/{answerId}')
  .onCreate(async (snapshot, context): Promise<void> => {
    const groupReference = database.collection('groups').doc(context.params.groupId);
    const groupData = (await groupReference.get()).data();

    if (!groupData) throw new Error('Unknown group');

    if (!groupData.teachers || groupData.teachers.length === 0) return;

    const data = snapshot.data();

    if (!data) throw new Error('No data');

    const answerUserReference = database.collection('users').doc(data.userId);
    const answerUserData = (await answerUserReference.get()).data();

    if (!answerUserData) throw new Error('Unknown answer user');

    const resourceReference = database.doc(`groups/${context.params.groupId}/resources/${context.params.resourceId}`);
    const resourceData = (await resourceReference.get()).data();

    if (!resourceData) throw new Error('Unknown resource');

    const batch = database.batch();
    await Promise.all(groupData.teachers.map(async (teacherId: string) => {
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

      await sendNotification(
        teacherId,
        'Nowe rozwiązanie do sprawdzenia',
        `${answerUserData.displayName} wysłał rozwiązanie do zadania ${resourceData.name}\nGrupa: ${groupData.name}`,
        `/grupy/${context.params.groupId}/zasoby/${context.params.resourceId}/ocenianie/${context.params.answerId}`,
      );
    }));

    await batch.commit();
  });
