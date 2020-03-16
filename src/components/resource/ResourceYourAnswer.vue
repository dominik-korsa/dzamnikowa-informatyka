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
    <h4
      class="subtitle-1 text-center mx-4 my-12"
    >
      Ta funkcja nie jest jeszcze wspierana
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
      answer: {
        type: Object,
        required: true,
      },
    },
  };
</script>
