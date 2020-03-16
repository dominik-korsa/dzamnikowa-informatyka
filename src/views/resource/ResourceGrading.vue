<template>
  <div class="fill-height">
    <v-card
      v-if="!answers || !resource"
      outlined
      class="fill-height mt-2"
    >
      <v-row
        align="center"
        justify="center"
        class="pa-8 fill-height"
      >
        <v-col cols="auto">
          <v-progress-circular
            indeterminate
            color="primary"
            :size="64"
          />
        </v-col>
      </v-row>
    </v-card>
    <v-card
      v-else-if="!isExercise"
      outlined
      class="fill-height mt-2"
    >
      <v-row
        align="center"
        justify="center"
        class="pa-8"
      >
        <v-col cols="auto">
          <h1 class="text-center display-1">
            Wybrany zasób nie jest zadaniem
          </h1>
        </v-col>
      </v-row>
    </v-card>
    <v-card
      v-else-if="$vuetify.breakpoint.smAndUp"
      outlined
      class="fill-height mt-2"
    >
      <v-row
        class="fill-height"
        no-gutters
      >
        <v-col
          class="shrink"
        >
          <resource-group-answers-list
            :answers="answers"
            :group-id="$route.params.groupId"
            :resource-id="$route.params.resourceId"
          />
        </v-col>
        <v-divider
          vertical
          class="fill-height"
        />
        <v-col
          v-if="!$route.params.answerId"
          class="pa-4 grow"
        >
          <v-row
            align="center"
            justify="center"
            class="fill-height"
          >
            <v-col cols="auto">
              <h1 class="text-center display-1">
                Wybierz rozwiązanie
              </h1>
            </v-col>
          </v-row>
        </v-col>
        <v-col
          v-else-if="!currentAnswer"
          class="pa-4 grow"
        >
          <v-row
            align="center"
            justify="center"
            class="fill-height"
          >
            <v-col cols="auto">
              <h1 class="text-center display-1">
                Wybrane rozwiązanie nie istnieje
              </h1>
            </v-col>
          </v-row>
        </v-col>
        <v-col
          v-else
          class="grow"
        >
          <resource-student-answer
            :group-id="$route.params.groupId"
            :answer="currentAnswer"
          />
        </v-col>
      </v-row>
    </v-card>
    <v-card
      v-else
      outlined
      class="mt-2 fill-height d-flex flex-column"
    >
      <resource-group-answers-list
        vertical
        :answers="answers"
        :group-id="$route.params.groupId"
        :resource-id="$route.params.resourceId"
      />
      <v-divider />
      <v-row
        v-if="!$route.params.answerId"
        align="center"
        justify="center"
        class="grow"
      >
        <v-col cols="auto">
          <h1 class="text-center display-1">
            Wybierz rozwiązanie
          </h1>
        </v-col>
      </v-row>
      <v-row
        v-else-if="!currentAnswer"
        align="center"
        justify="center"
        class="grow"
      >
        <v-col cols="auto">
          <h1 class="text-center display-1">
            Wybrane rozwiązanie nie istnieje
          </h1>
        </v-col>
      </v-row>
      <resource-student-answer
        v-else
        class="grow"
        :group-id="$route.params.groupId"
        :answer="currentAnswer"
      />
    </v-card>
    <resource-answer-creator-dialog ref="resourceAnswerCreatorDialog" />
  </div>
</template>

<script>
  import ResourceAnswerCreatorDialog from '@/components/resource/ResourceAnswerCreatorDialog.vue';
  import ResourceGroupAnswersList from '@/components/resource/ResourceGroupAnswersList.vue';
  import ResourceStudentAnswer from '@/components/resource/ResourceStudentAnswer.vue';

  export default {
    components: {
      ResourceAnswerCreatorDialog,
      ResourceStudentAnswer,
      ResourceGroupAnswersList,
    },
    data: () => ({
      answers: null,
      resource: null,
    }),
    computed: {
      loading () {
        return !this.answers || !this.resource;
      },
      isExercise () {
        if (!this.resource) return false;
        return this.resource.type === 'exercise';
      },
      currentAnswer () {
        return this.answers.find((answer) => answer.id === this.$route.params.answerId) || null;
      },
    },
    watch: {
      '$route.params.groupId': {
        handler (value, oldValue) {
          if (value === oldValue) return;
          this.bindFirestoreData(value, this.$route.params.resourceId);
        },
        immediate: true,
      },
      '$route.params.resourceId': {
        handler (value, oldValue) {
          if (value === oldValue) return;
          this.bindFirestoreData(this.$route.params.groupId, value);
        },
        immediate: true,
      },
    },
    methods: {
      bindFirestoreData (groupId, resourceId) {
        this.$bind('resource', this.$database
          .collection('groups').doc(groupId)
          .collection('resources').doc(resourceId));
        this.$bind('answers', this.$database
          .collection('groups').doc(groupId)
          .collection('resources').doc(resourceId)
          .collection('answers'));
      },
    },
  };
</script>
