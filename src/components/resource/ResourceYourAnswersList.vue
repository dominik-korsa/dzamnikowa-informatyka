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
        Nie wysłałeś żadnego rozwiązania
      </h1>
      <v-btn
        outlined
        color="secondary"
        class="mt-8"
        block
        @click="createNewAnswer"
      >
        Wyślij nowe rozwiązanie
      </v-btn>
    </v-col>
  </v-row>
  <v-list v-else>
    <v-list-item
      v-for="answer in answerItems"
      :key="answer.id"
      :to="`/grupy/${groupId}/zasoby/${resourceId}/twoje-rozwiazania/${answer.id}`"
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
      answerItems () {
        return _.orderBy(
          this.answers.map(
            (answer) => ({
              id: answer.id,
              sendDate: answer.sendDate,
              sendDateString: answer.sendDate ? answer.sendDate.toDate().toLocaleString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : '-',
              late: false,
            }),
          ),
          [(e) => (e.sendDate ? e.sendDate.toDate().getTime() : null)],
          ['desc'],
        );
      },
    },
    methods: {
      createNewAnswer () {
        this.$emit('click:create-new-answer');
      },
    },
  };
</script>
