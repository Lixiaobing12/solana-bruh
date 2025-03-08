<template>
  <n-message-provider placement="top" :duration="1500">
    <Layout>
      <transition>
        <keep-alive>
          <router-view />
        </keep-alive>
      </transition>
    </Layout>
  </n-message-provider>
</template>
<script setup>
import Layout from '@/layout/index.vue';
</script>