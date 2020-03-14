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
        class="my-2 mx-4"
      >
        <h1
          class="display-1"
          v-text="resourceDoc.name"
        />
        <h1
          v-if="maxPointsString"
          class="headline"
          :class="{
            'mt-3': $vuetify.breakpoint.mdAndDown
          }"
          v-text="maxPointsString"
        />
      </div>
      <v-tabs
        v-model="tab"
        class="shrink"
        centered
      >
        <v-tab>
          Treść
        </v-tab>
      </v-tabs>
      <v-tabs-items
        v-model="tab"
        class="grow tabs-items-fill-height"
      >
        <v-tab-item class="fill-height">
          <v-card
            v-if="!resourceDoc.description"
            class="fill-height mt-2 pa-4 d-flex flex-column align-center justify-center"
          >
            <h1
              class="text-center display-1"
            >
              Zasób nie ma opisu
            </h1>
          </v-card>
          <v-card
            v-else
            class="fill-height mt-2 pa-4"
            outlined
          >
            <vue-markdown
              :source="resourceDoc.description"
            />
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>

<script>
  import VueMarkdown from 'vue-markdown';

  const pluralRules = new Intl.PluralRules('pl-PL');
  const pluralPointsStrings = { many: 'punktów', one: 'punkt', few: 'punkty' };

  export default {
    components: {
      VueMarkdown,
    },
    data: () => ({
      resourceDoc: null,
      loading: true,
      tab: null,
    }),
    computed: {
      maxPointsString () {
        if (!this.resourceDoc || !this.resourceDoc.maxPoints || this.resourceDoc.type !== 'exercise') return null;
        return `${this.resourceDoc.maxPoints} ${pluralPointsStrings[pluralRules.select(this.resourceDoc.maxPoints)]}`;
      },
    },
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

<style lang="scss">
  .tabs-items-fill-height .v-window__container {
    height: 100%;
  }
</style>
