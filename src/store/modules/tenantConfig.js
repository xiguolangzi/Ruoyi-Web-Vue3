import { defineStore } from 'pinia';
import { getTenantConfigByConfigCode } from "@/api/config/tenantConfig";
import { readonly, ref } from 'vue';

export const useTenantConfigStore = defineStore('tenantConfig', () => {
  // 1 初始化为空数组
  const tenantConfig = ref([]);

  /** 2 设置配置（自动去重） */
  function setTenantConfig(_Code, Value) {
    console.log('设置租户配置', _Code, Value)
    if (!_Code || !Value) return false;

    const index = tenantConfig.value.findIndex(item => item.configCode === _Code);
    if (index >= 0) {
      // 更新现有配置
      tenantConfig.value[index].configVale = Value;
    } else {
      // 新增配置
      tenantConfig.value.push({ configCode: _Code, configVale: Value });
    }
    console.log('当前租户配置', tenantConfig.value)
    return true;
  }

  /** 3 获取配置（异步，返回 Promise） */
  async function getTenantConfig(_Code) {
    if (!_Code) return null;

    // 优先从本地查找
    const localConfig = tenantConfig.value.find(item => item.configCode === _Code);
    if (localConfig) return Promise.resolve(localConfig.configVale);

    // 本地不存在则从 API 获取
    try {
      const queryParams = { configCode: _Code };
      const res = await getTenantConfigByConfigCode(queryParams);
      if (res.code === 200 && res.data) {
        setTenantConfig(res.data.configCode, res.data.configValue);
        return res.data.configValue;
      }
      return null;
    } catch (error) {
      console.error('API 获取租户配置失败', error);
      return null;
    }
  }

  // 初始化配置代码列表
  const initConfigCodeList = [
    "editPrice",
    "editDiscountRate",
    "paymentAutoPrint",
    "canRemainAmount",
    "canDeleteOrderDetail",
    "cajaShowKeyboard",
    "orderInTax",
    "openLocation"
  ];
  /** 4 初始化配置 */
  async function initTenantConfig() {
    for (const code of initConfigCodeList) {
      await getTenantConfig(code);
    }
  }

  /** 5 清除配置 */
  function clearTenantConfig() {
    tenantConfig.value = [];
  }

  return {
    tenantConfig: readonly(tenantConfig),
    setTenantConfig,
    getTenantConfig,
    initTenantConfig,
    clearTenantConfig
  };
});