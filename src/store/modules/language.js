// stores/language.js
import { defineStore } from 'pinia'
import { readonly } from 'vue'
import { ref } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  // 1 支持的语言列表（可根据需要扩展）
  const supportedLanguages = ['zh', 'en', 'es']

  // 2 初始化语言（从浏览器语言检测）
  function initLanguage() {
    // 1 获取浏览器默认语言
    const browserLang = navigator.language?.toLowerCase().split('-')[0]
    // 2 获取本地存储语言
    const storyData = localStorage.getItem('app-language')
    const localStoryLanguage = storyData ? JSON.parse(storyData).language : null;
    // 3 返回结果
    const res = localStoryLanguage || browserLang || 'zh'
    return res
  }

  // 3 当前语言
  const language = ref(initLanguage())

  // 4 设置语言
  function setLanguage(lang) {
    if (supportedLanguages.includes(lang)) {
      language.value = lang
      return true
    }
    return false
  }

  return {
    language: readonly(language),
    setLanguage
  }
}, {
  persist: {
    key: 'app-language', // 自定义存储键名
    storage: localStorage, // 明确使用 localStorage（默认值）
  }
})
