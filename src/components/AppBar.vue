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

    <v-menu>
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
    }),
    methods: {
      signOut () {
        this.$auth.signOut();
      },
    },
  };
</script>
