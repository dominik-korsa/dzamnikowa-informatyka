<template>
  <v-container class="fill-height">
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        :cols="12"
        :sm="8"
        :md="6"
        :lg="4"
      >
        <v-form @submit.prevent="submit">
          <h1 class="text-center display-1 mb-8">
            Dołącz do grupy
          </h1>
          <v-text-field
            v-model="codeInputValue"
            v-mask="'#### ####'"
            outlined
            label="Kod dołączenia"
            hide-details
            class="mb-2"
          />
          <v-btn
            type="submit"
            color="primary"
            block
            :disabled="code.length !== 8"
            outlined
            :loading="loading"
          >
            Dołącz
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import firebase from 'firebase/app';
  import 'firebase/functions';
  import { mask } from 'vue-the-mask';

  export default {
    directives: {
      mask,
    },
    data: () => ({
      codeInputValue: '',
      loading: false,
    }),
    computed: {
      code () {
        return this.codeInputValue.replace(/\s/g, '');
      },
    },
    methods: {
      async submit () {
        if (this.code.length !== 8) return;
        if (this.loading) return;

        this.loading = true;

        try {
          const response = await firebase.functions().httpsCallable('joinGroup')({
            code: this.code,
          });
          if (response.data.success) {
            this.$toast('Dołączono do grupy');
            this.codeInputValue = '';
          } else if (response.data.reason === 'unknown-code') {
            this.$toast.error('Nie znaleziono kodu');
          } else if (response.data.reason === 'use-limit-reached') {
            this.$toast.error('Limit wykorzystania kodu został już wykorzystany');
          } else if (response.data.reason === 'already-joined') {
            this.$toast.error('Już należysz do tej grupy');
          } else {
            console.log(response);
            throw new Error(response.data.reason);
          }
        } catch (error) {
          console.error(error);
          this.$toast.error('Podczas dołączania wystąpił nieoczekiwany błąd');
        }

        this.loading = false;
      },
    },
  };
</script>
