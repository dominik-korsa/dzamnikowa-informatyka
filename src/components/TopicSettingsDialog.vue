<template>
  <v-dialog
    v-model="showDialog"
    max-width="512"
  >
    <v-card>
      <v-card-title>Ustawienia tematu</v-card-title>
      <v-row
        v-if="loading"
        justify="center"
        align="center"
        no-gutters
      >
        <v-col
          class="shrink px-4 py-12"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            :size="48"
          />
        </v-col>
      </v-row>
      <v-form
        v-else
        @submit.prevent="submit"
      >
        <v-card-text>
          <v-text-field
            v-model="name"
            label="Nazwa tematu"
            outlined
            hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-tooltip
            v-if="deleteDisabled"
            bottom
          >
            <template v-slot:activator="{ on }">
              <span v-on="on">
                <v-btn
                  color="red"
                  text
                  :loading="deleteLoading"
                  disabled
                >
                  Usuń
                </v-btn>
              </span>
            </template>
            <span>Przenieś wszystkie zasoby do innego tematu aby usunąć</span>
          </v-tooltip>
          <v-btn
            v-else
            color="red"
            text
            :loading="deleteLoading"
            @click="deleteTopic()"
          >
            Usuń
          </v-btn>
          <v-btn
            color="secondary"
            outlined
            type="submit"
            :loading="editLoading"
            :disabled="!dataChanged"
          >
            Zapisz zmiany
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
      showDialog: false,
      groupId: null,
      topicId: null,
      topicDoc: null,
      name: '',
      loading: true,
      deleteLoading: false,
      editLoading: false,
    }),
    computed: {
      dataChanged () {
        if (!this.topicDoc) return false;
        return this.topicDoc.name !== this.name.trim();
      },
      deleteDisabled () {
        if (!this.topicDoc) return true;
        if (!this.topicDoc.resources) return false;
        return this.topicDoc.resources.length > 0;
      },
    },
    methods: {
      async show (groupId, topicId) {
        this.loading = true;
        this.showDialog = true;
        this.groupId = groupId;
        this.topicId = topicId;
        await this.$bind('topicDoc', this.$database.collection('groups').doc(groupId).collection('topics').doc(topicId));
        this.name = this.topicDoc.name;
        await new Promise((resolve) => setTimeout(resolve, 500));
        this.loading = false;
      },
      async submit () {
        if (!this.dataChanged) return;
        if (this.name.trim() === '') return;
        this.editLoading = true;
        try {
          const topicReference = this.$database.collection('groups').doc(this.groupId).collection('topics').doc(this.topicId);
          await topicReference.update({
            name: this.name.trim(),
          });
        } catch (error) {
          this.$toast.error('Podczas edytowania tematu wystąpił nieoczekiwany błąd');
          console.error(error);
        }
        this.editLoading = false;
      },
      async deleteTopic () {
        if (this.deleteDisabled) return;

        this.deleteLoading = true;

        try {
          const groupReference = this.$database.collection('groups').doc(this.groupId);
          const topicReference = groupReference.collection('topics').doc(this.topicId);
          await groupReference.update({
            topics: firebase.firestore.FieldValue.arrayRemove(topicReference),
          });
          await topicReference.delete();

          this.showDialog = false;
        } catch (error) {
          this.$toast.error('Podczas usuwania tematu wystąpił nieoczekiwany błąd');
          console.error(error);
        }

        this.deleteLoading = false;
      },
    },
  };
</script>
