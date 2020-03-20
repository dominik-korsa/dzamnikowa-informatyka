<template>
  <v-dialog
    v-model="visible"
    fullscreen
    hide-overlay
    persistent
  >
    <v-card class="dialog__card">
      <v-app-bar
        dark
        color="primary"
        elevate-on-scroll
        fixed
      >
        <v-btn
          icon
          dark
          @click="visible = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Edytor kodu</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-tooltip
            v-if="saveDisabled"
            bottom
          >
            <template v-slot:activator="{ on }">
              <div
                class="d-flex flex-column justify-stretch"
                v-on="on"
              >
                <v-btn
                  style="height: 100%"
                  dark
                  text
                  disabled
                >
                  Zapisz
                </v-btn>
              </div>
            </template>
            <span v-text="saveDisabled" />
          </v-tooltip>
          <v-btn
            v-else
            dark
            text
            @click="save"
          >
            Zapisz
          </v-btn>
        </v-toolbar-items>
      </v-app-bar>
      <v-card-text class="dialog__content">
        <v-row>
          <v-col
            :cols="6"
            :sm="8"
          >
            <v-text-field
              v-model="fileName"
              label="Nazwa pliku"
              outlined
              autofocus
              @change="fileNameChange"
            />
          </v-col>
          <v-col
            :cols="6"
            :sm="4"
          >
            <v-combobox
              v-model="fileExtension"
              label="Rozszerzenie"
              outlined
              no-filter
              :items="extensions"
              @change="fileExtensionChange"
            />
          </v-col>
        </v-row>
        <v-textarea
          v-model="text"
          label="Treść pliku"
          outlined
          auto-grow
          @keydown="textKeydown"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import * as _ from 'lodash';

  export default {
    data: () => ({
      visible: false,
      fileName: '',
      fileExtension: '',
      text: '',
      key: null,
      extensions: [
        'cpp',
        'py',
        'txt',
      ],
    }),
    computed: {
      saveDisabled () {
        if ((this.fileName || '').trim() === '') return 'Nazwa pliku jest wymagana';
        if (this.fileName !== _.kebabCase(this.fileName)) return 'Nazwa pliku nie jest w poprawnym formacie';
        if ((this.fileExtension || '').trim() === '') return 'Rozszerzenie jest wymagane';
        if (this.fileExtension.includes('.')) return 'Rozszerzenie nie może zawierać kropki';
        if ((this.text || '').trim() === '') return 'Zawartość pliku jest wymagana';
        return false;
      },
    },
    methods: {
      fileNameChange () {
        const nameSplit = this.fileName.split('.');
        if (nameSplit.length > 1) {
          [this.fileName, this.fileExtension] = nameSplit;
        }
        this.fileName = _.kebabCase(this.fileName);
      },
      fileExtensionChange () {
        const extensionSplit = this.fileExtension.split('.');
        if (extensionSplit.length === 2) {
          this.fileExtension = extensionSplit[1].trim();
        } else {
          this.fileExtension = this.fileExtension.trim();
        }
      },
      textKeydown (event) {
        const keyCode = event.keyCode || event.which;

        if (keyCode === 9) {
          event.preventDefault();

          document.execCommand('insertText', false, '\t');
        }
      },
      show (text, filename, key) {
        if (text) {
          this.text = text;
        } else {
          this.text = '';
        }

        if (filename) {
          const [name, extension] = filename.split('.');
          this.fileName = name;
          this.extension = extension;
        } else {
          this.fileName = '';
          this.fileExtension = '';
        }

        this.key = key || null;

        this.visible = true;
      },
      save () {
        this.$emit('save', this.text, `${this.fileName}.${this.fileExtension}`, this.key);
        this.visible = false;
      },
    },
  };
</script>

<style lang="scss">
  .dialog__card {
    overflow: auto;
  }

  .dialog__content {
    margin-top: 64px;
    padding: 24px !important;
  }
</style>
