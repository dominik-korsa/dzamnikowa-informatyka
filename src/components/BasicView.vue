<template>
  <v-app>
    <app-bar @click:nav-icon="showNavigationDrawer = !showNavigationDrawer" />
    <navigation-drawer v-model="showNavigationDrawer" />
    <v-dialog
      max-width="384"
      :value="show"
      :persistent="!acceptError"
    >
      <v-card>
        <v-card-title>
          Polityka prywatności
        </v-card-title>
        <v-card-text>
          <p>Dostępna jest nowa wersja polityki prywatności</p>
          <p class="mb-0">
            Najnowsza aktualizacja: {{ privacyPolicyConfig.dateFull }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            outlined
            color="secondary"
            :href="privacyPolicyConfig.link"
            target="_blank"
          >
            Przeczytaj
          </v-btn>
          <v-btn
            color="secondary"
            :loading="acceptLoading"
            @click="accept"
          >
            Zaakceptuj
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-content>
      <slot />
    </v-content>
  </v-app>
</template>

<script>
  import AppBar from '@/components/AppBar.vue';
  import NavigationDrawer from '@/components/NavigationDrawer.vue';
  import privacyPolicyConfig from '@/privacy-policy-config.js';

  export default {
    components: {
      AppBar,
      NavigationDrawer,
    },
    data: () => ({
      showNavigationDrawer: false,
      privacyPolicyConfig,
      acceptLoading: false,
      acceptError: false,
    }),
    computed: {
      show () {
        if (!this.$store.state.userData) return false;
        return this.$store.state.userData.privacyPolicyAcceptedVersion !== privacyPolicyConfig.version;
      },
    },
    methods: {
      async accept () {
        if (!this.$store.state.userData) return;

        this.acceptLoading = true;

        try {
          await this.$database.collection('user-data').doc(this.$store.state.user.uid).update({
            privacyPolicyAcceptedVersion: privacyPolicyConfig.version,
          });
        } catch (error) {
          this.$toast.error('Wystąpił nieoczekiwany błąd');
          console.error(error);
          this.acceptError = true;
        }

        this.acceptLoading = false;
      },
    },
  };
</script>
