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
      :key="item.userId"
      color="secondary"
    >
      <template
        v-slot:activator
      >
        <v-badge
          overlap
          bordered
          :offset-x="32"
          :offset-y="22"
          :content="item.ungradedCount"
          :value="item.ungradedCount > 0"
        >
          <v-list-item-avatar
            v-if="item.user === null"
            color="grey"
          >
            <v-icon
              dark
            >
              mdi-account-off
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-avatar
            v-else
            color="secondary"
          >
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
        </v-badge>

        <v-list-item-content>
          <v-list-item-title v-if="item.user === null">
            Brak informacji o koncie
          </v-list-item-title>
          <v-list-item-title
            v-else
            v-text="item.user.displayName"
          />
          <v-list-item-subtitle
            v-if="item.maxPoints !== null"
          >
            Max punktów: {{ item.maxPoints }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </template>
      <v-list-item
        v-for="answer in item.answerItems"
        :key="answer.id"
        :to="`/grupy/${groupId}/zasoby/${resourceId}/ocenianie/${answer.id}`"
      >
        <v-list-item-content>
          <v-list-item-title v-text="answer.sendDateString" />
          <v-list-item-subtitle
            v-if="answer.points !== null"
          >
            Liczba punktów: {{ answer.points }}
          </v-list-item-subtitle>
          <v-list-item-subtitle
            v-else
            class="red--text"
          >
            Nie ocenione
          </v-list-item-subtitle>
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
      grades: {
        type: Array,
        required: true,
      },
    },
    computed: {
      studentItems () {
        if (!this.$store.state.userDataCollection) return [];

        const studentItems = _.toPairs(_.groupBy(this.answers, 'userId')).map(([userId, answers]) => {
          const user = this.$store.state.userDataCollection.find((item) => item.id === userId);

          const grades = this.grades.filter((grade) => grade.userId === userId);

          const maxPoints = _.max(grades.map((grade) => grade.points)) || null;

          const answerItems = _.orderBy(
            answers.map((answer) => {
              const grade = this.grades.find((e) => e.id === answer.id);
              return ({
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
                points: grade ? grade.points : null,
              });
            }),
            [(e) => (e.sendDate ? e.sendDate.toDate().getTime() : null)],
            ['desc'],
          );

          if (user) {
            return {
              userId,
              user,
              answerItems,
              maxPoints,
              ungradedCount: answers.length - grades.length,
            };
          }
          return {
            userId,
            user: null,
            answerItems,
            maxPoints,
            ungradedCount: answers.length - grades.length,
          };
        });

        const currentGroup = this.$store.state.teachedGroups.find((group) => group.id === this.groupId);

        let groupStudents;

        if (currentGroup) {
          groupStudents = currentGroup.students || [];
        } else {
          groupStudents = [];
        }

        return _.orderBy(
          studentItems,
          [(e) => _.findIndex(groupStudents, (studentId) => studentId === e.userId)],
        );
      },
    },
  };
</script>
