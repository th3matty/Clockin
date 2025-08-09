<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navigation -->
    <Navigation />
    
    <!-- Main Content -->
    <main class="pt-16">
      <slot />
    </main>
    
    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import Navigation from './Navigation.vue'
import ToastContainer from './ToastContainer.vue'
</script>