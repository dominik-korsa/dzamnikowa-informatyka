<template>
  <v-container class="fill-height">
    <v-row
      v-if="!draftDoc"
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
      class="grow fill-height d-flex flex-column fill-width"
    >
      <v-text-field
        v-model="name"
        class="shrink"
        label="Nazwa zasobu"
        outlined
        :rules="nameRules"
        :placeholder="(draftDoc ? draftDoc.name : null) || ''"
        @input="input"
      />
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
            @input="input"
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
              :source="description"
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
          Usuń szkic
        </v-btn>
        <v-btn
          class="ml-2"
          color="secondary"
          :disabled="publishDisabled"
          @click="showPublishDialog"
        >
          Opublikuj szkic
        </v-btn>
      </div>
    </div>
    <v-dialog
      v-model="deleteDialogVisible"
      :max-width="384"
    >
      <v-card>
        <v-card-title>Usunąć wersję roboczą?</v-card-title>
        <v-card-text>Usuniętej wersji nie można przywrócić.</v-card-text>
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
            @click="deleteSketch"
          >
            Usuń
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="publishDialogVisible"
      :max-width="384"
    >
      <v-card>
        <v-card-title>Gdzie opublikować temat?</v-card-title>
        <v-card-text>Wybierz temat do którego zostanie dodany zasób</v-card-text>
        <v-select
          v-model="selectedPublishTopic"
          label="Temat"
          :items="topicItems"
          outlined
          class="mx-4"
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="publishDialogVisible = false"
          >
            Anuluj
          </v-btn>
          <v-btn
            color="secondary"
            outlined
            :disabled="!selectedPublishTopic"
            @click="publishSketch"
          >
            Opublikuj
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import firebase from 'firebase/app';
  import { debounce } from 'lodash';
  import VueMarkdown from 'vue-markdown';
  import 'firebase/firestore';

  export default {
    components: {
      VueMarkdown,
    },
    data: () => ({
      draftDoc: null,
      groupDoc: null,
      name: '',
      description: '',
      saveChangesDebounced: null,
      saveLoading: false,
      deleteDialogVisible: false,
      publishDialogVisible: false,
      selectedPublishTopic: null,
      nameRules: [
        (v) => !!v || 'Nazwa nie może być pusta',
      ],
    }),
    computed: {
      topicItems () {
        if (!this.groupDoc) return null;
        if (!this.groupDoc.topics) return [];
        return this.groupDoc.topics.map((topic) => ({
          value: topic.id,
          text: topic.name,
        }));
      },
      publishDisabled () {
        return !this.name;
      },
    },
    watch: {
      draftDoc: {
        handler (value) {
          if (!value) return;
          if (!this.description) {
            this.description = value.description || '';
          }
          if (!this.name) {
            this.name = value.name || '';
          }
        },
        immediate: true,
      },
      '$route.params': {
        async handler (value) {
          this.$bind('groupDoc', this.$database.collection('groups').doc(this.$route.params.groupId), {
            maxRefDepth: 1,
          });
          await this.$bind('draftDoc', this.$database
            .collection('groups').doc(this.$route.params.groupId)
            .collection('drafts').doc(this.$route.params.draftId));
          if (!this.draftDoc) return;
          this.description = this.draftDoc.description || '';
          this.name = this.draftDoc.name || '';
        },
        immediate: true,
      },
    },
    created () {
      this.saveChangesDebounced = debounce(this.saveChanges, 500, {
        maxWait: 2500,
      });
    },
    methods: {
      input () {
        this.saveLoading = true;
        this.saveChangesDebounced();
      },
      keydown (event) {
        const keyCode = event.keyCode || event.which;

        if (keyCode === 9) {
          event.preventDefault();

          document.execCommand('insertText', false, '\t');
        }
      },
      async saveChanges () {
        try {
          await this.$database
            .collection('groups').doc(this.$route.params.groupId)
            .collection('drafts').doc(this.$route.params.draftId)
            .update({
              description: this.description,
              name: this.name.trim() || this.draftDoc.name,
            });
          this.saveLoading = false;
        } catch (error) {
          this.$toast.error('Nie udało się zapisać zmian');
          console.error(error);
        }
      },
      showPublishDialog () {
        this.selectedPublishTopic = null;
        this.publishDialogVisible = true;
      },
      async publishSketch () {
        if (this.saveLoading) return;
        if (!this.selectedPublishTopic) return;

        try {
          const groupReference = this.$database.collection('groups').doc(this.$route.params.groupId);
          const topicReference = groupReference.collection('topics').doc(this.selectedPublishTopic);
          const draftReference = groupReference.collection('drafts').doc(this.$route.params.draftId);
          const draftData = (await draftReference.get()).data();
          const resourceReference = await groupReference.collection('resources').add(draftData);
          await topicReference.update({
            resources: firebase.firestore.FieldValue.arrayUnion(resourceReference),
          });
          await draftReference.delete();
          this.$router.push(`/grupy/${this.$route.params.groupId}/zasoby/${resourceReference.id}`);
        } catch (error) {
          this.$toast.error('Podczas publikowania wystąpił nieoczekiwany błąd');
          console.error(error);
        }
      },
      async deleteSketch () {
        if (this.saveLoading) return;

        try {
          await this.$database
            .collection('groups').doc(this.$route.params.groupId)
            .collection('drafts').doc(this.$route.params.draftId)
            .delete();
          this.$router.push('/');
        } catch (error) {
          this.$toast.error('Podczas usuwania wystąpił nieoczekiwany błąd');
          console.error(error);
        }
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
</style>
