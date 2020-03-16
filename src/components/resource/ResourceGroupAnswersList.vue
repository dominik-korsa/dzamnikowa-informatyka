<template>
  <v-row
    v-if="answers.length === 0"
    align="center"
    justify="center"
    class="px-4 py-8"
    :class="{
      'fill-height': !vertical,
    }"
  >
    <v-col cols="auto">
      <h1 class="text-center display-1">
        Nie wysłano żadnych rozwiązań
      </h1>
    </v-col>
  </v-row>
  <v-list
    v-else
    expand
  >
    <v-list-group
      v-for="item in studentItems"
      :key="item.studentId"
    >
      <template
        v-if="item.user === null"
        v-slot:activator
      >
        <v-list-item-content>
          <v-list-item-title>
            Brak informacji o koncie
          </v-list-item-title>
        </v-list-item-content>
      </template>
      <template
        v-else
        v-slot:activator
      >
        <v-list-item-avatar color="secondary">
          <v-img
            :src="item.user.photoURL"
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

        <v-list-item-content>
          <v-list-item-title v-text="item.user.displayName" />
        </v-list-item-content>
      </template>
      <v-list-item
        v-for="answer in item.answerItems"
        :key="answer.id"
        :to="`/grupy/${groupId}/zasoby/${resourceId}/ocenianie/${answer.id}`"
      >
        <v-list-item-content>
          <v-list-item-title v-text="answer.sendDateString" />
        </v-list-item-content>
        <v-chip
          v-if="answer.late"
          color="red"
          outlined
          class="ml-4"
        >
          Spóźnione
        </v-chip>
      </v-list-item>
    </v-list-group>
  </v-list>
</template>

<script>
  import * as _ from 'lodash';

  export default {
    props: {
      vertical: {
        type: Boolean,
        default: false,
      },
      groupId: {
        type: String,
        required: true,
      },
      resourceId: {
        type: String,
        required: true,
      },
      answers: {
        type: Array,
        required: true,
      },
    },
    computed: {
      studentItems () {
        if (!this.$store.state.userDataCollection) return [];

        const studentItems = _.toPairs(_.groupBy(this.answers, 'userId')).map(([userId, answers]) => {
          const user = this.$store.state.userDataCollection.find((item) => item.id === userId);

          const answerItems = _.orderBy(
            answers.map((answer) => ({
              id: answer.id,
              userId: answer.userId,
              sendDate: answer.sendDate,
              sendDateString: answer.sendDate ? answer.sendDate.toDate().toLocaleString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : '-',
              late: false,
            })),
            [(e) => (e.sendDate ? e.sendDate.toDate().getTime() : null)],
            ['desc'],
          );

          if (user) {
            return {
              userId,
              user,
              answerItems,
            };
          }
          return {
            userId,
            user: null,
            answerItems,
          };
        });

        const currentGroup = this.$store.state.teachedGroups.find((group) => group.id === this.groupId);

        let groupStudents;

        if (currentGroup) {
          groupStudents = currentGroup.students || [];
        } else {
          groupStudents = [];
        }

        const orderedStudentItems = _.orderBy(
          studentItems,
          [(e) => _.findIndex(groupStudents, (studentId) => studentId === e.userId)],
        );

        return orderedStudentItems;
      },
    },
  };
</script>
