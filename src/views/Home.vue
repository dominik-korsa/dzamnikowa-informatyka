<template>
  <v-app>
    <app-bar />
    <v-content>
      <v-container>
        <h1>This is an home page</h1>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import AppBar from '@/components/AppBar.vue';

  export default {
    components: {
      AppBar,
    },
  };
</script>
