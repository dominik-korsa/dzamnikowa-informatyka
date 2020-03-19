<template>
  <v-app>
    <app-bar @click:nav-icon="showNavigationDrawer = !showNavigationDrawer" />
    <navigation-drawer v-model="showNavigationDrawer" />
    <privacy-policy-dialog />
    <v-content>
      <slot />
    </v-content>
    <v-snackbar
      :value="showCookieInfo"
      bottom
      multi-line
      :vertical="$vuetify.breakpoint.smAndDown"
      :timeout="0"
    >
      <v-icon
        v-if="$vuetify.breakpoint.mdAndUp"
        large
        left
        dark
      >
        mdi-cookie
      </v-icon>
      Informacja: platforma wykorzystuje pliki Cookies do poprawnego funkcjonowania strony.
      <v-btn
        dark
        text
        href="https://skrypt-cookies.pl/czym-sa-ciasteczka"
        target="_blank"
      >
        Więcej informacji
      </v-btn>
      <v-btn
        dark
        text
        @click="closeCookieInfo"
      >
        Rozumiem
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
  import AppBar from '@/components/AppBar.vue';
  import NavigationDrawer from '@/components/NavigationDrawer.vue';
  import PrivacyPolicyDialog from '@/components/PrivacyPolicyDialog.vue';

  export default {
    components: {
      AppBar,
      NavigationDrawer,
      PrivacyPolicyDialog,
    },
    data: () => ({
      showNavigationDrawer: false,
      showCookieInfo: false,
    }),
    created () {
      if (JSON.parse(localStorage.getItem('cookies-accepted')) !== true) {
        this.showCookieInfo = true;
      } else {
        this.showCookieInfo = false;
      }
    },
    methods: {
      closeCookieInfo () {
        this.showCookieInfo = false;
        localStorage.setItem('cookies-accepted', JSON.stringify(true));
      },
    },
  };
</script>
