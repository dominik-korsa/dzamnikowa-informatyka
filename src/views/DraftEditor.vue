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
    </div>
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
    },
    created () {
      this.saveChangesDebounced = debounce(this.saveChanges, 500, {
        maxWait: 2500,
      });
      this.$bind('draftDoc', this.$database
        .collection('groups').doc(this.$route.params.groupId)
        .collection('drafts').doc(this.$route.params.draftId));
    },
    methods: {
      input () {
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
        } catch (error) {
          this.$toast.error('Nie udało się zapisać zmian');
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
