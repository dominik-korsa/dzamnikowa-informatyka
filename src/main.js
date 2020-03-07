import Vue from 'vue';
import { firestorePlugin } from 'vuefire';
import App from './App.vue';
import firebasePlugin from './plugins/firebase';
import vuetify from './plugins/vuetify';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(firebasePlugin);
Vue.use(firestorePlugin);

new Vue({
  router,
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app');
