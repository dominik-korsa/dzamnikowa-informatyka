<template>
  <v-app>
    <app-bar @click:nav-icon="showNavigationDrawer = !showNavigationDrawer" />
    <navigation-drawer v-model="showNavigationDrawer" />
    <privacy-policy-dialog />
    <v-content>
      <slot />
    </v-content>
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
    }),
  };
</script>
