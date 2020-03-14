<template>
  <v-container class="fill-height">
    <v-row
      v-if="loading"
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
    <v-row
      v-else-if="!resourceDoc"
      align="center"
      justify="center"
      class="fill-height pa-8"
    >
      <v-col cols="auto">
        <h1 class="text-center display-1">
          Wybrany zasób nie istnieje lub nie masz do niego dostępu
        </h1>
      </v-col>
    </v-row>
    <div
      v-else
      class="grow fill-height d-flex flex-column"
    >
      <div
        :class="{
          'flex-column': $vuetify.breakpoint.mdAndDown,
          'flex-row align-center justify-space-between': $vuetify.breakpoint.lgAndUp,
        }"
        class="mt-2 mb-4 mx-4"
      >
        <h1
          class="display-1"
          v-text="resourceDoc.name"
        />
        <h1
          class="headline"
          :class="{
            'mt-3': $vuetify.breakpoint.mdAndDown
          }"
        >
          100 punktów
        </h1>
      </div>
      <v-card
        v-if="!resourceDoc.description"
        class="grow pa-4 d-flex flex-column align-center justify-center"
      >
        <h1
          class="text-center display-1"
        >
          Zasób nie ma opisu
        </h1>
      </v-card>
      <v-card
        v-else
        class="grow pa-4"
        outlined
      >
        <vue-markdown
          :source="resourceDoc.description"
        />
      </v-card>
    </div>
  </v-container>
</template>

<script>
  import VueMarkdown from 'vue-markdown';

  export default {
    components: {
      VueMarkdown,
    },
    data: () => ({
      resourceDoc: null,
      loading: true,
    }),
    watch: {
      '$route.params': {
        async handler (value) {
          this.loading = true;
          try {
            await this.$bind('resourceDoc', this.$database
              .collection('groups').doc(this.$route.params.groupId)
              .collection('resources').doc(this.$route.params.resourceId));
          } catch (error) {
            if (error.code !== 'permission-denied') {
              this.$toast.error('Podczas wczytywania zasobu wystąpił nieoczekiwany błąd');
              console.error(error);
            }
          }
          this.loading = false;
        },
        immediate: true,
      },
    },
  };
</script>
