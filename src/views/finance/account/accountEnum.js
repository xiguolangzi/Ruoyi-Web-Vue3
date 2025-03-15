export const IsLeafAccountEnum = {
  // 是末级科目
  YES: 0,
  // 不是末级科目
  NO: 1
}

export const AccountStatusEnum = {
  // 正常
  NORMAL: 0,
  // 禁用
  DISABLED: 1,
}

/**
 * 会计科目类型：
 * 1：资产， 2：负债， 3：权益， 4：收入， 5：支出
 */
export const AccountTypeEnum = {
  // 资产
  ASSET: 1,
  // 负债
  LIABILITY: 2,
  // 权益
  EQUITY: 3,
  // 收入
  INCOME: 4,
  // 支出
  EXPENSE: 5
}