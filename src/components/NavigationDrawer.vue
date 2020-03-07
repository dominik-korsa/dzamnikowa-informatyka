<template>
  <v-navigation-drawer
    app
    :value="value"
    :permanent="$vuetify.breakpoint.mdAndUp"
    clipped
    @input="$emit('input', $event)"
  >
    <v-list>
      <v-list-item link>
        <v-list-item-icon>
          <v-icon>mdi-account-multiple-plus</v-icon>
        </v-list-item-icon>

        <v-list-item-title>
          Dołącz do grupy
        </v-list-item-title>
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
  };
</script>
