import { createI18n } from "vue-i18n"
// import { useLanguageStore } from "@/stores/modules/useLanguageStore.js"
// 导入语言包
import zh from "./language/zh.js"
import en from "./language/en.js"
import es from "./language/es.js"

const messages = {
  zh: zh,
  en: en,
  es: es,
}

// 创建 i18n 实例
const i18n = createI18n({
  locale: 'zh',     // 默认语言，再 App.vue中初始化
  fallbackLocale: 'zh', // 备用语言
  messages: messages,
})

export default i18n