<template>
  <v-navigation-drawer
    app
    :value="value"
    :permanent="$vuetify.breakpoint.mdAndUp"
    clipped
    width="320"
    @input="$emit('input', $event)"
  >
    <v-list>
      <v-list-item
        v-for="link in visibleLinks"
        :key="link.to"
        :to="link.to"
      >
        <v-list-item-icon>
          <v-icon v-text="link.icon" />
        </v-list-item-icon>

        <v-list-item-title v-text="link.title" />
      </v-list-item>
    </v-list>
    <template
      v-for="group in groups"
    >
      <v-divider :key="`divider:${group.id}`" />
      <v-subheader
        :key="`subheader:${group.id}`"
        v-text="group.name"
      />
      <v-list
        :key="`list:${group.id}`"
        subheader
        expand
      >
        <template v-if="group.teacher && $store.state.userData && $store.state.userData.teacherModeEnabled">
          <v-menu>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on">
                <v-list-item-icon>
                  <v-icon>mdi-plus</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>
                    Utwórz nowy
                  </v-list-item-title>
                </v-list-item-content>

                <v-list-item-icon>
                  <v-icon>mdi-dots-horizontal</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </template>
            <v-list>
              <v-list-item
                @click="createNewTopic(group.id)"
              >
                <v-list-item-icon>
                  <v-icon>mdi-clipboard-outline</v-icon>
                </v-list-item-icon>

                <v-list-item-title>
                  Temat
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                @click="createNewMaterial(group.id)"
              >
                <v-list-item-icon>
                  <v-icon>mdi-file-document-box</v-icon>
                </v-list-item-icon>
                <v-list-item-title>
                  Materiał
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-list-group prepend-icon="mdi-pencil">
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>Szkice</v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item
              v-for="sketch in group.sketches"
              :key="sketch.id"
              dense
              :to="`/grupy/${group.id}/szkice/${sketch.id}`"
            >
              <v-list-item-icon>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon
                      v-if="sketch.type === 'material'"
                      v-on="on"
                    >
                      <!-- Outdated icon name -->
                      mdi-file-document-box
                    </v-icon>
                    <v-icon
                      v-else
                      v-on="on"
                    >
                      mdi-file-question
                    </v-icon>
                  </template>
                  <span v-if="sketch.type === 'material'">Materiał</span>
                  <span v-else>Nieznany typ zasobu</span>
                </v-tooltip>
              </v-list-item-icon>

              <v-list-item-title v-text="sketch.name" />
            </v-list-item>
          </v-list-group>
        </template>
        <div
          v-if="group.topics.length === 0"
          class="px-4 py-6 text-center"
        >
          Brak tematów w grupie
        </div>
        <template v-else>
          <draggable
            v-if="group.teacher && $store.state.userData && $store.state.userData.teacherModeEnabled"
            v-model="group.topics"
            :disabled="!groupMoveEnabled(group.id)"
            :group="`topics:${group.id}`"
            :animation="200"
            handle=".v-list-group__header"
            @input="updateGroupTopic(group.id, $event)"
          >
            <v-list-group
              v-for="topic in group.topics"
              :key="topic.id"
            >
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title v-text="topic.name" />
                </v-list-item-content>
              </template>

              <v-list-item
                dense
                @click="showTopicSettings(group.id, topic.id)"
              >
                <v-list-item-icon>
                  <v-icon>mdi-settings</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>
                    Ustawienia tematu
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-divider
                v-if="topic.resources && topic.resources.length > 0"
                inset
              />

              <draggable
                v-model="topic.resources"
                :disabled="!resourceMoveEnabled(group.id)"
                :group="`resources:${group.id}`"
                :animation="200"
                @input="updateResource(group.id, topic.id, $event)"
              >
                <v-list-item
                  v-for="resource in topic.resources"
                  :key="resource.id"
                  :to="`/grupy/${group.id}/zasoby/${resource.id}`"
                  dense
                >
                  <v-list-item-icon>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          v-if="resource.type === 'material'"
                          v-on="on"
                        >
                          <!-- Outdated icon name -->
                          mdi-file-document-box
                        </v-icon>
                        <v-icon
                          v-else
                          v-on="on"
                        >
                          mdi-file-question
                        </v-icon>
                      </template>
                      <span v-if="resource.type === 'material'">Materiał</span>
                      <span v-else>Nieznany typ zasobu</span>
                    </v-tooltip>
                  </v-list-item-icon>

                  <v-list-item-content>
                    <v-list-item-title v-text="resource.name" />
                  </v-list-item-content>
                </v-list-item>
              </draggable>
            </v-list-group>
          </draggable>
          <template v-else>
            <v-list-group
              v-for="topic in group.topics"
              :key="topic.id"
            >
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title v-text="topic.name" />
                </v-list-item-content>
              </template>

              <v-list-item
                v-for="resource in topic.resources"
                :key="resource.id"
                :to="`/grupy/${group.id}/zasoby/${resource.id}`"
                dense
              >
                <v-list-item-icon>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        v-if="resource.type === 'material'"
                        v-on="on"
                      >
                        <!-- Outdated icon name -->
                        mdi-file-document-box
                      </v-icon>
                      <v-icon
                        v-else
                        v-on="on"
                      >
                        mdi-file-question
                      </v-icon>
                    </template>
                    <span v-if="resource.type === 'material'">Materiał</span>
                    <span v-else>Nieznany typ zasobu</span>
                  </v-tooltip>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title v-text="resource.name" />
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </template>
        </template>
      </v-list>
    </template>
    <material-creator-dialog ref="materialCreatorDialog" />
    <topic-creator-dialog ref="topicCreatorDialog" />
    <topic-settings-dialog ref="topicSettingsDialog" />
  </v-navigation-drawer>
</template>

<script>
  import MaterialCreatorDialog from '@/components/MaterialCreatorDialog.vue';
  import TopicCreatorDialog from '@/components/TopicCreatorDialog.vue';
  import TopicSettingsDialog from '@/components/TopicSettingsDialog.vue';
  import { indexOf, unionBy, defaults, difference } from 'lodash';
  import draggable from 'vuedraggable';

  export default {
    components: {
      MaterialCreatorDialog,
      TopicCreatorDialog,
      TopicSettingsDialog,
      draggable,
    },
    props: {
      value: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
      links: [
        {
          title: 'Strona główna',
          icon: 'mdi-home',
          to: '/',
        },
        {
          title: 'Dołącz do grupy',
          icon: 'mdi-account-multiple-plus',
          to: '/dolacz-do-grupy',
        },
        {
          title: 'Zarządzanie grupami',
          icon: 'mdi-account-multiple',
          to: '/zarzadzanie-grupami',
          teacherMode: true,
        },
      ],
      updatingGroups: [],
      updatingResources: [],
      sketches: {},
    }),
    computed: {
      visibleLinks () {
        let teacherModeEnabled = false;
        if (this.$store.state.userData && this.$store.state.userData.teacherModeEnabled) teacherModeEnabled = true;
        return this.links.filter((link) => {
          if (link.teacherMode) {
            return teacherModeEnabled;
          }
          return true;
        });
      },
      groups () {
        if (!this.$store.state.studiedGroups || !this.$store.state.teachedGroups) return null;
        const loadedTeachedGroups = this.$store.state.teachedGroups.filter(this.isGroupValid).map((group) => ({
          id: group.id,
          ...group,
        }));
        const loadedStudiedGroups = this.$store.state.studiedGroups.filter(this.isGroupValid).map((group) => ({
          id: group.id,
          ...group,
        }));
        return unionBy(loadedTeachedGroups, loadedStudiedGroups, 'id')
          .map((group) => ({
            ...group,
            teacher: !!loadedTeachedGroups.find((teacherGroup) => teacherGroup.id === group.id),
            student: !!loadedStudiedGroups.find((studiedGroup) => studiedGroup.id === group.id),
          }))
          .map((group) => defaults(group, {
            topics: [],
          }))
          .map((group) => ({
            ...group,
            topics: group.topics
              .map((topic) => ({
                ...topic,
                id: topic.id,
              }))
              .map((topic) => defaults(topic, {
                resources: [],
              }))
              .map((topic) => ({
                ...topic,
                resources: topic.resources.filter(this.isResourceValid),
              })),
          }))
          .map((group) => {
            if (this.sketches[group.id] && this.sketches[group.id].data) {
              return {
                ...group,
                sketches: this.sketches[group.id].data,
              };
            }
            return {
              ...group,
              sketches: [],
            };
          });
      },
    },
    watch: {
      '$store.state.teachedGroups': {
        handler (newValue) {
          let removedGroupIds;
          let addedGroupIds;
          if (newValue === null) {
            removedGroupIds = Object.keys(this.sketches);
            addedGroupIds = [];
          } else {
            removedGroupIds = difference(Object.keys(this.sketches), newValue.map((group) => group.id));
            addedGroupIds = difference(newValue.map((group) => group.id), Object.keys(this.sketches));
          }

          removedGroupIds.forEach((id) => {
            this.sketches[id].unsubscribe();
            this.$set(this.sketches, id, undefined);
          });

          addedGroupIds.forEach((id) => {
            const unsubscribe = this.$database.collection('groups').doc(id).collection('sketches').onSnapshot((snapshot) => {
              const sketches = [];
              snapshot.forEach((doc) => {
                sketches.push({
                  id: doc.id,
                  ...doc.data(),
                });
              });
              this.$set(this.sketches[id], 'data', sketches);
            });
            this.$set(this.sketches, id, {
              unsubscribe,
              data: [],
            });
          });
        },
        immediate: true,
      },
    },
    methods: {
      isGroupValid (group) {
        if (group.topics && group.topics.length > 0) {
          if (group.topics.findIndex((topic) => typeof topic === 'string') !== -1) {
            return false;
          }
        }

        return true;
      },
      isResourceValid (resource) {
        return typeof resource !== 'string';
      },
      groupMoveEnabled (groupId) {
        return !this.updatingGroups.includes(groupId);
      },
      resourceMoveEnabled (groupId) {
        return !this.updatingResources.includes(groupId);
      },
      async updateGroupTopic (groupId, newTopics) {
        this.updatingGroups.push(groupId);

        await this.$database.collection('groups').doc(groupId).update({
          topics: newTopics.map((topic) => this.$database.collection('groups').doc(groupId).collection('topics').doc(topic.id)),
        });

        this.updatingGroups.splice(indexOf(this.updatingGroups), 1);
      },
      async updateResource (groupId, topicId, newResources) {
        this.updatingResources.push(groupId);

        await this.$database
          .collection('groups').doc(groupId)
          .collection('topics').doc(topicId)
          .update({
            resources: newResources.map((resource) => this.$database
              .collection('groups').doc(groupId)
              .collection('resources').doc(resource.id)),
          });

        this.updatingResources.splice(indexOf(this.updatingResources), 1);
      },
      createNewTopic (groupId) {
        this.$refs.topicCreatorDialog.show(groupId);
      },
      createNewMaterial (groupId) {
        this.$refs.materialCreatorDialog.show(groupId);
      },
      showTopicSettings (groupId, topicId) {
        this.$refs.topicSettingsDialog.show(groupId, topicId);
      },
    },
  };
</script>
