import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

// Extend the RouteMeta interface to include our custom properties
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresGuest?: boolean
    requiresRole?: UserRole
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignupView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/employee',
    name: 'employee',
    component: () => import('@/views/EmployeeView.vue'),
    meta: { requiresAuth: true, requiresRole: 'employee' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Initialize auth if not already done
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole

  // Handle routes that require guest access (login, signup)
  if (to.meta.requiresGuest && isAuthenticated) {
    const redirectPath = userRole === 'admin' ? '/admin' : '/employee'
    return next(redirectPath)
  }

  // Handle routes that require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  // Handle routes that require specific roles
  if (to.meta.requiresRole && userRole !== to.meta.requiresRole) {
    if (!isAuthenticated) {
      return next('/login')
    }

    // Redirect to appropriate dashboard
    const redirectPath = userRole === 'admin' ? '/admin' : '/employee'
    return next(redirectPath)
  }

  next()
})

export default router