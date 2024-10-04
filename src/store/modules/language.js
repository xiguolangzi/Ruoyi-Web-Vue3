// stores/language.js
import {defineStore} from 'pinia'
import Cookies from 'js-cookie'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    language: Cookies.get('language') ||  navigator.language.toLowerCase().split('-')[0] || 'zh' // cookie || 浏览器默认语言 || 默认中文
    
  }),
  actions: {
    setLanguage(lang) {
      this.language = lang
      Cookies.set('language', lang) // 设置 cookie
    },
  }
  
})
