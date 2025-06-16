import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'

/**
 * 收银台状态管理
 */
export const useCajaStore = defineStore('caja', () => {
  // caja信息
  const caja = ref({})

  function setCaja(data) {
    caja.value = { ...data }
  }

  function clearCaja() {
    caja.value = {}
    clearShift()
  }

  function getCaja() {
    return { ...caja.value }
  }

  // 交班信息
  const shift = ref({})

  function setShift(data) {
    shift.value = { ...data }
  }

  function clearShift() {
    shift.value = {}
  }

  function getShift() {
    return { ...shift.value }
  }

  return {
    caja,
    setCaja,
    clearCaja,
    getCaja,
    shift,
    setShift,
    clearShift,
    getShift,
  }

}, {
  persist: {
    key: 'app-caja', // 自定义存储键名
    storage: localStorage, // 明确使用 localStorage（默认值）
  }
})