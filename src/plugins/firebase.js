/* eslint-disable no-param-reassign */
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
      signOut: () => auth.signOut(),
    };
    auth.onAuthStateChanged(async (user) => {
      store.dispatch('updateUser', { user });
      if (user) {
        const userDataDocReference = database.collection('user-data').doc(user.uid);
        if (!(await userDataDocReference.get()).exists) {
          userDataDocReference.set({
            displayName: user.displayName,
          });
        }
        store.dispatch('bindUserData', {
          database,
          userUid: user.uid,
        });
      } else {
        store.dispatch('unbindUserData');
      }
    });
    Vue.prototype.$database = database;
  },
};
