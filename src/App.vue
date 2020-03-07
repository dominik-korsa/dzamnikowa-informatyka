<template>
  <loading v-if="!$store.state.userLoaded" />
  <login v-else-if="!$store.state.user" />
  <router-view v-else />
</template>

<script>
  import Loading from '@/views/Loading.vue';
  import Login from '@/views/Login.vue';

  export default {
    components: {
      Loading,
      Login,
    },
  };
</script>
