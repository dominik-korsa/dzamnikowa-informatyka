<template>
  <v-row
    v-if="!$store.state.teachedGroups"
    align="center"
    justify="center"
    class="pa-8"
    :class="{
      'fill-height': !vertical,
    }"
  >
    <v-col cols="auto">
      <v-progress-circular
        indeterminate
        color="primary"
        :size="64"
      />
    </v-col>
  </v-row>
  <v-row
    v-else-if="$store.state.teachedGroups.length === 0"
    align="center"
    justify="center"
    class="px-4 py-8"
    :class="{
      'fill-height': !vertical,
    }"
  >
    <v-col cols="auto">
      <h1 class="text-center display-1">
        Nie jesteś nauczycielem w żadnej grupie
      </h1>
      <v-btn
        outlined
        color="secondary"
        class="mt-8"
        block
        @click="createNewGroup"
      >
        Stwórz nową grupę
      </v-btn>
    </v-col>
  </v-row>
  <v-list v-else>
    <v-list-item
      v-for="group in $store.state.teachedGroups"
      :key="group.id"
      :to="`/zarzadzanie-grupami/${group.id}`"
    >
      <v-list-item-title v-text="group.name" />
    </v-list-item>
  </v-list>
</template>

<script>
  export default {
    props: {
      vertical: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      createNewGroup () {
        this.$emit('click:create-new-group');
      },
    },
  };
</script>
