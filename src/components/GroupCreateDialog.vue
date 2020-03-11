<template>
  <v-dialog
    v-model="visible"
    max-width="384"
  >
    <v-card>
      <v-card-title>Nowa grupa</v-card-title>
      <v-form @submit.prevent="submit">
        <v-card-text>
          <v-text-field
            v-model="groupName"
            label="Nazwa grupy"
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
            :disabled="groupName === ''"
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
      groupName: '',
    }),
    methods: {
      show () {
        this.groupName = '';
        this.visible = true;
      },
      async submit () {
        if (this.groupName === '') return;

        if (!this.$store.state.user) {
          this.$toast.error('Błąd podczas pobierania danych o użytkowniku');
          return;
        }

        try {
          const newGroupReference = await this.$database.collection('groups').add({
            name: this.groupName,
            students: [],
            teachers: [
              this.$store.state.user.uid,
            ],
          });
          this.$router.push(`/zarzadzanie-grupami/${newGroupReference.id}`);
          this.visible = false;
        } catch (error) {
          this.$toast.error('Podczas tworzenia grupy wystąpił nieoczekiwany błąd');
          console.error(error);
        }
      },
    },
  };
</script>
