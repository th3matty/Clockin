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
    path: '/employee/calendar',
    name: 'employee-calendar',
    component: () => import('@/views/EmployeeCalendarView.vue'),
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth if not already done
  if (!authStore.initialized) {
    try {
      await authStore.initialize()
    } catch (error) {
      console.error('Router guard initialization failed:', error)
      // Continue anyway to prevent blocking navigation
    }
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole

  // Handle routes that require guest access (login, signup)
  if (to.meta.requiresGuest && isAuthenticated) {
    // Only redirect if not coming from a login attempt
    if (from.name !== 'login') {
      const redirectPath = userRole === 'admin' ? '/admin' : '/employee'
      return next(redirectPath)
    }
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

    // Only redirect if not already on the correct path
    const redirectPath = userRole === 'admin' ? '/admin' : '/employee'
    if (to.path !== redirectPath) {
      return next(redirectPath)
    }
  }

  next()
})

export default router