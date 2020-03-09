<template>
  <v-app>
    <app-bar @click:nav-icon="showNavigationDrawer = !showNavigationDrawer" />
    <navigation-drawer v-model="showNavigationDrawer" />
    <v-content>
      <slot />
    </v-content>
  </v-app>
</template>

<script>
  import AppBar from '@/components/AppBar.vue';
  import NavigationDrawer from '@/components/NavigationDrawer.vue';

  export default {
    components: {
      AppBar,
      NavigationDrawer,
    },
    data: () => ({
      showNavigationDrawer: false,
    }),
  };
</script>
