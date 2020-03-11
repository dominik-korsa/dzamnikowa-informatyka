<template>
  <v-dialog
    v-model="showDialog"
    max-width="512"
  >
    <v-card>
      <v-card-title>Lista użyć kodu dołączenia</v-card-title>
      <v-divider />
      <v-row
        v-if="loading"
        justify="center"
        align="center"
        no-gutters
      >
        <v-col
          class="shrink px-4 py-12"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            :size="48"
          />
        </v-col>
      </v-row>
      <v-card-text
        v-else-if="useList.length === 0"
        class="py-8 body-1 text-center"
      >
        Kod nie został jeszcze użyty
      </v-card-text>
      <v-list v-else>
        <v-list-item
          v-for="user in useList"
          :key="user.id"
        >
          <v-list-item-avatar color="secondary">
            <v-img
              :src="user.photoURL"
            >
              <template v-slot:placeholder>
                <v-icon
                  dark
                >
                  mdi-account
                </v-icon>
              </template>
            </v-img>
          </v-list-item-avatar>
          <v-list-item-title>
            {{ user.displayName }}
            <span
              v-if="$store.state.user && user.id === $store.state.user.uid"
              class="font-weight-light"
            >(Ty)</span>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    data: () => ({
      showDialog: false,
      codeId: null,
      codeDoc: null,
    }),
    computed: {
      useList () {
        if (!this.$store.state.userDataCollection || !this.codeDoc) return null;
        return this.codeDoc.uses
          .map((userId) => this.$store.state.userDataCollection.find((user) => user.id === userId))
          .filter((user) => !!user);
      },
      loading () {
        return this.useList === null;
      },
    },
    methods: {
      async show (code) {
        this.showDialog = true;
        this.codeId = code;
        await this.$bind('codeDoc', this.$database.collection('group-join-codes').doc(code));
        await new Promise((resolve) => setTimeout(resolve, 500));
      },
    },
  };
</script>
