
/**
 * 是否含税枚举 0:含税 1:不含税
 */
export const InTaxEnum = {
  // 含税
  InTax: 0,
  // 不含税
  NoTax: 1
}

/**
 * 套餐状态 0：启用 1：停用
 */
export const ComboStatusEnum = {
  // 启用
  Enable: 0,
  // 停用
  Disable: 1
}

/**
 * 套餐项是否可选 0：固定项 1：可选项
 */
export const ComboItemIsOptionalEnum = {
  // 固定项
  NoOptional: 1,
  // 可选项
  Optional: 2
}

/**
 * 套餐项 设置类型：1-最多选项 2-最大数量
 */
export const ComboItemSetTypeEnum = {
  // 最多选项
  maxOption: 1,
  // 最大数量
  maxQuantity: 2
}