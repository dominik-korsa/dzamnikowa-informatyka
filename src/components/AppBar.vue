<template>
  <v-app-bar
    app
    color="primary"
    dark
    clipped-left
  >
    <v-app-bar-nav-icon
      v-if="$vuetify.breakpoint.smAndDown"
      @click="$emit('click:nav-icon')"
    />

    <v-toolbar-title>Dżamnikowa Informatyka</v-toolbar-title>

    <v-spacer />

    <v-menu
      v-model="notificationsMenuOpen"
      offset-y
      max-height="512"
    >
      <template v-slot:activator="{ on: menu }">
        <v-tooltip
          bottom
        >
          <template v-slot:activator="{ on: tooltip }">
            <v-btn
              icon
              v-on="{ ...tooltip, ...menu }"
            >
              <v-badge
                color="secondary"
                :content="unreadNotificationsCount"
                overlap
                :value="unreadNotificationsCount > 0"
              >
                <v-icon>
                  mdi-bell
                </v-icon>
              </v-badge>
            </v-btn>
          </template>
          <span>Powiadomienia</span>
        </v-tooltip>
      </template>
      <v-card>
        <v-card-title>
          Powiadomienia
        </v-card-title>
        <div
          v-if="!notificationsList"
          class="d-flex justify-center pa-8"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            :size="64"
          />
        </div>
        <div
          v-for="date in notificationsList"
          v-else
          :key="date.key"
        >
          <v-subheader v-text="date.dateString" />
          <v-list
            subheader
            three-line
          >
            <v-list-item
              v-for="notification in date.notifications"
              :key="notification.id"
              :to="notification.to"
            >
              <v-list-item-icon>
                <v-badge
                  color="secondary"
                  dot
                  :value="!notification.read"
                >
                  <v-icon v-if="notification.type === 'new-grade' || notification.type === 'edit-grade'">
                    mdi-counter
                  </v-icon>
                  <v-icon v-if="notification.type === 'new-answer'">
                    mdi-check
                  </v-icon>
                  <v-icon v-if="notification.type === 'new-resource' && notification.resourceType === 'material'">
                    mdi-file-document-box
                  </v-icon>
                  <v-icon v-if="notification.type === 'new-resource' && notification.resourceType === 'exercise'">
                    mdi-book
                  </v-icon>
                </v-badge>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-subtitle
                  class="overline"
                  v-text="notification.groupName"
                />

                <v-list-item-title v-if="notification.type === 'new-grade'">
                  Oceniono <b v-text="notification.resourceName" />
                </v-list-item-title>
                <v-list-item-title v-if="notification.type === 'edit-grade'">
                  Zmieniono ocenę <b v-text="notification.resourceName" />
                </v-list-item-title>
                <v-list-item-title v-if="notification.type === 'new-answer'">
                  Nowe rozwiązanie do sprawdzenia
                </v-list-item-title>
                <v-list-item-title v-if="notification.type === 'new-resource' && notification.resourceType === 'material'">
                  Dodano nowy materiał
                </v-list-item-title>
                <v-list-item-title v-if="notification.type === 'new-resource' && notification.resourceType === 'exercise'">
                  Dodano nowe zadanie
                </v-list-item-title>

                <v-list-item-subtitle v-if="notification.type === 'new-grade' || notification.type === 'edit-grade'">
                  Liczba punktów za rozwiązanie: <b v-text="notification.points" />
                </v-list-item-subtitle>
                <v-list-item-subtitle v-if="notification.type === 'new-answer'">
                  <b v-text="notification.userName || 'Nieznany użytkownik'" /> w <b v-text="notification.resourceName" />
                </v-list-item-subtitle>
                <v-list-item-subtitle
                  v-if="notification.type === 'new-resource'"
                  v-text="notification.resourceName"
                />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </v-card>
    </v-menu>

    <v-menu
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ on: menu }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on: tooltip }">
            <v-btn
              icon
              class="ml-4"
              v-on="{ ...tooltip, ...menu }"
            >
              <v-avatar
                class="elevation-4"
                :size="$vuetify.breakpoint.smAndDown ? 40 : 48"
              >
                <v-img :src="$store.state.user.photoURL" />
              </v-avatar>
            </v-btn>
          </template>
          <span>
            {{
              ($store.state.userData && $store.state.userData.displayName)
                ? $store.state.userData.displayName
                : $store.state.user.displayName
            }}
          </span>
        </v-tooltip>
      </template>
      <v-list>
        <v-list-item
          @click="changeDisplayNameDialogVisible = true"
        >
          <v-list-item-icon>
            <v-icon>mdi-account-edit</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Zmień wyświetlaną nazwę</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="teacherModeEnabled"
          @click="disableTeacherMode"
        >
          <v-list-item-icon>
            <v-icon>
              mdi-teach
            </v-icon>
          </v-list-item-icon>
          <v-list-item-title>
            Wyłącz tryb nauczyciela
          </v-list-item-title>`
        </v-list-item>
        <v-list-item
          v-if="!addedProviders.includes('google.com')"
          :disabled="googleLoading"
          @click="linkGoogle"
        >
          <v-list-item-icon>
            <v-progress-circular
              v-if="googleLoading"
              indeterminate
              :size="24"
            />
            <v-icon v-else>
              mdi-google
            </v-icon>
          </v-list-item-icon>

          <v-list-item-title>
            Połącz konto Google
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="!addedProviders.includes('facebook.com')"
          :disabled="facebookLoading"
          @click="linkFacebook"
        >
          <v-list-item-icon>
            <v-progress-circular
              v-if="facebookLoading"
              indeterminate
              :size="24"
            />
            <v-icon v-else>
              mdi-facebook
            </v-icon>
          </v-list-item-icon>

          <v-list-item-title>
            Połącz konto Facebook
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="addedProviders.includes('facebook.com')"
          :disabled="addedProviders.length === 1"
          @click="facebookUnlinkDialogVisible = true"
        >
          <v-list-item-icon>
            <v-icon>
              mdi-facebook
            </v-icon>
          </v-list-item-icon>

          <v-list-item-title>
            Odłącz konto Facebook
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="signOut">
          <v-list-item-icon>
            <v-icon>mdi-logout-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Wyloguj się</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-long-press="1000"
          :href="privacyPolicyConfig.link"
          target="_blank"
          @click="privacyPolicyClick"
          @long-press-start="enableTeacherModeStart"
          @long-press-stop="enableTeacherModeStop"
        >
          <v-list-item-icon>
            <v-icon>mdi-lock</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Polityka Prywatności</v-list-item-title>
            <v-list-item-subtitle v-text="privacyPolicyConfig.dateFull" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <change-display-name-dialog v-model="changeDisplayNameDialogVisible" />
    <facebook-unlink-dialog v-model="facebookUnlinkDialogVisible" />
  </v-app-bar>
</template>

<script>
  import ChangeDisplayNameDialog from '@/components/ChangeDisplayNameDialog.vue';
  import FacebookUnlinkDialog from '@/components/FacebookUnlinkDialog.vue';
  import privacyPolicyConfig from '@/privacy-policy-config';
  import * as _ from 'lodash';
  import moment from 'moment';
  import LongPress from 'vue-directive-long-press';

  moment.locale('pl');

  export default {
    components: {
      ChangeDisplayNameDialog,
      FacebookUnlinkDialog,
    },
    directives: {
      LongPress,
    },
    data: () => ({
      changeDisplayNameDialogVisible: false,
      facebookUnlinkDialogVisible: false,
      googleLoading: false,
      facebookLoading: false,
      privacyPolicyConfig,
      teacherModeLongPress: false,
      notificationsMenuOpen: false,
    }),
    computed: {
      addedProviders () {
        if (!this.$store.state.user) return [];
        return this.$store.state.user.providerData.map((provider) => provider.providerId);
      },
      teacherModeEnabled: {
        get () {
          if (this.$store.state.userData && this.$store.state.userData.teacherModeEnabled) {
            return this.$store.state.userData.teacherModeEnabled;
          }
          return false;
        },
        async set (value) {
          if (!this.$store.state.user) return;
          const userDataDocReference = this.$database.collection('user-data').doc(this.$store.state.user.uid);
          await userDataDocReference.update({
            teacherModeEnabled: value,
          });
        },
      },
      groups: {
        get () {
          if (!this.$store.state.teachedGroups || !this.$store.state.studiedGroups) return null;
          return _.unionBy(this.$store.state.teachedGroups, this.$store.state.studiedGroups, 'id');
        },
      },
      resources () {
        return _.flatMap(
          _.flatMap(this.groups, (group) => (group.topics || [])).filter((topic) => typeof topic !== 'string'),
          (topic) => topic.resources || [],
        );
      },
      unreadNotificationsCount () {
        if (!this.$store.state.notifications) return 0;
        return this.$store.state.notifications.filter((notification) => !notification.read).length;
      },
      notificationsList () {
        if (!this.$store.state.notifications || !this.groups) return null;

        const notificationsList = this.$store.state.notifications.map((notification) => {
          const groupA = this.groups.find((e) => e.id === notification.groupId);
          if (!groupA) return null;

          if (notification.type === 'new-grade' || notification.type === 'edit-grade') {
            const group = this.groups.find((e) => e.id === notification.groupId);
            if (!group) return null;
            const resource = _.flatMap((group.topics || []), (topic) => (typeof topic !== 'string' ? (topic.resources || []) : []))
              .find((e) => e.id === notification.resourceId);
            if (!resource) return null;
            return {
              id: notification.id,
              groupName: group.name,
              resourceName: resource.name,
              points: notification.points,
              date: notification.date,
              type: notification.type,
              read: notification.read,
              to: `/grupy/${notification.groupId}/zasoby/${notification.resourceId}/twoje-rozwiazania/${notification.answerId}`,
            };
          } if (notification.type === 'new-answer') {
            const group = this.groups.find((e) => e.id === notification.groupId);
            if (!group) return null;
            const resource = _.flatMap((group.topics || []), (topic) => (typeof topic !== 'string' ? (topic.resources || []) : []))
              .find((e) => e.id === notification.resourceId);
            if (!resource) return null;
            let user = null;
            if (this.$store.state.userDataCollection) {
              user = this.$store.state.userDataCollection.find((e) => e.id === notification.answerUserId) || null;
            }
            return {
              id: notification.id,
              groupName: group.name,
              resourceName: resource.name,
              userName: user ? user.displayName : null,
              date: notification.date,
              type: 'new-answer',
              read: notification.read,
              to: `/grupy/${notification.groupId}/zasoby/${notification.resourceId}/ocenianie/${notification.answerId}`,
            };
          } if (notification.type === 'new-resource') {
            const group = this.groups.find((e) => e.id === notification.groupId);
            if (!group) return null;
            const resource = _.flatMap((group.topics || []), (topic) => (typeof topic !== 'string' ? (topic.resources || []) : []))
              .find((e) => e.id === notification.resourceId);
            if (!resource) return null;
            return {
              id: notification.id,
              groupName: group.name,
              resourceName: resource.name,
              resourceType: resource.type,
              date: notification.date,
              type: 'new-resource',
              read: notification.read,
              to: `/grupy/${notification.groupId}/zasoby/${notification.resourceId}/`,
            };
          }
          console.error(`Unknown notification type: ${notification.type}`);
          return null;
        }).filter((item) => item !== null);
        return _.toPairs(_.groupBy(
          _.orderBy(notificationsList, [(item) => item.date.toMillis()], ['desc']),
          (item) => moment(item.date.toDate()).format('YYYY-MM-DD'),
        )).map(([date, notifications]) => ({
          key: date,
          dateString: moment(date).calendar(null, {
            sameDay: '[Dzisiaj]',
            lastDay: '[Wczoraj]',
            lastWeek: '[Ostatni] dddd',
            sameElse: 'dddd, LL',
          }),
          notifications,
        }));
      },
    },
    watch: {
      async notificationsMenuOpen (value, oldValue) {
        if (value === false && oldValue === true) {
          const notificationsReference = this.$database.collection('notifications')
            .where('userId', '==', this.$store.state.user.uid);
          const notificationsDocs = (await notificationsReference.get()).docs;
          const batch = this.$database.batch();

          notificationsDocs.forEach((doc) => {
            batch.update(doc.ref, {
              read: true,
            });
          });

          await batch.commit();
        }
      },
    },
    methods: {
      async linkGoogle () {
        this.googleLoading = true;

        try {
          await this.$auth.linkGoogle();
        } catch (error) {
          this.$toast.error('Nie udało się połączyć konta');
          console.error(error);
        }

        this.googleLoading = false;
      },
      async linkFacebook () {
        this.facebookLoading = true;

        try {
          await this.$auth.linkFacebook();
        } catch (error) {
          this.$toast.error('Nie udało się połączyć konta');
          console.error(error);
        }

        this.facebookLoading = false;
      },
      signOut () {
        this.$auth.signOut();
      },
      enableTeacherModeStart () {
        this.teacherModeLongPress = true;
        if (!this.teacherModeEnabled) {
          this.$toast('Włączono tryb nauczyciela');
        } else {
          this.$toast('Tryb nauczyciela jest już włączony');
        }
      },
      privacyPolicyClick (event) {
        if (this.teacherModeLongPress) {
          event.preventDefault();
        }
      },
      enableTeacherModeStop () {
        if (!this.teacherModeEnabled) {
          this.teacherModeEnabled = true;
        }

        setTimeout(() => {
          this.teacherModeLongPress = false;
        }, 100);
      },
      disableTeacherMode () {
        if (this.teacherModeEnabled) {
          this.teacherModeEnabled = false;
          this.$toast('Wyłączono tryb nauczyciela');
        }
      },
    },
  };
</script>
