<template>
  <v-dialog
    v-model="visible"
    max-width="384"
  >
    <v-card>
      <v-card-title>Nowy zasób</v-card-title>
      <v-form @submit.prevent="submit">
        <v-card-text>
          <v-text-field
            v-model="resourceName"
            label="Nazwa zasobu"
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
            :disabled="resourceName.trim() === ''"
          >
            Stwórz
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    data: () => ({
      visible: false,
      resourceName: '',
      groupId: null,
    }),
    methods: {
      show (groupId, resourceType) {
        this.groupId = groupId;
        this.resourceName = '';
        this.resourceType = resourceType;
        this.visible = true;
      },
      async submit () {
        if (this.resourceName.trim() === '') return;

        if (!this.$store.state.user) {
          this.$toast.error('Błąd podczas pobierania danych o użytkowniku');
          return;
        }

        try {
          const groupReference = this.$database.collection('groups').doc(this.groupId);
          const newSketchReference = await groupReference.collection('sketches').add({
            name: this.resourceName.trim(),
            type: this.resourceType,
          });
          this.$router.push(`/grupy/${this.groupId}/szkice/${newSketchReference.id}`);
          this.visible = false;
        } catch (error) {
          this.$toast.error('Podczas tworzenia materiału wystąpił nieoczekiwany błąd');
          console.error(error);
        }
      },
    },
  };
</script>
