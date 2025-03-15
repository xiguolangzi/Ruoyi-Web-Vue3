/** 
 * 库位类型:
 * 1-拣货库位, 2-灵活库位, 3-固定库位
 */
export const LocationTypeEnum = {
  // 拣货库位
  PEAKING: 1,
  // 高架库位
  FREE: 2,
  // 存储库位
  BIND: 3,

}

/** 
 * 库位状态 :
 * 1-空闲, 2-占用, 3-锁定冻结, 4-禁用
 */
export const LocationStatusEnum = {
  // 空闲
  EMPTY: 1,
  // 占用
  OCCUPIED: 2,
  // 锁定冻结
  LOCKED: 3,
  // 禁用
  DISABLE: 4,
}

/** 
 * 是否末级节点:
 * 0-是, 1-否
 */
export const IsLeafEnum = {
  // 是
  YES: 0,
  // 否
  NO: 1,
}

/**
 * 将 xx 部分转换为数字
 * @param {string} xx - 由字母和数字组成的字符串，例如 'A1', '2B', 'ab', '01'
 * @returns {number} - 转换后的数字
 */
export function convertXXToNumber(xx) {
  // 判断是否为纯字母
  if (/^[A-Za-z]{2}$/.test(xx)) {
    // 将字母转换为 ASCII 码并组合
    const char1 = xx.charCodeAt(0);
    const char2 = xx.charCodeAt(1);
    return char1 * 100 + char2; // 例如 'ab' -> 97 * 100 + 98 = 9798
  }

  // 判断是否为纯数字
  if (/^\d{2}$/.test(xx)) {
    // 直接转换为数字
    return parseInt(xx, 10); // 例如 '01' -> 1, '25' -> 25
  }

  // 判断是否为字母数字混合（字母在前 + 数字在后，如 'A1'）
  if (/^[A-Za-z]\d$/.test(xx)) {
    // 字母部分转换为 ASCII 码，数字部分保留
    const letter = xx.charCodeAt(0);
    const number = parseInt(xx.slice(1), 10);
    return letter * 100 + number; // 例如 'A1' -> 65 * 100 + 1 = 6501
  }

  // 判断是否为字母数字混合（数字在前 + 字母在后，如 '1B'）
  if (/^\d[A-Za-z]$/.test(xx)) {
    // 数字部分保留，字母部分转换为 ASCII 码
    const number = parseInt(xx.charAt(0), 10);
    const letter = xx.charCodeAt(1);
    return number * 100 + letter; // 例如 '1B' -> 1 * 100 + 66 = 166
  }

  // 如果格式不符合预期，返回 0（或可以抛出错误）
  return 0;
}

/**
 * 将 xx-xx-xx-xx 字符串转换为排序的数字
 * @param {string} str - 由字母和数字组成的字符串，例如 'A1-2B-3C-4D'
 * @returns {number} - 转换后的数字
 */
export function convertStringToNumber(str) {
  // 拆分字符串
  const parts = str.split('-');

  // 遍历每一部分并转换为数字
  let result = 0;
  for (let i = 0; i < parts.length; i++) {
    const partValue = convertXXToNumber(parts[i]);
    result = result * 10000 + partValue; // 每部分占 4 位
  }

  return result;
}