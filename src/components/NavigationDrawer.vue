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
    <draggable
      v-model="orderedGroups"
      :animation="300"
      handle=".group-drag-handle"
      :disabled="updatingGroupOrder"
      @input="saveGroupsOrder"
    >
      <div
        v-for="group in orderedGroups"
        :key="`group:${group.id}`"
      >
        <v-divider />
        <v-subheader>
          {{ group.name }}
          <v-spacer />
          <v-icon class="group-drag-handle cursor-move">
            mdi-drag
          </v-icon>
        </v-subheader>
        <v-list
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
                  @click="createNewResource(group.id, 'material')"
                >
                  <v-list-item-icon>
                    <v-icon>mdi-file-document-box</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>
                    Materiał
                  </v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="createNewResource(group.id, 'exercise')"
                >
                  <v-list-item-icon>
                    <v-icon>mdi-book</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>
                    Ćwiczenie
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-list-group prepend-icon="mdi-pencil">
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>Wersje robocze</v-list-item-title>
                </v-list-item-content>
              </template>

              <v-list-item
                v-for="draft in group.drafts"
                :key="draft.id"
                dense
                :to="`/grupy/${group.id}/wersje-robocze/${draft.id}`"
              >
                <v-list-item-icon>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        v-if="draft.type === 'material'"
                        v-on="on"
                      >
                        <!-- Outdated icon name -->
                        mdi-file-document-box
                      </v-icon>
                      <v-icon
                        v-else-if="draft.type === 'exercise'"
                        v-on="on"
                      >
                        mdi-book
                      </v-icon>
                      <v-icon
                        v-else
                        v-on="on"
                      >
                        mdi-file-question
                      </v-icon>
                    </template>
                    <span v-if="draft.type === 'material'">Materiał</span>
                    <span v-else-if="draft.type === 'exercise'">Ćwiczenie</span>
                    <span v-else>Nieznany typ zasobu</span>
                  </v-tooltip>
                </v-list-item-icon>

                <v-list-item-title v-text="draft.name" />
              </v-list-item>
            </v-list-group>
          </template>
          <v-divider inset />
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
                            v-else-if="resource.type === 'exercise'"
                            v-on="on"
                          >
                            mdi-book
                          </v-icon>
                          <v-icon
                            v-else
                            v-on="on"
                          >
                            mdi-file-question
                          </v-icon>
                        </template>
                        <span v-if="resource.type === 'material'">Materiał</span>
                        <span v-else-if="resource.type === 'exercise'">Ćwiczenie</span>
                        <span v-else>Nieznany typ zasobu</span>
                      </v-tooltip>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-title v-text="resource.name" />
                      <v-list-item-subtitle
                        v-if="resource.type === 'material'"
                        v-text="resource.readingTimeString"
                      />
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
                          v-else-if="resource.type === 'exercise'"
                          v-on="on"
                        >
                          mdi-book
                        </v-icon>
                        <v-icon
                          v-else
                          v-on="on"
                        >
                          mdi-file-question
                        </v-icon>
                      </template>
                      <span v-if="resource.type === 'material'">Materiał</span>
                      <span v-else-if="resource.type === 'exercise'">Ćwiczenie</span>
                      <span v-else>Nieznany typ zasobu</span>
                    </v-tooltip>
                  </v-list-item-icon>

                  <v-list-item-content>
                    <v-list-item-title v-text="resource.name" />
                    <v-list-item-subtitle
                      v-if="resource.type === 'material'"
                      v-text="resource.readingTimeString"
                    />
                  </v-list-item-content>
                </v-list-item>
              </v-list-group>
            </template>
          </template>
        </v-list>
      </div>
    </draggable>
    <resource-creator-dialog ref="resourceCreatorDialog" />
    <topic-creator-dialog ref="topicCreatorDialog" />
    <topic-settings-dialog ref="topicSettingsDialog" />
  </v-navigation-drawer>
</template>

<script>
  import ResourceCreatorDialog from '@/components/ResourceCreatorDialog.vue';
  import TopicCreatorDialog from '@/components/TopicCreatorDialog.vue';
  import TopicSettingsDialog from '@/components/TopicSettingsDialog.vue';
  import * as _ from 'lodash';
  import draggable from 'vuedraggable';

  const pluralRules = new Intl.PluralRules('pl-PL');
  const pluralMinutesStrings = { many: 'minut', one: 'minuta', few: 'minuty' };

  export default {
    components: {
      ResourceCreatorDialog,
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
      drafts: {},
      orderedGroups: null,
      updatingGroupOrder: false,
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
        const groups = _.unionBy(loadedTeachedGroups, loadedStudiedGroups, 'id')
          .map((group) => ({
            ...group,
            teacher: !!loadedTeachedGroups.find((teacherGroup) => teacherGroup.id === group.id),
            student: !!loadedStudiedGroups.find((studiedGroup) => studiedGroup.id === group.id),
          }))
          .map((group) => _.defaults(group, {
            topics: [],
          }))
          .map((group) => ({
            ...group,
            topics: group.topics
              .map((topic) => ({
                ...topic,
                id: topic.id,
              }))
              .map((topic) => _.defaults(topic, {
                resources: [],
              }))
              .map((topic) => ({
                ...topic,
                resources: topic.resources.filter(this.isResourceValid).map((resource) => {
                  const wordsPerMinute = 150;
                  const wordsCount = resource.description ? resource.description.split(' ').length : 0;
                  let readingTimeString;
                  if (wordsCount === 0) {
                    readingTimeString = 'Brak opisu';
                  } else {
                    const readingTime = Math.ceil(wordsCount / wordsPerMinute);
                    readingTimeString = `Czas czytania: ${readingTime} ${pluralMinutesStrings[pluralRules.select(readingTime)]}`;
                  }
                  return {
                    id: resource.id,
                    ...resource,
                    readingTimeString,
                  };
                }),
              })),
          }))
          .map((group) => {
            if (this.drafts[group.id] && this.drafts[group.id].data) {
              return {
                ...group,
                drafts: this.drafts[group.id].data,
              };
            }
            return {
              ...group,
              drafts: [],
            };
          });

        return groups;
      },
      groupsAndGroupsOrder () {
        return [
          this.groups,
          this.$store.state.userData ? this.$store.state.userData.groupsOrder : null,
        ];
      },
    },
    watch: {
      '$store.state.teachedGroups': {
        handler (newValue) {
          let removedGroupIds;
          let addedGroupIds;
          if (newValue === null) {
            removedGroupIds = Object.keys(this.drafts);
            addedGroupIds = [];
          } else {
            removedGroupIds = _.difference(Object.keys(this.drafts), newValue.map((group) => group.id));
            addedGroupIds = _.difference(newValue.map((group) => group.id), Object.keys(this.drafts));
          }

          removedGroupIds.forEach((id) => {
            this.drafts[id].unsubscribe();
            this.$set(this.drafts, id, undefined);
          });

          addedGroupIds.forEach((id) => {
            const unsubscribe = this.$database.collection('groups').doc(id).collection('drafts').onSnapshot((snapshot) => {
              const drafts = [];
              snapshot.forEach((doc) => {
                drafts.push({
                  id: doc.id,
                  ...doc.data(),
                });
              });
              this.$set(this.drafts[id], 'data', drafts);
            });
            this.$set(this.drafts, id, {
              unsubscribe,
              data: [],
            });
          });
        },
        immediate: true,
      },
      groupsAndGroupsOrder: {
        handler ([groups, dataGroupsOrder]) {
          if (!groups) {
            this.orderedGroups = null;
          } else if (!dataGroupsOrder) {
            this.orderedGroups = groups;
          } else {
            this.orderedGroups = _.sortBy(groups, [
              (group) => _.findIndex(dataGroupsOrder, (e) => group.id === e),
            ]);
          }
        },
        immediate: true,
      },
    },
    destroyed () {
      Object.entries(this.drafts).forEach(([id, draft]) => {
        draft.unsubscribe();
        this.$set(this.drafts, id, undefined);
      });
    },
    methods: {
      async saveGroupsOrder (value) {
        this.updatingGroupOrder = true;

        const userDataReference = this.$database.collection('user-data').doc(this.$store.state.user.uid);

        await userDataReference.update({
          groupsOrder: value.map((group) => group.id),
        });

        this.updatingGroupOrder = false;
      },
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

        this.updatingGroups.splice(_.indexOf(this.updatingGroups), 1);
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

        this.updatingResources.splice(_.indexOf(this.updatingResources), 1);
      },
      createNewTopic (groupId) {
        this.$refs.topicCreatorDialog.show(groupId);
      },
      createNewResource (groupId, resourceType) {
        this.$refs.resourceCreatorDialog.show(groupId, resourceType);
      },
      showTopicSettings (groupId, topicId) {
        this.$refs.topicSettingsDialog.show(groupId, topicId);
      },
    },
  };
</script>

<style lang="scss">
  .cursor-move {
    cursor: move;
  }
</style>
