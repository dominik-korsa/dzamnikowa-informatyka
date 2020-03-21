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
      v-if="grade && !gradeEditMode"
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
      >
        <vue-markdown
          class="markdown-output"
          :source="grade.comment"
          @rendered="updateSyntax"
        />
      </v-card-text>
      <v-card-text v-else>
        Nie dodano komentarza
      </v-card-text>
      <v-card-actions>
        <span
          v-if="grade.edited"
          class="caption ml-2 my-2 text--secondary"
        >
          Edytowana
        </span>
        <v-spacer />
        <v-btn
          color="secondary"
          type="submit"
          text
          @click="startEditing"
        >
          Zmień ocenę
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-form
      v-else
      @submit.prevent="submit"
    >
      <v-card
        outlined
        class="mx-6"
      >
        <v-card-text>
          <v-text-field
            v-model="gradePoints"
            label="Liczba punktów"
            outlined
            color="secondary"
            type="number"
            min="0"
            :rules="pointsRules"
            :readonly="saveLoading"
          />
          <v-textarea
            v-model="gradeComment"
            label="Komentarz"
            outlined
            color="secondary"
            auto-grow
            hint="Możesz używać markdwon"
            :readonly="saveLoading"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <template v-if="grade">
            <v-btn
              color="secondary"
              text
              @click="cancelEditing"
            >
              Anuluj
            </v-btn>
            <v-btn
              color="secondary"
              type="submit"
              :disabled="!gradeSaveEnabled"
              :loading="saveLoading"
            >
              Zmień ocenę
            </v-btn>
          </template>
          <v-btn
            v-else
            color="secondary"
            type="submit"
            :disabled="!gradeSaveEnabled"
            :loading="saveLoading"
          >
            Oceń
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </div>
</template>

<script>
  import ResourceAnswerAttachmentsList from '@/components/resource/ResourceAnswerAttachmentsList.vue';
  import Prism from 'prismjs';
  import VueMarkdown from 'vue-markdown';

  import 'prismjs/components/prism-c';
  import 'prismjs/components/prism-cpp';

  export default {
    components: {
      ResourceAnswerAttachmentsList,
      VueMarkdown,
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
      grade: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      gradeEditMode: false,
      gradePoints: null,
      gradeComment: '',
      pointsRules: [
        (v) => !!v || 'Liczba punktów jest wymagana',
        (v) => parseFloat(v) % 1 === 0 || 'Liczba punktów musi być liczbą całkowitą',
        (v) => parseInt(v, 10) >= 0 || 'Liczba punktów nie może być liczbą ujemną',
      ],
      saveLoading: false,
    }),
    computed: {
      gradeSaveEnabled () {
        if (!this.gradePoints || parseFloat(this.gradePoints) % 1 !== 0 || parseInt(this.gradePoints, 10) < 0) return false;
        if (
          this.grade !== null &&
          (this.gradeComment ? this.gradeComment.trim() : null) === this.grade.comment &&
          parseInt(this.gradePoints, 10) === this.grade.points
        ) return false;
        return true;
      },
    },
    watch: {
      'answer.id': {
        handler (value, oldValue) {
          if (!value || value === oldValue) return;

          this.gradeEditMode = false;
          this.gradePoints = null;
          this.gradeComment = '';
        },
        immediate: true,
      },
    },
    methods: {
      updateSyntax () {
        this.$nextTick(() => {
          Prism.highlightAll();
        });
      },
      startEditing () {
        this.gradePoints = this.grade.points;
        this.gradeComment = this.grade.comment;
        this.gradeEditMode = true;
      },
      cancelEditing () {
        this.gradeEditMode = false;
      },
      async submit () {
        if (!this.gradeSaveEnabled || this.saveLoading) return;

        this.saveLoading = true;

        try {
          const gradeReference = this.$database
            .collection('groups').doc(this.groupId)
            .collection('resources').doc(this.resourceId)
            .collection('grades')
            .doc(this.answer.id);

          if (this.grade) {
            await gradeReference.update({
              edited: true,
              userId: this.answer.userId,
              points: parseInt(this.gradePoints, 10),
              comment: this.gradeComment ? this.gradeComment.trim() : null,
            });
          } else {
            await gradeReference.set({
              edited: false,
              userId: this.answer.userId,
              points: parseInt(this.gradePoints, 10),
              comment: this.gradeComment ? this.gradeComment.trim() : null,
            });
          }

          this.gradeEditMode = false;
        } catch (error) {
          console.error(error);
          this.$toast.error('Podczas zapisywania wystąpił nieoczekiwany błąd');
        }
        this.saveLoading = false;
      },
    },
  };
</script>

<style lang="scss">
  .markdown-output {
    @import "../../styles/markdown";
  }
</style>
