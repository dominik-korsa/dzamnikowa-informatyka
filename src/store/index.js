import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations, firestoreAction } from 'vuexfire';

Vue.use(Vuex);

const stateObject = {
  user: null,
  userLoaded: false,
  userData: null,
};

const store = new Vuex.Store({
  state: stateObject,
  mutations: {
    updateUser (state, { user }) {
      Vue.set(state, 'user', user ? {
        uid: user.uid,
        photoURL: user.photoURL,
        displayName: user.displayName,
        email: user.email,
        providerData: user.providerData,
      } : null);
    },
    updateUserLoaded (state, value) {
      Vue.set(state, 'userLoaded', value);
    },
    ...vuexfireMutations,
  },
  actions: {
    updateUser ({ state, commit }, value) {
      commit('updateUser', value);
      if (!state.userLoaded) commit('updateUserLoaded', true);
    },
    bindUserData: firestoreAction(
      (context, { database, userUid }) => context.bindFirestoreRef('userData', database.collection('user-data').doc(userUid)),
    ),
    unbindUserData: firestoreAction(
      (context) => context.unbindFirestoreRef('userData'),
    ),
  },
  modules: {
  },
});

export default store;
