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
    component: () => import(/* webpackChunkName: "resource" */ '../views/Resource.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
