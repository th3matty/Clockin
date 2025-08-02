<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <Navigation />
    
    <!-- Main Content -->
    <main class="pt-16">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navigation from './Navigation.vue'
</script>