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
      class="grow fill-height d-flex flex-column"
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
  </v-container>
</template>

<script>
  import { debounce } from 'lodash';
  import VueMarkdown from 'vue-markdown';

  export default {
    components: {
      VueMarkdown,
    },
    data: () => ({
      draftDoc: null,
      name: '',
      description: '',
      saveChangesDebounced: null,
      saveLoading: false,
      deleteDialogVisible: false,
      nameRules: [
        (v) => !!v || 'Nazwa nie może być pusta',
      ],
    }),
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
</style>
