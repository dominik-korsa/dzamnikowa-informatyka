<template>
  <v-dialog
    v-model="showDialog"
    max-width="512"
  >
    <v-card>
      <v-card-title>Utwórz nowy kod dołączania</v-card-title>
      <v-form
        @submit.prevent="submit"
      >
        <v-card-text>
          <v-card
            v-if="newCode"
            class="pa-3 text-center body-1 mb-4"
            outlined
          >
            Nowy kod to:
            <span
              class="ml-1 font-weight-bold"
              v-text="newCodeString[0]"
            />
            <span
              class="ml-1 font-weight-bold"
              v-text="newCodeString[1]"
            />
          </v-card>
          <v-select
            v-model="role"
            :items="roleItems"
            label="Rola"
            mandatory
            outlined
            hide-details
          />
          <v-row align="center">
            <v-col class="grow">
              <v-text-field
                v-model="maxUses"
                label="Limit użyć"
                outlined
                type="number"
                :disabled="!maxUsesEnabled"
                hide-details
                min="1"
                @change="maxUsesChange"
              />
            </v-col>
            <v-col cols="auto">
              <v-switch
                v-model="maxUsesEnabled"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            outlined
            type="submit"
            :loading="loading"
          >
            Generuj
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import firebase from 'firebase/app';
  import 'firebase/functions';

  export default {
    data: () => ({
      showDialog: false,
      groupId: null,
      roleItems: [
        {
          text: 'Uczeń',
          value: 'student',
        },
        {
          text: 'Nauczyciel',
          value: 'teacher',
        },
      ],
      role: 'student',
      maxUsesEnabled: false,
      maxUses: 10,
      loading: false,
      newCode: null,
    }),
    computed: {
      newCodeString () {
        return [
          this.newCode.toString().substring(0, 4),
          this.newCode.toString().substring(4),
        ];
      },
    },
    methods: {
      show (groupId) {
        this.newCode = null;
        this.groupId = groupId;
        this.showDialog = true;
      },
      maxUsesChange () {
        if (this.maxUses < 1) this.maxUses = 1;
      },
      async submit () {
        if (this.loading) return;
        this.loading = true;

        try {
          const response = await firebase.functions().httpsCallable('generateNewJoinCode')({
            groupId: this.groupId,
            role: this.role,
            maxUses: (this.maxUsesEnabled) ? this.maxUses : null,
          });
          this.newCode = response.data;
        } catch (error) {
          this.$toast.error('Podczas tworzenia kodu dołączenia wystąpił nieoczekiwany błąd');
          console.error(error);
        }

        this.loading = false;
      },
    },
  };
</script>
