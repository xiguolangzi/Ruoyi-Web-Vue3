<template>
  <!-- element-plus 国际化组件处理 -->
  <el-config-provider :locale="elementLocales[lang]">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'
// 国际化处理
import { useLanguageStore } from '@/store/modules/language'
import { elementLocales } from '@/lang/element-plus-i18n'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
// 获取最新的local值
const languageStore = useLanguageStore()
let lang = computed(() => languageStore.language)
// 实施更新 i18n
const {locale} = useI18n()
locale.value = lang.value

/** pwa - 需要网页加载完成后，注册 service worker */
window.addEventListener('load', () => {
  // 1 能力检测浏览器是否支持 serviceWorker -> 注册 serviceWorker
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.register('/service-worker.js').then(registration => {
  //     console.log('Service Worker 注册成功', registration);
  //   }).catch(error => {
  //     console.log('Service Worker 注册失败', error);
  //   });
  // }
  // 2 pwa - 断网提示 
  // if (!navigator.onLine) {
  //   new Notification('网络已断开', {
  //     body: '请检查网络连接! 由于断网导致您使用的是本地缓存数据! '
  //   })
  // }
  // // 3 pwa - 连网提示 
  // window.addEventListener('online', () => {
  //   new Notification('网络已恢复', {
  //     body: '网络已恢复, 您的链接是实时数据!'
  //   })
  // })

},{passive:true})


onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>
