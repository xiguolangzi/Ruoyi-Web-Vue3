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

// -----------------  网络监听通知 start ----------------------------
// 请求通知权限（建议在用户交互时触发，如按钮点击）
function requestNotificationPermission() {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('通知权限已授予');
    }
  });
}

// 在应用初始化时调用（如页面加载后）
window.addEventListener('load', () => {
  // 初始网络状态检测
  if (!navigator.onLine) {
    showOfflineNotification();
  }

  // 单次监听网络恢复（避免重复绑定）
  window.addEventListener('online', handleNetworkRecovery, { once: true });
});

// 断网通知
function showOfflineNotification() {
  if (Notification.permission === 'granted') {
    new Notification('网络已断开', {
      body: '请检查网络连接！当前使用缓存数据。'
    });
  } else {
    console.warn('无法显示通知：未获得权限');
    // 可以改用页面内UI提示（如Toast）
  }
}

// 网络恢复处理
function handleNetworkRecovery() {
  if (Notification.permission === 'granted') {
    new Notification('网络已恢复', {
      body: '已重新连接服务器，数据将实时更新。'
    });
  }
  // 重新绑定监听器（确保下次断网能再次检测）
  window.addEventListener('offline', () => {
    showOfflineNotification();
    window.addEventListener('online', handleNetworkRecovery, { once: true });
  });
}

// -----------------  网络监听通知 end ----------------------------


onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>
