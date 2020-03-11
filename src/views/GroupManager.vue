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
        v-if="$vuetify.breakpoint.smAndUp"
        class="grow"
        no-gutters
      >
        <v-col
          :cols="5"
          :md="4"
          :xl="2"
        >
          <groups-list @click:create-new-group="createNewGroup" />
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
      <template v-else>
        <groups-list @click:create-new-group="createNewGroup" />
        <v-divider />
        <v-row
          v-if="!$route.params.groupId"
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
        <group-editor
          v-else
          :group-id="$route.params.groupId"
        />
      </template>
    </v-card>
    <group-create-dialog ref="groupCreateDialog" />
  </v-container>
</template>

<script>
  import GroupCreateDialog from '@/components/group-manager/GroupCreateDialog.vue';
  import GroupEditor from '@/components/group-manager/GroupEditor.vue';
  import GroupsList from '@/components/group-manager/GroupsList.vue';

  export default {
    components: {
      GroupCreateDialog,
      GroupEditor,
      GroupsList,
    },
    methods: {
      createNewGroup () {
        this.$refs.groupCreateDialog.show();
      },
    },
  };
</script>
