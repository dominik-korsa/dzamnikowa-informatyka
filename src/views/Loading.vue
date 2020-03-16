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
            <v-progress-circular
              indeterminate
              color="white"
              :size="92"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>

  export default {
    components: {
    },
  };
</script>
