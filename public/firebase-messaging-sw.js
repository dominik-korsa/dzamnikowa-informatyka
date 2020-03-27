/* eslint-disable no-undef, no-restricted-globals */
importScripts('https://www.gstatic.com/firebasejs/7.12.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.12.0/firebase-messaging.js');

const config = {
  apiKey: 'AIzaSyBc_Se8BkU2fsyzvhmSZU1gA8Yk1Rb6Id8',
  authDomain: 'dzamnikowa-informatyka.firebaseapp.com',
  databaseURL: 'https://dzamnikowa-informatyka.firebaseio.com',
  projectId: 'dzamnikowa-informatyka',
  storageBucket: 'dzamnikowa-informatyka.appspot.com',
  messagingSenderId: '455246737234',
  appId: '1:455246737234:web:618f2d25515c1518de148b',
};

firebase.initializeApp(config);

const messaging = firebase.messaging();

console.log('Registered service worker');

messaging.setBackgroundMessageHandler((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationOptions = {
    body: payload.data.body,
    data: {
      link: payload.data.link,
    },
  };

  return self.registration.showNotification(payload.data.title,
    notificationOptions);
});

self.onnotificationclick = (event) => {
  event.notification.close();

  event.waitUntil(clients.matchAll({
    type: 'window',
  }).then((clientList) => {
    for (let i = 0; i < clientList.length; i += 1) {
      const client = clientList[i];
      if (client.url === event.notification.data.link && 'focus' in client) {
        client.focus();
        return;
      }
    }
    if (clients.openWindow) {
      clients.openWindow(event.notification.data.link);
    }
  }));
};
