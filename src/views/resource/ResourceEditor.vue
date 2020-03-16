<template>
  <v-row
    v-if="!resource"
    align="center"
    justify="center"
    class="fill-height pa-8"
  >
    <v-col cols="auto">
      <h1 class="text-center display-1">
        Wybrany zasób nie istnieje lub nie masz do niego dostępu nauczycielskiego
      </h1>
    </v-col>
  </v-row>
  <div
    v-else
    class="fill-height d-flex flex-column fill-width"
  >
    <v-row
      v-if="$vuetify.breakpoint.smAndUp"
      class="shrink"
    >
      <v-col :cols="resource.type === 'exercise' ? 8 : 12">
        <v-text-field
          v-model="name"
          class="shrink"
          label="Nazwa zasobu"
          outlined
          :rules="nameRules"
        />
      </v-col>
      <v-col
        v-if="resource.type === 'exercise'"
        :cols="4"
      >
        <v-text-field
          v-model="maxPoints"
          class="shrink"
          label="Liczba punktów"
          outlined
          type="number"
          :rules="maxPointsRules"
          min="0"
        />
      </v-col>
    </v-row>
    <div v-else>
      <v-text-field
        v-model="name"
        class="shrink"
        label="Nazwa zasobu"
        outlined
        :rules="nameRules"
      />
      <v-text-field
        v-if="resource.type === 'exercise'"
        v-model="maxPoints"
        class="shrink"
        label="Liczba punktów"
        outlined
        type="number"
        :rules="maxPointsRules"
        min="0"
      />
    </div>
    <v-row class="grow">
      <v-col
        class="fill-height"
        :cols="6"
      >
        <v-textarea
          v-model="description"
          class="textarea-fill-height"
          outlined
          no-resize
          label="Opis"
          hint="Możesz używać markdown"
          persistent-hint
          @keydown="keydown"
        />
      </v-col>
      <v-col
        class="pb-10"
        :cols="6"
      >
        <v-card
          class="fill-height pa-4"
          outlined
        >
          <vue-markdown
            class="markdown-output"
            :source="description"
            @rendered="updateSyntax"
          />
        </v-card>
      </v-col>
    </v-row>
    <div class="d-flex">
      <v-spacer />
      <v-btn
        color="red"
        outlined
        @click="deleteDialogVisible = true"
      >
        Usuń zasób
      </v-btn>
      <v-btn
        class="ml-2"
        color="secondary"
        :disabled="saveDisabled"
        @click="saveChanges"
      >
        Zapisz zmiany
      </v-btn>
    </div>
    <v-dialog
      v-model="deleteDialogVisible"
      :max-width="384"
    >
      <v-card>
        <v-card-title>Usunąć zasób?</v-card-title>
        <v-card-text>
          <p>Usuniętego zasobu nie można przywrócić.</p>
          <p v-if="resource.type === 'exercise'">
            Historia rozwiązań również zostanie usunięta.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="deleteDialogVisible = false"
          >
            Anuluj
          </v-btn>
          <v-btn
            color="red"
            outlined
            @click="deleteResource"
          >
            Usuń
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
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
    data: () => ({
      name: '',
      maxPoints: null,
      description: '',
      saveLoading: false,
      deleteDialogVisible: false,
      nameRules: [
        (v) => (v !== null && v.trim() !== '') || 'Nazwa nie może być pusta',
      ],
      maxPointsRules: [
        (v) => v !== null || 'Liczba punktów jest wymagana',
        (v) => parseFloat(v) % 1 === 0 || 'Liczba punktów musi być liczbą całkowitą',
        (v) => parseInt(v, 10) >= 0 || 'Liczba punktów nie może być liczbą ujemną',
      ],
    }),
    computed: {
      resource () {
        if (!this.$store.state.teachedGroups || !this.$store.state.studiedGroups) return null;
        const group = this.$store.state.teachedGroups.find((element) => element.id === this.$route.params.groupId);
        if (!group || !group.topics) return null;
        const groupResources = _.flatMap(group.topics, (topic) => topic.resources || []);
        const resource = groupResources.find((element) => element.id === this.$route.params.resourceId);
        return resource || null;
      },
      dataChanged () {
        if (!this.resource) return false;
        return this.resource.name !== this.name ||
          this.resource.description !== this.description ||
          (this.resource.type === 'exercise' && this.resource.maxPoints !== parseInt(this.maxPoints, 10));
      },
      saveDisabled () {
        return !this.dataChanged ||
          this.saveLoading ||
          this.name === null ||
          this.name.trim() === '' ||
          (this.resource.type === 'exercise' && (
            parseInt(this.maxPoints, 10) === null ||
            parseInt(this.maxPoints, 10) < 0 ||
            parseFloat(this.maxPoints) % 1 !== 0)
          );
      },
    },
    watch: {
      'resource.id': {
        handler (newId, oldId) {
          if (newId !== oldId) {
            this.updateEditorData(true);
          }
        },
      },
      resource: {
        handler (value) {
          if (!value) return;
          this.updateEditorData();
        },
        immediate: true,
      },
    },
    methods: {
      updateSyntax () {
        this.$nextTick(() => {
          Prism.highlightAll();
        });
      },
      updateEditorData (force = false) {
        if (force || !this.description) {
          this.description = this.resource.description || '';
        }
        if (force || !this.name) {
          this.name = this.resource.name || '';
        }
        if (force || !this.maxPoints) {
          this.maxPoints = this.resource.maxPoints || null;
        }
      },
      keydown (event) {
        const keyCode = event.keyCode || event.which;

        if (keyCode === 9) {
          event.preventDefault();

          document.execCommand('insertText', false, '\t');
        }
      },
      async saveChanges () {
        if (this.saveDisabled) return;
        try {
          const data = {
            description: this.description,
            name: this.name.trim(),
          };

          if (this.resource.type === 'exercise') {
            data.maxPoints = parseInt(this.maxPoints, 10);
          }

          await this.$database
            .collection('groups').doc(this.$route.params.groupId)
            .collection('resources').doc(this.$route.params.resourceId)
            .update(data);
          this.saveLoading = false;
          this.$toast('Zapisano zmiany');
        } catch (error) {
          this.$toast.error('Nie udało się zapisać zmian');
          console.error(error);
        }
      },
      deleteResource () {
        this.$toast('Usuwanie zasobów nie jest jeszcze obsługiwane');
      },
    },
  };
</script>

<style lang="scss">
  @import '/node_modules/prismjs/themes/prism.css';

  .textarea-fill-height {
    height: 100%;

    .v-input__control {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .v-input__slot {
      flex-grow: 1;
    }

    .v-text-field__details {
      max-height: 14px;
    }
  }

  .fill-width {
    width: 100%;
  }

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
