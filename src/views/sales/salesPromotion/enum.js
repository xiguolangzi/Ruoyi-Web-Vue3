
/**
 * 1.1 活动状态
 */
export const StatusEnum = {
  NORMAL: 0,
  DISABLE: 1
}

/**
 * 1.2 是否对会员
 */
export const IsMemberOnlyEnum = {
  YES: 0,
  NO: 1
}

/**
 * 1.3 活动类型
 */
export const PromotionTypeEnum = {
  // 满折扣
  FULL_DISCOUNT: 1,
  // 满赠
  FULL_GIFT: 2,
  // 买x免y
  QUANTITY: 3,
  // 折扣
  DISCOUNT: 4,
}

/**
 * 1.4 活动范围
 */
export const ScopeTypeEnum = {
  ALL: 1,
  CATEGORY: 2,
  SKU: 3,
}

/**
 * 1.5 是否全场商品
 */
export const IsAllProductEnum = {
  YES: 0,
  NO: 1,
}

/**
 * 1.6 是否累计叠加
 */
export const IsAccumulativeEnum = {
  YES: 0,
  NO: 1,
}
