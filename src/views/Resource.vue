<template>
  <v-container class="fill-height">
    <v-row
      v-if="!resourceDoc"
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
    <div
      v-else
      class="grow fill-height d-flex flex-column"
    >
      <h1
        class="mb-4 mt-2 mx-4 display-1"
        v-text="resourceDoc.name"
      />
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
    }),
    watch: {
      '$route.params': {
        async handler (value) {
          await this.$bind('resourceDoc', this.$database
            .collection('groups').doc(this.$route.params.groupId)
            .collection('resources').doc(this.$route.params.resourceId));
        },
        immediate: true,
      },
    },
  };
</script>
