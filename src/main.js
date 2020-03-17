import Vue from 'vue';
import AsyncComputed from 'vue-async-computed';
import { firestorePlugin } from 'vuefire';
import App from './App.vue';
import firebasePlugin from './plugins/firebase';
import vuetify from './plugins/vuetify';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(AsyncComputed);
Vue.use(firebasePlugin);
Vue.use(firestorePlugin);

new Vue({
  router,
  vuetify,
  store,
  created () {
    store.dispatch('bindUserDataCollection', {
      database: this.$database,
    });
    const commitSHA = process.env.VUE_APP_GITHUB_SHA;
    console.log(`GitHub commit: ${commitSHA || 'brak informacji'}`);
  },
  render: (h) => h(App),
}).$mount('#app');
