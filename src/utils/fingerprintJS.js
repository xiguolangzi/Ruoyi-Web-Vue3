import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { dbConfig } from '@/indexedDB/dbConfig';
import IndexedDBUtil from '@/indexedDB/index.js';

const DB_NAME = "configDB";
const STORE_NAME = "fingerprint";
const idStr = "device_fingerprint"

// 1 先判断 DB_NAME 和 STORE_NAME 是否存加入配置
const dbObject = dbConfig.find((db) => db.dbName === DB_NAME);
if (!dbObject) {
  throw new Error(`未找到数据库 '${DB_NAME}' 的配置`);
} else {
  if (!dbObject.storeNameList.find((store) => store.storeName === STORE_NAME)) {
    throw new Error(`未找到数据库 '${DB_NAME}' 中的存储 '${STORE_NAME}' 的配置`);
  }
}



/** 2 存储设备指纹 */
const saveFingerprintToDB = async (fingerprint) => {
  try {
    await IndexedDBUtil.saveData(DB_NAME, STORE_NAME, { id: idStr, value: fingerprint })
    console.log("设备指纹存储成功:", fingerprint);
    return true;
  } catch (error) {
    console.error("存储设备指纹失败:", error);
    return false;
  }
};

/** 3 读取设备指纹 */
const getFingerprintFromDB = async () => {
  try {
    return await IndexedDBUtil.getData(DB_NAME, STORE_NAME, idStr);
  } catch (error) {
    console.warn("读取设备指纹失败:", error);
    return null;
  }
};

/** 4 删除设备指纹 */
const deleteFingerprintFromDB = async () => {
  try {
    await IndexedDBUtil.removeData(DB_NAME, STORE_NAME, idStr);
    console.log("设备指纹删除成功");
    return true;
  } catch (error) {
    console.error("删除设备指纹失败:", error);
    return false;
  }
};

/** 5 生成设备指纹 */
const generateFingerprint = async () => {
  // 先检查 IndexedDB 里是否已有指纹
  const existingFingerprint = await getFingerprintFromDB();
  if (existingFingerprint) {
    console.log("🔄 从 IndexedDB 获取设备指纹:", existingFingerprint);
    return existingFingerprint.value; // 确保返回的是 `visitorId`
  }
  // 生成新指纹
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  console.log("🆕 新生成设备指纹:", result.visitorId);
  // 存入 IndexedDB
  await saveFingerprintToDB(result.visitorId);
  return result.visitorId;
};

/** 6 获取设备指纹（可强制刷新） */
export const getDeviceFingerprint = async (forceRefresh = false) => {
  if (forceRefresh) {
    await deleteFingerprintFromDB();
  }
  return await generateFingerprint();
};
