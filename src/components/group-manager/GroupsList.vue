<template>
  <v-row
    v-if="!orderedGroups"
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
    v-else-if="orderedGroups.length === 0"
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
    <transition-group
      type="transition"
      name="flip-list"
    >
      <v-list-item
        v-for="group in orderedGroups"
        :key="group.id"
        :to="`/zarzadzanie-grupami/${group.id}`"
      >
        <v-list-item-title v-text="group.name" />
      </v-list-item>
    </transition-group>
  </v-list>
</template>

<script>
  import * as _ from 'lodash';

  export default {
    props: {
      vertical: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      orderedGroups () {
        const dataGroupsOrder = this.$store.state.userData ? this.$store.state.userData.groupsOrder : null;

        if (!this.$store.state.teachedGroups) {
          return null;
        } if (!dataGroupsOrder) {
          return this.$store.state.teachedGroups;
        }
        return _.sortBy(this.$store.state.teachedGroups, [
          (group) => _.findIndex(dataGroupsOrder, (e) => group.id === e),
        ]);
      },
    },
    methods: {
      createNewGroup () {
        this.$emit('click:create-new-group');
      },
    },
  };
</script>

<style lang="scss">
  .flip-list-move {
    transition: transform 0.3s;
  }
</style>
