import { getTenantConfigByConfigCode } from "@/api/config/tenantConfig";
import { useTenantConfigStore } from "@/store/modules/tenantConfig";

/**
 * 获取租户配置
 * @param {string} configCode - 配置代码
 * @returns {String} configVale - 配置值
 */
export async function getTenantConfig(configCode) {
  console.log("开始获取租户配置");
  const tenantConfigStore = useTenantConfigStore();

  try {
    const res = await tenantConfigStore.getTenantConfig(configCode);
    if (res != null) {
      return res;
    } else {
      return null;
    }
  } catch (error) {
    console.log("获取租户配置失败：", error);
    return null;
  }
}