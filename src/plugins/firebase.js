/* eslint-disable no-param-reassign */
import privacyPolicyConfig from '@/privacy-policy-config';
import store from '@/store';
import Firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

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
    const auth = firebase.auth();
    const googleProvider = new Firebase.auth.GoogleAuthProvider();
    const facebookProvider = new Firebase.auth.FacebookAuthProvider();
    Vue.prototype.$auth = {
      signInWithGoogle: () => auth.signInWithPopup(googleProvider),
      signInWithFacebook: () => auth.signInWithPopup(facebookProvider),
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
      } else {
        store.dispatch('unbindUserData');
        store.dispatch('unbindTeachedGroups');
        store.dispatch('unbindStudiedGroups');
      }
    });
    Vue.prototype.$database = database;
  },
};
