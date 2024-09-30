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

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>
