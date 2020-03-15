<template>
  <div
    class="grow fill-height d-flex flex-column fill-width"
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
  import VueMarkdown from 'vue-markdown';

  export default {
    components: {
      VueMarkdown,
    },
    props: {
      groupId: {
        type: String,
        required: true,
      },
      resource: {
        type: Object,
        required: true,
      },
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
      dataChanged () {
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
          await this.$database
            .collection('groups').doc(this.groupId)
            .collection('resources').doc(this.resource.id)
            .update({
              description: this.description,
              name: this.name.trim(),
              maxPoints: this.resource.type === 'exercise' ? parseInt(this.maxPoints, 10) : undefined,
            });
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
</style>
