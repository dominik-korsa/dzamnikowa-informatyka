import * as admin from 'firebase-admin';

export default async function sendNotification (userId: string, title: string, body: string, link: string) {
  const userData = (await admin.firestore().collection('user-data').doc(userId).get()).data();

  const tokens: string[] = userData?.firebaseMessagingTokens || [];

  const message = {
    data: {
      title,
      body,
      link,
    },
  };

  await admin.messaging().sendToDevice(tokens, message);
}
