<template>
  <div
    v-if="attachmentsList === null"
    class="d-flex justify-center"
  >
    <v-progress-circular
      indeterminate
      color="primary"
      :size="64"
      class="my-12"
    />
  </div>
  <v-list v-else>
    <template v-for="attachment in attachmentsList">
      <v-list-item
        v-if="attachment.type === 'file'"
        :key="attachment.key"
        :href="attachment.downloadUrl"
        target="_blank"
      >
        <v-list-item-icon>
          <v-icon>mdi-file</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="attachment.fileName" />
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        v-if="attachment.type === 'link'"
        :key="attachment.key"
        :href="attachment.url"
        target="_blank"
      >
        <v-list-item-icon>
          <v-icon>mdi-link</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="attachment.url" />
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-list>
</template>

<script>
  import firebase from 'firebase/app';
  import 'firebase/storage';

  const storage = firebase.storage();
  const storageRef = storage.ref();

  export default {
    props: {
      attachments: {
        type: Array,
        required: true,
      },
    },
    asyncComputed: {
      attachmentsList: {
        get () {
          return Promise.all(this.attachments.map(async (attachment, index) => {
            if (attachment.type === 'link') {
              return {
                key: index,
                type: 'link',
                url: attachment.url,
              };
            }
            if (attachment.type === 'file') {
              const fileRef = storageRef.child(attachment.filePath);
              const downloadUrl = await fileRef.getDownloadURL();
              return {
                key: index,
                type: 'file',
                filePath: attachment.filePath,
                fileName: fileRef.name,
                downloadUrl,
              };
            }
            throw new Error(`Nieznany typ załącznika: ${attachment.type}`);
          }));
        },
        default: null,
      },
    },
  };
</script>
