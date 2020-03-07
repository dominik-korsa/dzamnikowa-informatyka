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
                <v-btn
                  block
                  color="secondary"
                  large
                  :loading="openPopupsCount > 0"
                  @click="showSignIn()"
                >
                  Zaloguj się przez Google
                </v-btn>
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
      openPopupsCount: 0,
    }),
    methods: {
      async showSignIn () {
        if (this.openPopupsCount === 0) {
          this.openPopupsCount += 1;
          try {
            await this.$auth.signIn();
          } catch (error) {
            console.error('Sign in failed');
            console.error(error);
          }

          this.openPopupsCount -= 1;
        }
      },
    },
  };
</script>
