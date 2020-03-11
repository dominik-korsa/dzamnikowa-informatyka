<template>
  <v-row
    v-if="loading"
    align="center"
    justify="center"
    class="fill-height"
  >
    <v-col cols="auto">
      <v-progress-circular
        indeterminate
        color="primary"
        :size="64"
      />
    </v-col>
  </v-row>
  <v-row
    v-else-if="!group"
    align="center"
    justify="center"
    class="fill-height pa-8"
  >
    <v-col cols="auto">
      <h1 class="text-center display-1">
        Wybrana grupa nie istnieje lub nie masz do niej dostępu
      </h1>
    </v-col>
  </v-row>
  <div
    v-else
  >
    <v-text-field
      v-model="groupName"
      label="Nazwa grupy"
      outlined
      class="mx-4 mt-4 mb-2"
      hide-details
      @change="groupNameChange"
      @blur="groupNameBlur"
    />
    <v-subheader>
      Lista nauczycieli
    </v-subheader>
    <v-list subheader>
      <v-list-item
        v-for="teacher in teachersList"
        :key="teacher.id"
      >
        <v-list-item-avatar color="secondary">
          <v-img
            :src="teacher.photoURL"
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
          {{ teacher.displayName }}
          <span
            v-if="$store.state.user && teacher.id === $store.state.user.uid"
            class="font-weight-light"
          >(Ty)</span>
        </v-list-item-title>
      </v-list-item>
    </v-list>
    <v-subheader>
      Lista uczniów
    </v-subheader>
    <v-list subheader>
      <v-list-item
        v-for="student in studentsList"
        :key="student.id"
      >
        <v-list-item-avatar color="secondary">
          <v-img
            :src="student.photoURL"
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
          {{ student.displayName }}
          <span
            v-if="$store.state.user && student.id === $store.state.user.uid"
            class="font-weight-light"
          >(Ty)</span>
        </v-list-item-title>
      </v-list-item>
    </v-list>
    <v-subheader>
      Kody dołączania
      <v-spacer />
      <v-btn
        text
        color="secondary"
        @click="showJoinCodeGeneratorDialog"
      >
        <v-icon left>
          mdi-plus
        </v-icon>
        {{ $vuetify.breakpoint.smAndDown ? 'Nowy' : 'Generuj nowy kod' }}
      </v-btn>
    </v-subheader>
    <v-list subheader>
      <v-list-item
        v-for="code in joinCodeItems"
        :key="code.id"
      >
        <v-list-item-content>
          <v-list-item-title
            :class="{
              'text--disabled': code.maxUses !== null && code.maxUses <= code.usedAmount
            }"
          >
            <span v-text="code.codeString[0]" />
            <span
              class="ml-1"
              v-text="code.codeString[1]"
            />
          </v-list-item-title>

          <v-list-item-subtitle
            :class="{
              'text--disabled': code.maxUses !== null && code.maxUses <= code.usedAmount
            }"
          >
            Użycia:
            <span v-text="code.usedAmount" /> /
            <v-icon
              v-if="code.maxUses === null"
              small
            >
              mdi-infinity
            </v-icon>
            <span
              v-else
              v-text="code.maxUses"
            />
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-chip
          v-if="code.role === 'teacher'"
          outlined
          color="secondary"
        >
          Nauczyciel
        </v-chip>
        <v-chip
          v-else-if="code.role === 'student'"
          outlined
        >
          Uczeń
        </v-chip>
        <v-list-item-action>
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="editCode(code.id)">
                <v-list-item-icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-list-item-icon>

                <v-list-item-title>
                  Edytuj
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="code.usedAmount === 0"
                @click="showCodeUses(code.id)"
              >
                <v-list-item-icon>
                  <v-icon>mdi-account-multiple</v-icon>
                </v-list-item-icon>

                <v-list-item-title>
                  Lista użyć
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="removeCode(code.id)">
                <v-list-item-icon>
                  <v-icon>mdi-delete</v-icon>
                </v-list-item-icon>

                <v-list-item-title>
                  Usuń
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <join-code-generate-dialog ref="joinCodeGenerateDialog" />
    <join-code-editor-dialog ref="joinCodeEditorDialog" />
    <join-code-remove-dialog
      ref="joinCodeRemoveDialog"
      @remove="removeCodeConfirm"
    />
    <join-code-use-list-dialog ref="joinCodeUseListDialog" />
  </div>
</template>

<script>
  import JoinCodeEditorDialog from '@/components/JoinCodeEditorDialog.vue';
  import JoinCodeGenerateDialog from '@/components/JoinCodeGenerateDialog.vue';
  import JoinCodeRemoveDialog from '@/components/JoinCodeRemoveDialog.vue';
  import JoinCodeUseListDialog from '@/components/JoinCodeUseListDialog.vue';

  export default {
    components: {
      JoinCodeGenerateDialog,
      JoinCodeEditorDialog,
      JoinCodeRemoveDialog,
      JoinCodeUseListDialog,
    },
    props: {
      groupId: {
        type: String,
        required: true,
      },
    },
    data: () => ({
      groupName: '',
      joinCodes: [],
    }),
    computed: {
      loading () {
        return this.$store.state.teachedGroups === null;
      },
      joinCodeItems () {
        return this.joinCodes.map((item) => ({
          id: item.id,
          role: item.role,
          maxUses: item.maxUses,
          usedAmount: item.uses.length,
          codeString: [
            item.id.substring(0, 4),
            item.id.substring(4),
          ],
        }));
      },
      group () {
        if (!this.$store.state.teachedGroups) return null;
        const theGroup = this.$store.state.teachedGroups.find((group) => group.id === this.groupId);
        if (!theGroup) return null;
        return theGroup;
      },
      teachersList () {
        if (!this.group || !this.group.teachers || !this.$store.state.userDataCollection) return [];
        return this.group.teachers
          .map((teacherId) => this.$store.state.userDataCollection.find((user) => user.id === teacherId))
          .filter((teacher) => !!teacher);
      },
      studentsList () {
        if (!this.group || !this.group.students || !this.$store.state.userDataCollection) return [];
        return this.group.students
          .map((studentId) => this.$store.state.userDataCollection.find((user) => user.id === studentId))
          .filter((student) => !!student);
      },
    },
    watch: {
      'group.name': {
        handler (value, oldValue) {
          if (this.groupName === '') {
            this.groupName = value;
            return;
          }

          if (oldValue === this.groupName) {
            this.groupName = value;
          }
        },
        immediate: true,
      },
      groupId: {
        handler (value) {
          if (value) {
            this.$bind('joinCodes', this.$database
              .collection('group-join-codes')
              .where('group', '==', this.$database.collection('groups').doc(value)), {
              maxRefDepth: 0,
            });
          } else if (this.$firestoreRefs.joinCodes) {
            this.$unbind('joinCodes');
          }
        },
        immediate: true,
      },
    },
    methods: {
      async groupNameChange () {
        if (!this.groupName || this.groupName === '') return;

        try {
          await this.$database.collection('groups').doc(this.groupId).update({
            name: this.groupName,
          });
        } catch (error) {
          this.$toast.error('Podczas zmiany nazwy wystąpił nieoczekiwany błąd');
          console.error(error);
        }
      },
      groupNameBlur () {
        if ((!this.groupName || this.groupName === '') && this.group.name) {
          this.groupName = this.group.name;
        }
      },
      showJoinCodeGeneratorDialog () {
        this.$refs.joinCodeGenerateDialog.show(this.groupId);
      },
      editCode (codeId) {
        this.$refs.joinCodeEditorDialog.show(codeId);
      },
      showCodeUses (codeId) {
        this.$refs.joinCodeUseListDialog.show(codeId);
      },
      async removeCode (codeId) {
        this.$refs.joinCodeRemoveDialog.show(codeId);
      },
      async removeCodeConfirm (codeId) {
        try {
          await this.$database.collection('group-join-codes').doc(codeId).delete();
        } catch (error) {
          this.$toast.error('Podczas usuwania kodu wystąpił nieoczekiwany błąd');
          console.error(error);
        }
      },
    },
  };
</script>
