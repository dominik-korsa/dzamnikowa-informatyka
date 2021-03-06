/* eslint-disable no-param-reassign */
import privacyPolicyConfig from '@/privacy-policy-config';
import store from '@/store';
import Firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';
import 'firebase/messaging';

const config = {
  apiKey: 'AIzaSyBc_Se8BkU2fsyzvhmSZU1gA8Yk1Rb6Id8',
  authDomain: 'dzamnikowa-informatyka.firebaseapp.com',
  databaseURL: 'https://dzamnikowa-informatyka.firebaseio.com',
  projectId: 'dzamnikowa-informatyka',
  storageBucket: 'dzamnikowa-informatyka.appspot.com',
  messagingSenderId: '455246737234',
  appId: '1:455246737234:web:618f2d25515c1518de148b',
};

export default {
  install (Vue, options) {
    const firebase = Firebase.initializeApp(config);
    const database = firebase.firestore();
    const storage = firebase.storage();
    const auth = firebase.auth();
    const googleProvider = new Firebase.auth.GoogleAuthProvider();
    const facebookProvider = new Firebase.auth.FacebookAuthProvider();
    Vue.prototype.$auth = {
      signInWithGoogle: (redirect = false) => (redirect
        ? auth.signInWithRedirect(googleProvider)
        : auth.signInWithPopup(googleProvider)),
      signInWithFacebook: (redirect = false) => (redirect
        ? auth.signInWithRedirect(facebookProvider)
        : auth.signInWithPopup(facebookProvider)),
      linkGoogle: async () => {
        await auth.currentUser.linkWithPopup(googleProvider);
        store.dispatch('updateUser', { user: auth.currentUser });
      },
      linkFacebook: async () => {
        await auth.currentUser.linkWithPopup(facebookProvider);
        store.dispatch('updateUser', { user: auth.currentUser });
      },
      unlinkFacebook: async () => {
        await auth.currentUser.unlink(facebookProvider.providerId);
        store.dispatch('updateUser', { user: auth.currentUser });
      },
      signOut: () => auth.signOut(),
    };
    auth.onAuthStateChanged(async (user) => {
      store.dispatch('updateUser', { user });
      if (user) {
        try {
          const userDataDocReference = database.collection('user-data').doc(user.uid);
          if (!(await userDataDocReference.get()).exists) {
            userDataDocReference.set({
              displayName: user.displayName,
              photoURL: user.photoURL,
              privacyPolicyAcceptedVersion: privacyPolicyConfig.version,
            });
          } else {
            userDataDocReference.update({
              photoURL: user.photoURL,
            });
          }
          store.dispatch('bindUserData', {
            database,
            userUid: user.uid,
          });
          store.dispatch('bindTeachedGroups', {
            database,
            userUid: user.uid,
          });
          store.dispatch('bindStudiedGroups', {
            database,
            userUid: user.uid,
          });
          store.dispatch('bindNotifications', {
            database,
            userUid: user.uid,
          });
        } catch (error) {
          this.$sendError('login/update-user', {
            error: {
              name: error.name || null,
              message: error.message || null,
            },
          });
          console.error(error);
        }
      } else {
        store.dispatch('unbindTeachedGroups');
        store.dispatch('unbindStudiedGroups');
        store.dispatch('unbindUserData');
        store.dispatch('unbindNotifications');
      }
    });
    Vue.prototype.$database = database;
    Vue.prototype.$storage = storage;
    Vue.prototype.$sendError = (location, data) => database.collection('error-reports').add({
      location,
      data,
      date: Firebase.firestore.FieldValue.serverTimestamp,
    });
    firebase.messaging().onMessage((message) => {
      console.log(message);
      Vue.prototype.$toast('Nowe powiadomienie');
    });
  },
};
