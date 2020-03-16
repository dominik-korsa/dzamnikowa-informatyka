<template>
  <div>
    <h3 class="text-center headline ma-4">
      Załączniki
    </h3>
    <h4
      v-if="!answer.attachments || answer.attachments.length === 0"
      class="subtitle-1 text-center mx-4 my-12"
    >
      Zasób nie posiada załączników
    </h4>
    <resource-answer-attachments-list
      v-else
      :attachments="answer.attachments"
    />
    <h3 class="text-center headline ma-4">
      Ocena
    </h3>
    <v-card
      v-if="grade"
      outlined
      class="mx-6"
    >
      <v-card-title>
        <span class="font-weight-light">Liczba punktów:</span>
        <span
          class="font-weight-regular ml-2"
          v-text="grade.points"
        />
      </v-card-title>
      <v-card-text
        v-if="grade.comment"
        v-text="grade.comment"
      />
      <v-card-text v-else>
        Nie dodano komentarza
      </v-card-text>
      <v-card-actions v-if="grade.edited">
        <span class="caption ml-2 my-2 text--secondary">
          Edytowana
        </span>
      </v-card-actions>
    </v-card>
    <h4
      v-else
      class="subtitle-1 text-center mx-4 my-12"
    >
      Rozwiązanie nie zostało ocenione
    </h4>
  </div>
</template>

<script>
  import ResourceAnswerAttachmentsList from '@/components/resource/ResourceAnswerAttachmentsList.vue';

  export default {
    components: {
      ResourceAnswerAttachmentsList,
    },
    props: {
      groupId: {
        type: String,
        required: true,
      },
      resourceId: {
        type: String,
        required: true,
      },
      answer: {
        type: Object,
        required: true,
      },
    },
    data: () => ({
      grade: null,
    }),
    watch: {
      'answer.id': {
        handler (value, oldValue) {
          if (!value || value === oldValue) return;
          const gradeReference = this.$database
            .collection('groups').doc(this.groupId)
            .collection('resources').doc(this.resourceId)
            .collection('grades')
            .doc(value);

          this.$bind('grade', gradeReference);
        },
        immediate: true,
      },
    },
  };
</script>
