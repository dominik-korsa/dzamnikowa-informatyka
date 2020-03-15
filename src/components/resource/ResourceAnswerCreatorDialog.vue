<template>
  <v-dialog
    v-model="visible"
    max-width="384"
    :persistent="creating"
  >
    <v-card>
      <v-card-title>Wysyłanie rozwiązania</v-card-title>
      <div
        v-if="creating"
        class="pa-8 pt-4 d-flex align-center justify-center"
      >
        <v-progress-circular
          :size="64"
          :rotate="-90"
          :indeterminate="uploadProgress === null"
          :value="uploadProgress || 0"
          color="primary"
        />
      </div>
      <template v-else>
        <v-card-text>
          <template v-for="attachment in attachments">
            <v-file-input
              v-if="attachment.type === 'file'"
              :key="attachment.key"
              v-model="attachment.value"
              outlined
              :clearable="false"
              prepend-icon="mdi-file"
              append-icon="mdi-close"
              placeholder="Wybierz plik..."
              color="secondary"
              @click:append="removeAttachment(attachment.key)"
            />
            <v-text-field
              v-if="attachment.type === 'link'"
              :key="attachment.key"
              v-model="attachment.value"
              outlined
              prepend-icon="mdi-link"
              append-icon="mdi-close"
              placeholder="https://example.com/"
              :rules="linkRules"
              color="secondary"
              @click:append="removeAttachment(attachment.key)"
            />
          </template>
          <div
            v-if="attachments.length === 0"
            class="body-1 text-center mt-4"
          >
            Brak załączników
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn
            class="grow"
            color="secondary"
            :disabled="emptyFileAttachments"
            @click="addFileAttachment"
          >
            <v-icon left>
              mdi-file-plus
            </v-icon>
            Dołącz plik
          </v-btn>
          <v-btn
            class="grow ml-2"
            color="secondary"
            :disabled="emptyLinkAttachments"
            outlined
            @click="addLinkAttachment"
          >
            <v-icon left>
              mdi-link-plus
            </v-icon>
            Dołącz link
          </v-btn>
        </v-card-actions>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            outlined
            type="submit"
            :disabled="!createEnabled"
            @click="submit"
          >
            Wyślij
          </v-btn>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script>
  import firebase from 'firebase/app';
  import isUrl from 'is-url';
  import * as _ from 'lodash';
  import 'firebase/storage';
  import 'firebase/firestore';

  export default {
    data: () => ({
      attachments: [],
      visible: false,
      groupId: null,
      resourceId: null,
      linkRules: [
        (v) => isUrl(v) || 'Podaj poprawny adres URL',
      ],
      creating: false,
      fileProgress: {},
    }),
    computed: {
      emptyFileAttachments () {
        return this.attachments.filter((attachment) => !attachment.value && attachment.type === 'file').length > 0;
      },
      emptyLinkAttachments () {
        return this.attachments.filter((attachment) => !attachment.value && attachment.type === 'link').length > 0;
      },
      createEnabled () {
        if (this.attachments.length === 0) return false;
        if (this.emptyFileAttachments || this.emptyLinkAttachments) return false;
        if (this.attachments.filter((attachment) => attachment.type === 'link' && !isUrl(attachment.value)).length > 0) return false;
        return true;
      },
      uploadProgress: {
        get () {
          const fileProgressValues = _.values(this.fileProgress);
          if (fileProgressValues.length === 0) return null;
          const transferedBytes = _.sumBy(fileProgressValues, 'transfered');
          const totalBytes = _.sumBy(fileProgressValues, 'total');
          return transferedBytes / totalBytes * 100;
        },
        deep: true,
      },
    },
    methods: {
      addFileAttachment () {
        if (this.emptyFileAttachments) return;
        this.attachments.push({
          key: Math.random(),
          value: null,
          type: 'file',
        });
      },
      addLinkAttachment () {
        if (this.emptyLinkAttachments) return;
        this.attachments.push({
          key: Math.random(),
          value: '',
          type: 'link',
        });
      },
      removeAttachment (key) {
        this.$set(this, 'attachments', _.filter(this.attachments, (attachment) => attachment.key !== key));
      },
      show (groupId, resourceId) {
        this.attachments = [];
        this.visible = true;
        this.groupId = groupId;
        this.resourceId = resourceId;
        this.fileProgress = {};
      },
      async submit () {
        if (!this.createEnabled || this.creating) return;

        if (!this.$store.state.user) {
          this.$toast.error('Błąd podczas pobierania danych o użytkowniku');
          return;
        }

        this.fileProgress = {};
        this.creating = true;

        try {
          const answerReference = this.$database
            .collection('groups').doc(this.groupId)
            .collection('resources').doc(this.resourceId)
            .collection('answers')
            .doc();

          const storageRef = this.$storage.ref();
          const answerFolderRef = storageRef.child(`answers/${this.groupId}/${this.resourceId}/${answerReference.id}`);

          const attachments = await Promise.all(this.attachments.map((attachment, index) => new Promise((resolve, reject) => {
            if (attachment.type === 'file') {
              const fileRef = answerFolderRef.child(`${index}-${attachment.value.name}`);
              const uploadTask = fileRef.put(attachment.value);

              uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
                this.$set(this.fileProgress, `${index}-${attachment.value.name}`, {
                  transfered: snapshot.bytesTransferred,
                  total: snapshot.totalBytes,
                });
              }, (error) => {
                reject(error);
              }, () => {
                resolve({
                  type: 'file',
                  filePath: fileRef.fullPath,
                });
              });
            } else if (attachment.type === 'link') {
              resolve({
                type: 'link',
                url: attachment.value,
              });
            } else {
              reject(new Error(`Unknown attachment type: ${attachment.type}`));
            }
          })));

          await answerReference.set({
            userId: this.$store.state.user.uid,
            sendDate: firebase.firestore.FieldValue.serverTimestamp(),
            attachments,
          });

          this.creating = false;
          this.visible = false;
          this.$router.push(`/grupy/${this.groupId}/zasoby/${this.resourceId}/twoje-rozwiazania/${answerReference.id}`);
        } catch (error) {
          this.$toast.error('Podczas wysyłania rozwiązania wystąpił nieoczekiwany błąd');
          console.error(error);
        }
      },
    },
  };
</script>
