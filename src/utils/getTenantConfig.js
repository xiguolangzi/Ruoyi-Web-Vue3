import { getTenantConfigByConfigCode } from "@/api/config/tenantConfig";

/**
 * 获取租户配置
 * @param {string} configCode - 配置代码
 * @returns {Promise<Object|null>} - 返回配置对象或 null
 */
export async function getTenantConfig(configCode) {
  const queryParams = {
    configCode: configCode,
  };
  console.log("开始获取租户配置**************");

  try {
    const response = await getTenantConfigByConfigCode(queryParams);
    if (response && response.data) {
      return response.data; // 确保返回的数据结构正确
    } else {
      return null; // 如果配置不存在，返回 null
    }
  } catch (error) {
    console.error("获取租户配置失败:", error);
    return null; // 请求失败时返回 null
  }

}