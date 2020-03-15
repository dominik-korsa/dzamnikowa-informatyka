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
      v-else-if="!resource"
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
          v-text="resource.name"
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
            v-if="!resource.description"
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
              :source="resource.description"
            />
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>

<script>
  import _ from 'lodash';
  import VueMarkdown from 'vue-markdown';

  const pluralRules = new Intl.PluralRules('pl-PL');
  const pluralPointsStrings = { many: 'punktów', one: 'punkt', few: 'punkty' };

  export default {
    components: {
      VueMarkdown,
    },
    data: () => ({
      tab: null,
    }),
    computed: {
      loading () {
        return !this.$store.state.teachedGroups || !this.$store.state.studiedGroups;
      },
      isTeacher () {
        if (!this.$store.state.teachedGroups) return false;
        const teachedGroup = this.$store.state.teachedGroups.find((group) => group.id === this.$route.params.groupId);
        return !!teachedGroup;
      },
      isStudent () {
        if (!this.$store.state.studiedGroups) return false;
        const studiedGroup = this.$store.state.studiedGroups.find((group) => group.id === this.$route.params.groupId);
        return !!studiedGroup;
      },
      resource () {
        if (!this.$store.state.teachedGroups || !this.$store.state.studiedGroups) return null;
        const teachedGroup = this.$store.state.teachedGroups.find((group) => group.id === this.$route.params.groupId);
        const studiedGroup = this.$store.state.studiedGroups.find((group) => group.id === this.$route.params.groupId);
        const group = teachedGroup || studiedGroup || null;
        if (!group || !group.topics) return null;
        const groupResources = _.flatMap(group.topics, (topic) => topic.resources || []);
        const resource = groupResources.find((element) => element.id === this.$route.params.resourceId);
        return resource || null;
      },
      maxPointsString () {
        if (!this.resource || !this.resource.maxPoints || this.resource.type !== 'exercise') return null;
        return `${this.resource.maxPoints} ${pluralPointsStrings[pluralRules.select(this.resource.maxPoints)]}`;
      },
    },
  };
</script>

<style lang="scss">
  .tabs-items-fill-height .v-window__container {
    height: 100%;
  }
</style>
