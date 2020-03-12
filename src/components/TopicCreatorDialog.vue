<template>
  <v-dialog
    v-model="visible"
    max-width="384"
  >
    <v-card>
      <v-card-title>Nowy temat</v-card-title>
      <v-form @submit.prevent="submit">
        <v-card-text>
          <v-text-field
            v-model="topicName"
            label="Nazwa tematu"
            outlined
            hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            outlined
            type="submit"
            :disabled="topicName === ''"
          >
            Stwórz
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import firebase from 'firebase/app';
  import 'firebase/firestore';

  export default {
    data: () => ({
      visible: false,
      topicName: '',
      groupId: null,
    }),
    methods: {
      show (groupId) {
        this.groupId = groupId;
        this.topicName = '';
        this.visible = true;
      },
      async submit () {
        if (this.topicName.trim() === '') return;

        if (!this.$store.state.user) {
          this.$toast.error('Błąd podczas pobierania danych o użytkowniku');
          return;
        }

        try {
          const groupReference = this.$database.collection('groups').doc(this.groupId);
          const newTopicReference = await groupReference.collection('topics').add({
            name: this.topicName.trim(),
            resources: [],
          });
          await groupReference.update({
            topics: firebase.firestore.FieldValue.arrayUnion(newTopicReference),
          });
          this.visible = false;
        } catch (error) {
          this.$toast.error('Podczas tworzenia tematu wystąpił nieoczekiwany błąd');
          console.error(error);
        }
      },
    },
  };
</script>
