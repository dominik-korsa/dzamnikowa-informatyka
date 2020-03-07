<template>
  <v-app>
    <v-content>
      <v-container
        class="fill-height primary"
        fluid
      >
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="auto"
          >
            <v-card
              class="pa-6"
              raised
            >
              <v-card-title class="display-1 justify-center text-center">
                Dżamnikowa Informatyka
              </v-card-title>
              <v-card-title class="headline justify-center text-center mb-6">
                Nie jesteś zalogowany
              </v-card-title>
              <v-card-actions>
                <div class="d-flex flex-column grow">
                  <v-btn
                    block
                    color="secondary"
                    large
                    :loading="googlePopupOpenCount > 0"
                    @click="showSignInWithGoogle()"
                  >
                    Zaloguj się przez Google
                  </v-btn>
                  <v-btn
                    class="mt-2"
                    block
                    color="secondary"
                    outlined
                    large
                    :loading="facebookPopupOpenCount > 0"
                    @click="showSignInWithFacebook()"
                  >
                    Zaloguj się przez Facebook
                  </v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>

  export default {
    data: () => ({
      googlePopupOpenCount: 0,
      facebookPopupOpenCount: 0,
    }),
    methods: {
      async showSignInWithGoogle () {
        if (this.googlePopupOpenCount === 0) {
          this.googlePopupOpenCount += 1;
          try {
            await this.$auth.signInWithGoogle();
          } catch (error) {
            this.showError(error);
            console.error(error);
          }

          this.googlePopupOpenCount -= 1;
        }
      },
      async showSignInWithFacebook () {
        if (this.facebookPopupOpenCount === 0) {
          this.facebookPopupOpenCount += 1;
          try {
            await this.$auth.signInWithFacebook();
          } catch (error) {
            this.showError(error);
            console.error(error);
          }

          this.facebookPopupOpenCount -= 1;
        }
      },
      showError (error) {
        if (error.code === 'auth/popup-closed-by-user') this.$toast.error('Logowanie zostało przerwane przez użytkownika');
        else if (error.code === 'auth/account-exists-with-different-credential') this.$toast.error('Istnieje już konto z tym samym adresem email, ale innym dostawcą');
        else this.$toast.error('Nie udało się zalogować');
      },
    },
  };
</script>
