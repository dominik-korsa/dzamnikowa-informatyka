import Vue from 'vue';
import VuetifyToast from 'vuetify-toast-snackbar';
import pl from 'vuetify/es5/locale/pl';
import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Vuetify, {
  components: {
    VSnackbar,
    VBtn,
    VIcon,
  },
});

Vue.use(VuetifyToast, {
  queueable: true,
  color: 'grey darken-4',
});

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: colors.red,
        secondary: colors.blue,
        accent: colors.blue,
      },
    },
  },
  lang: {
    locales: { pl },
    current: 'pl',
  },
  icons: {
    iconfont: 'mdi',
  },
});
