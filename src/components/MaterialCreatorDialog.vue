<template>
  <v-dialog
    v-model="visible"
    max-width="384"
  >
    <v-card>
      <v-card-title>Nowy materiał</v-card-title>
      <v-form @submit.prevent="submit">
        <v-card-text>
          <v-text-field
            v-model="materialName"
            label="Nazwa materiału"
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
            :disabled="materialName.trim() === ''"
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
      materialName: '',
      groupId: null,
    }),
    methods: {
      show (groupId) {
        this.groupId = groupId;
        this.materialName = '';
        this.visible = true;
      },
      async submit () {
        if (this.materialName.trim() === '') return;

        if (!this.$store.state.user) {
          this.$toast.error('Błąd podczas pobierania danych o użytkowniku');
          return;
        }

        try {
          const groupReference = this.$database.collection('groups').doc(this.groupId);
          const newMaterialReference = await groupReference.collection('sketches').add({
            name: this.materialName.trim(),
            type: 'material',
          });
          this.$router.push(`/grupy/${this.groupId}/szkice/${newMaterialReference.id}`);
          this.visible = false;
        } catch (error) {
          this.$toast.error('Podczas tworzenia materiału wystąpił nieoczekiwany błąd');
          console.error(error);
        }
      },
    },
  };
</script>
