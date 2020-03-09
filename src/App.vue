<template>
  <loading v-if="!$store.state.userLoaded" />
  <login v-else-if="!$store.state.user" />
  <basic-view v-else>
    <router-view />
  </basic-view>
</template>

<script>
  import BasicView from '@/components/BasicView.vue';
  import Loading from '@/views/Loading.vue';
  import Login from '@/views/Login.vue';

  export default {
    components: {
      BasicView,
      Loading,
      Login,
    },
  };
</script>
