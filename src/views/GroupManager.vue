<template>
  <v-container class="fill-height">
    <v-card
      outlined
      class="fill-height flex-column grow d-flex"
    >
      <div
        class="d-flex pa-1"
        :class="{
          'flex-column': $vuetify.breakpoint.xsOnly,
        }"
      >
        <v-btn
          outlined
          color="secondary"
          class="ma-1"
          @click="createNewGroup"
        >
          Stwórz nową grupę
        </v-btn>
      </div>
      <v-divider />
      <v-row
        class="grow"
        no-gutters
      >
        <v-col
          v-if="!$store.state.teachedGroups"
          :cols="4"
          :xl="2"
        >
          <v-row
            align="center"
            justify="center"
            class="fill-height"
          >
            <v-col cols="auto">
              <v-progress-circular
                indeterminate
                color="primary"
                :size="64"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col
          v-else-if="$store.state.teachedGroups.length === 0"
          :cols="4"
          :xl="2"
          class="pa-4"
        >
          <v-row
            align="center"
            justify="center"
            class="fill-height"
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
        </v-col>
        <v-col
          v-else
          :cols="4"
          :xl="2"
        >
          <v-list>
            <v-list-item
              v-for="group in $store.state.teachedGroups"
              :key="group.id"
              :to="`/zarzadzanie-grupami/${group.id}`"
            >
              <v-list-item-title v-text="group.name" />
            </v-list-item>
          </v-list>
        </v-col>
        <v-divider
          vertical
          class="fill-height"
        />
        <v-col
          v-if="!$route.params.groupId"
          class="pa-4 grow"
        >
          <v-row
            align="center"
            justify="center"
            class="fill-height"
          >
            <v-col cols="auto">
              <h1 class="text-center display-1">
                Wybierz grupę do edycji
              </h1>
            </v-col>
          </v-row>
        </v-col>
        <v-col
          v-else
          class="grow"
        >
          <group-editor :group-id="$route.params.groupId" />
        </v-col>
      </v-row>
    </v-card>
    <group-create-dialog ref="groupCreateDialog" />
  </v-container>
</template>

<script>
  import GroupCreateDialog from '@/components/GroupCreateDialog.vue';
  import GroupEditor from '@/components/GroupEditor.vue';

  export default {
    components: {
      GroupCreateDialog,
      GroupEditor,
    },
    methods: {
      createNewGroup () {
        this.$refs.groupCreateDialog.show();
      },
    },
  };
</script>
