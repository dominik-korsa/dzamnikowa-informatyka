<template>
  <v-dialog
    v-model="showDialog"
    max-width="512"
  >
    <v-card>
      <v-card-title>Edytuj kod dołączania</v-card-title>
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
      <v-form
        v-else
        @submit.prevent="submit"
      >
        <v-card-text>
          <v-card
            v-if="codeString"
            class="pa-3 text-center body-1 mb-4"
            outlined
          >
            Edytowany kod to:
            <span
              class="ml-1 font-weight-bold"
              v-text="codeString[0]"
            />
            <span
              class="ml-1 font-weight-bold"
              v-text="codeString[1]"
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
            color="red"
            text
            @click="remove"
          >
            Usuń
          </v-btn>
          <v-btn
            color="secondary"
            outlined
            type="submit"
            :loading="editLoading"
            :disabled="!dataChanged"
          >
            Zapisz zmiany
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    data: () => ({
      showDialog: false,
      codeId: null,
      codeDoc: null,
      role: null,
      maxUses: null,
      maxUsesEnabled: false,
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
      loading: true,
      editLoading: false,
    }),
    computed: {
      codeString () {
        if (!this.codeId) return null;
        return [
          this.codeId.substring(0, 4),
          this.codeId.substring(4),
        ];
      },
      dataChanged () {
        if (!this.codeDoc) return false;
        return this.codeDoc.role !== this.role ||
          (this.codeDoc.maxUses !== null) !== this.maxUsesEnabled ||
          ((this.codeDoc.maxUses !== null) && this.codeDoc.maxUses !== this.maxUses);
      },
    },
    watch: {
      maxUsesEnabled: {
        handler (value) {
          if (value === true && this.maxUses === null) {
            this.maxUses = 10;
          }
        },
        immediate: true,
      },
    },
    methods: {
      async show (code) {
        this.loading = true;
        this.showDialog = true;
        this.codeId = code;
        await this.$bind('codeDoc', this.$database.collection('group-join-codes').doc(code));
        this.role = this.codeDoc.role;
        if (this.codeDoc.maxUses === null) {
          this.maxUsesEnabled = false;
          this.maxUses = null;
        } else {
          this.maxUsesEnabled = true;
          this.maxUses = this.codeDoc.maxUses;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        this.loading = false;
      },
      maxUsesChange () {
        if (this.maxUses === null) return;
        if (this.maxUses < 1) this.maxUses = 1;
      },
      async submit () {
        if (!this.dataChanged) return;
        this.editLoading = true;
        try {
          const codeReference = this.$database.collection('group-join-codes').doc(this.codeId);
          await codeReference.update({
            maxUses: this.maxUsesEnabled ? this.maxUses : null,
            role: this.role,
          });
        } catch (error) {
          this.$toast.error('Podczas edytowania kodu wystąpił nieoczekiwany błąd');
          console.error(error);
        }
        this.editLoading = false;
      },
      async remove () {
        this.loading = true;
        try {
          await this.$database.collection('group-join-codes').doc(this.codeId).delete();
          this.showDialog = false;
        } catch (error) {
          this.$toast.error('Podczas usuwania kodu wystąpił nieoczekiwany błąd');
          console.error(error);
          this.loading = false;
        }
      },
    },
  };
</script>
