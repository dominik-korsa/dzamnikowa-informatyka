<template>
  <v-app-bar
    app
    color="primary white--text"
    clipped-left
  >
    <v-app-bar-nav-icon
      v-if="$vuetify.breakpoint.smAndDown"
      color="white"
      @click="$emit('click:nav-icon')"
    />

    <v-toolbar-title>Dżamnikowa Informatyka</v-toolbar-title>

    <v-spacer />

    <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ on: menu }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on: tooltip }">
            <v-btn
              icon
              v-on="{ ...tooltip, ...menu }"
            >
              <v-avatar
                class="elevation-4"
                :size="$vuetify.breakpoint.xsOnly ? 40 : 48"
              >
                <v-img :src="$store.state.user.photoURL" />
              </v-avatar>
            </v-btn>
          </template>
          <span>
            {{
              ($store.state.userData && $store.state.userData.displayName)
                ? $store.state.userData.displayName
                : $store.state.user.displayName
            }}
          </span>
        </v-tooltip>
      </template>
      <v-list>
        <v-list-item
          @click="changeDisplayNameDialogVisible = true"
        >
          <v-list-item-icon>
            <v-icon>mdi-account-edit</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Zmień wyświetlaną nazwę</v-list-item-title>
        </v-list-item>
        <v-list-item @click="teacherModeEnabled = !teacherModeEnabled">
          <v-list-item-icon>
            <v-icon>
              mdi-teach
            </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>
              Tryb nauczyciela
            </v-list-item-title>
          </v-list-item-content>

          <v-list-item-action>
            <v-switch
              v-model="teacherModeEnabled"
              readonly
            />
          </v-list-item-action>
        </v-list-item>
        <v-list-item
          v-if="!addedProviders.includes('google.com')"
          :disabled="googleLoading"
          @click="linkGoogle"
        >
          <v-list-item-icon>
            <v-progress-circular
              v-if="googleLoading"
              indeterminate
              :size="24"
            />
            <v-icon v-else>
              mdi-google
            </v-icon>
          </v-list-item-icon>

          <v-list-item-title>
            Połącz konto Google
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="!addedProviders.includes('facebook.com')"
          :disabled="facebookLoading"
          @click="linkFacebook"
        >
          <v-list-item-icon>
            <v-progress-circular
              v-if="facebookLoading"
              indeterminate
              :size="24"
            />
            <v-icon v-else>
              mdi-facebook
            </v-icon>
          </v-list-item-icon>

          <v-list-item-title>
            Połącz konto Facebook
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="addedProviders.includes('facebook.com')"
          :disabled="addedProviders.length === 1 || facebookLoading"
          @click="unlinkFacebook"
        >
          <v-list-item-icon>
            <v-progress-circular
              v-if="facebookLoading"
              indeterminate
              :size="24"
            />
            <v-icon v-else>
              mdi-facebook
            </v-icon>
          </v-list-item-icon>

          <v-list-item-title>
            Odłącz konto Facebook
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="signOut">
          <v-list-item-icon>
            <v-icon>mdi-logout-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Wyloguj się</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <change-display-name-dialog v-model="changeDisplayNameDialogVisible" />
  </v-app-bar>
</template>

<script>
  import ChangeDisplayNameDialog from '@/components/ChangeDisplayNameDialog.vue';

  export default {
    components: {
      ChangeDisplayNameDialog,
    },
    data: () => ({
      changeDisplayNameDialogVisible: false,
      googleLoading: false,
      facebookLoading: false,
    }),
    computed: {
      addedProviders () {
        if (!this.$store.state.user) return [];
        return this.$store.state.user.providerData.map((provider) => provider.providerId);
      },
      teacherModeEnabled: {
        get () {
          if (this.$store.state.userData && this.$store.state.userData.teacherModeEnabled) {
            return this.$store.state.userData.teacherModeEnabled;
          }
          return false;
        },
        async set (value) {
          if (!this.$store.state.user) return;
          const userDataDocReference = this.$database.collection('user-data').doc(this.$store.state.user.uid);
          await userDataDocReference.update({
            teacherModeEnabled: value,
          });
        },
      },
    },
    methods: {
      async linkGoogle () {
        this.googleLoading = true;

        try {
          await this.$auth.linkGoogle();
        } catch (error) {
          this.$toast.error('Nie udało się połączyć konta');
          console.error(error);
        }

        this.googleLoading = false;
      },
      async linkFacebook () {
        this.facebookLoading = true;

        try {
          await this.$auth.linkFacebook();
        } catch (error) {
          this.$toast.error('Nie udało się połączyć konta');
          console.error(error);
        }

        this.facebookLoading = false;
      },
      async unlinkFacebook () {
        this.facebookLoading = true;

        try {
          await this.$auth.unlinkFacebook();
        } catch (error) {
          this.$toast.error('Nie udało się odłączyć konta');
          console.error(error);
        }

        this.facebookLoading = false;
      },
      signOut () {
        this.$auth.signOut();
      },
    },
  };
</script>
