import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/zarzadzanie-grupami',
    component: () => import(/* webpackChunkName: "group-manager" */ '../views/GroupManager.vue'),
  },
  {
    path: '/zarzadzanie-grupami/:groupId',
    component: () => import(/* webpackChunkName: "group-manager" */ '../views/GroupManager.vue'),
  },
  {
    path: '/dolacz-do-grupy',
    component: () => import(/* webpackChunkName: "group-join" */ '../views/GroupJoin.vue'),
  },
  {
    path: '/grupy/:groupId/wersje-robocze/:draftId',
    component: () => import(/* webpackChunkName: "draft-editor" */ '../views/DraftEditor.vue'),
  },
  {
    path: '/grupy/:groupId/zasoby/:resourceId',
    component: () => import(/* webpackChunkName: "resource" */ '../views/resource/Resource.vue'),
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "resource-viewer" */ '../views/resource/ResourceViewer.vue'),
      },
      {
        path: 'edytor',
        component: () => import(/* webpackChunkName: "resource-editor" */ '../views/resource/ResourceEditor.vue'),
      },
      {
        path: 'twoje-rozwiazania',
        component: () => import(/* webpackChunkName: "resource-your-answers" */ '../views/resource/ResourceYourAnswers.vue'),
        children: [
          {
            path: ':answerId',
          },
        ],
      },
      {
        path: '*',
        redirect: (to) => `/grupy/${to.params.groupId}/zasoby/${to.params.resourceId}`,
      },
    ],
  },
  {
    path: '*',
    component: () => import(/* webpackChunkName: "page-not-found" */ '../views/PageNotFound.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
