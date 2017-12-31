import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import Results from '@/components/Results'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main
    },
    {
      path: '/results',
      name: 'results',
      component: Results
    }
  ]
})
