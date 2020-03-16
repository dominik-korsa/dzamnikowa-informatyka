<template>
  <v-row
    v-if="!resource"
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
  <v-card
    v-else-if="!resource.description"
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
      class="markdown-output"
      :source="resource.description"
      @rendered="updateSyntax"
    />
  </v-card>
</template>

<script>
  import _ from 'lodash';
  import Prism from 'prismjs';
  import VueMarkdown from 'vue-markdown';

  import 'prismjs/components/prism-c';
  import 'prismjs/components/prism-cpp';

  export default {
    components: {
      VueMarkdown,
    },
    computed: {
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
    },
    methods: {
      updateSyntax () {
        this.$nextTick(() => {
          Prism.highlightAll();
        });
      },
    },
  };
</script>

<style lang="scss">
  .markdown-output {
    code::before, code::after {
      content: none;
    }

    code:not([class*="language-"]) {
      padding: 2px 6px;
      margin: 0 2px;
      background-color: rgb(20, 20, 20);
      color: white;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    }
  }
</style>
