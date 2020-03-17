<template>
  <v-app>
    <v-content>
      <v-container
        class="fill-height primary darken-1"
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
              :class="{
                'px-6 pb-6': $vuetify.breakpoint.smAndUp,
              }"
              class="pt-1"
              raised
            >
              <v-img
                v-if="$vuetify.breakpoint.smAndUp"
                src="@/assets/logo.png"
                max-height="128"
                max-width="128"
                class="card-logo elevation-4"
              />

              <v-img
                v-else
                src="@/assets/logo.png"
                max-height="96"
                max-width="96"
                class="card-logo card-logo--small elevation-4"
              />

              <v-card-title
                class="justify-center text-center"
                :class="{
                  'display-1': $vuetify.breakpoint.smAndUp,
                  'headline': $vuetify.breakpoint.xsOnly,
                }"
              >
                Dżamnikowa<br>
                Informatyka
              </v-card-title>
              <v-card-title
                class="headline justify-center text-center mb-6"
                :class="{
                  'headline': $vuetify.breakpoint.smAndUp,
                  'body-1': $vuetify.breakpoint.xsOnly,
                }"
              >
                Nie jesteś zalogowany
              </v-card-title>
              <v-card-actions>
                <div class="d-flex flex-column grow">
                  <v-btn
                    text
                    outlined
                    :href="privacyPolicyConfig.link"
                    target="_blank"
                  >
                    Polityka Prywatności
                  </v-btn>
                  <v-btn
                    class="mt-2"
                    block
                    color="secondary"
                    :large="$vuetify.breakpoint.smAndUp"
                    :loading="googlePopupOpenCount > 0"
                    @click="showSignInWithGoogle()"
                  >
                    <span v-if="$vuetify.breakpoint.smAndUp">Zaloguj się przez Google</span>
                    <span v-else>Logowanie Google</span>
                  </v-btn>
                  <v-btn
                    class="mt-2"
                    block
                    color="secondary"
                    outlined
                    :large="$vuetify.breakpoint.smAndUp"
                    :loading="facebookPopupOpenCount > 0"
                    @click="showSignInWithFacebook()"
                  >
                    <span v-if="$vuetify.breakpoint.smAndUp">Zaloguj się przez Facebook</span>
                    <span v-else>Logowanie Facebook</span>
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
  import privacyPolicyConfig from '@/privacy-policy-config';

  export default {
    data: () => ({
      googlePopupOpenCount: 0,
      facebookPopupOpenCount: 0,
      privacyPolicyConfig,
    }),
    methods: {
      async showSignInWithGoogle () {
        if (this.googlePopupOpenCount === 0) {
          this.googlePopupOpenCount += 1;
          try {
            await this.$auth.signInWithGoogle();
          } catch (error) {
            this.$sendError('login/google', {
              error: {
                name: error.name || null,
                message: error.message || null,
              },
            });
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
            this.$sendError('login/google', {
              error: {
                name: error.name || null,
                message: error.message || null,
              },
            });
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

<style lang="scss">
  .card-logo {
    margin-left: auto;
    margin-right: auto;
    margin-top: -68px;
    border-radius: 64px !important;

    &--small {
      margin-top: -50px;
      border-radius: 48px !important;
    }
  }
</style>
