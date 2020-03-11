<template>
  <v-navigation-drawer
    app
    :value="value"
    :permanent="$vuetify.breakpoint.mdAndUp"
    clipped
    @input="$emit('input', $event)"
  >
    <v-list>
      <v-list-item
        v-for="link in visibleLinks"
        :key="link.to"
        :to="link.to"
      >
        <v-list-item-icon>
          <v-icon v-text="link.icon" />
        </v-list-item-icon>

        <v-list-item-title v-text="link.title" />
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
  export default {
    props: {
      value: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
      links: [
        {
          title: 'Strona główna',
          icon: 'mdi-home',
          to: '/',
        },
        {
          title: 'Dołącz do grupy',
          icon: 'mdi-account-multiple-plus',
          to: '/dolacz-do-grupy',
        },
        {
          title: 'Zarządzanie grupami',
          icon: 'mdi-account-multiple',
          to: '/zarzadzanie-grupami',
          teacherMode: true,
        },
      ],
    }),
    computed: {
      visibleLinks () {
        let teacherModeEnabled = false;
        if (this.$store.state.userData && this.$store.state.userData.teacherModeEnabled) teacherModeEnabled = true;
        return this.links.filter((link) => {
          if (link.teacherMode) {
            return teacherModeEnabled;
          }
          return true;
        });
      },
    },
  };
</script>
