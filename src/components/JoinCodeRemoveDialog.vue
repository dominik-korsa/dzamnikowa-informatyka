<template>
  <v-dialog
    v-model="visible"
    max-width="384"
  >
    <v-card>
      <v-card-title>Usunąć kod?</v-card-title>
      <v-card-text>Usuniętego kodu nie można przywrócić.</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="visible = false"
        >
          Anuluj
        </v-btn>
        <v-btn
          color="red"
          outlined
          @click="remove"
        >
          Usuń
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    data: () => ({
      visible: false,
      codeId: null,
    }),
    methods: {
      show (codeId) {
        this.codeId = codeId;
        this.visible = true;
      },
      remove () {
        this.$emit('remove', this.codeId);
        this.visible = false;
      },
    },
  };
</script>
