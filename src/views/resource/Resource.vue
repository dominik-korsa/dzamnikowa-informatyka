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
        class="shrink"
        centered
        show-arrows
      >
        <v-tab
          :to="`/grupy/${$route.params.groupId}/zasoby/${$route.params.resourceId}`"
          exact
        >
          Treść
        </v-tab>
        <v-tab
          v-if="isTeacher"
          :to="`/grupy/${$route.params.groupId}/zasoby/${$route.params.resourceId}/edytor`"
        >
          Edytor
        </v-tab>
        <v-tab
          v-if="isStudent && resource.type === 'exercise'"
          :to="`/grupy/${$route.params.groupId}/zasoby/${$route.params.resourceId}/twoje-rozwiazania`"
        >
          Twoje rozwiązania
        </v-tab>
        <v-tab
          v-if="isTeacher && resource.type === 'exercise'"
          :to="`/grupy/${$route.params.groupId}/zasoby/${$route.params.resourceId}/ocenianie`"
        >
          Ocenianie
        </v-tab>
      </v-tabs>
      <router-view />
    </div>
  </v-container>
</template>

<script>
  import _ from 'lodash';

  const pluralRules = new Intl.PluralRules('pl-PL');
  const pluralPointsStrings = { many: 'punktów', one: 'punkt', few: 'punkty' };

  export default {
    computed: {
      loading () {
        return !this.$store.state.teachedGroups || !this.$store.state.studiedGroups;
      },
      isTeacher () {
        if (!this.$store.state.userData || this.$store.state.userData.teacherModeEnabled !== true) return false;
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
