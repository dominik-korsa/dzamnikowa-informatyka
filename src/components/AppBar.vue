<template>
  <v-app-bar
    app
    color="primary"
    dark
    clipped-left
  >
    <v-app-bar-nav-icon
      v-if="$vuetify.breakpoint.smAndDown"
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
                :size="$vuetify.breakpoint.smAndDown ? 40 : 48"
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
        <v-list-item
          v-if="teacherModeEnabled"
          @click="disableTeacherMode"
        >
          <v-list-item-icon>
            <v-icon>
              mdi-teach
            </v-icon>
          </v-list-item-icon>
          <v-list-item-title>
            Wyłącz tryb nauczyciela
          </v-list-item-title>`
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
          :disabled="addedProviders.length === 1"
          @click="facebookUnlinkDialogVisible = true"
        >
          <v-list-item-icon>
            <v-icon>
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
        <v-list-item
          v-long-press="1000"
          :href="privacyPolicyConfig.link"
          target="_blank"
          @click="privacyPolicyClick"
          @long-press-start="enableTeacherModeStart"
          @long-press-stop="enableTeacherModeStop"
        >
          <v-list-item-icon>
            <v-icon>mdi-lock</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Polityka Prywatności</v-list-item-title>
            <v-list-item-subtitle v-text="privacyPolicyConfig.dateFull" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <change-display-name-dialog v-model="changeDisplayNameDialogVisible" />
    <facebook-unlink-dialog v-model="facebookUnlinkDialogVisible" />
  </v-app-bar>
</template>

<script>
  import ChangeDisplayNameDialog from '@/components/ChangeDisplayNameDialog.vue';
  import FacebookUnlinkDialog from '@/components/FacebookUnlinkDialog.vue';
  import privacyPolicyConfig from '@/privacy-policy-config';
  import LongPress from 'vue-directive-long-press';

  export default {
    components: {
      ChangeDisplayNameDialog,
      FacebookUnlinkDialog,
    },
    directives: {
      LongPress,
    },
    data: () => ({
      changeDisplayNameDialogVisible: false,
      facebookUnlinkDialogVisible: false,
      googleLoading: false,
      facebookLoading: false,
      privacyPolicyConfig,
      teacherModeLongPress: false,
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
      signOut () {
        this.$auth.signOut();
      },
      enableTeacherModeStart () {
        this.teacherModeLongPress = true;
        if (!this.teacherModeEnabled) {
          this.$toast('Włączono tryb nauczyciela');
        } else {
          this.$toast('Tryb nauczyciela jest już włączony');
        }
      },
      privacyPolicyClick (event) {
        if (this.teacherModeLongPress) {
          event.preventDefault();
        }
      },
      enableTeacherModeStop () {
        if (!this.teacherModeEnabled) {
          this.teacherModeEnabled = true;
        }

        setTimeout(() => {
          this.teacherModeLongPress = false;
        }, 100);
      },
      disableTeacherMode () {
        if (this.teacherModeEnabled) {
          this.teacherModeEnabled = false;
          this.$toast('Wyłączono tryb nauczyciela');
        }
      },
    },
  };
</script>
