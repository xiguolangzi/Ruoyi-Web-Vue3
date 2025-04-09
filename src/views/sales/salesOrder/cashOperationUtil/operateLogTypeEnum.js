/**
 * 操作记录类型：1-删除订单行；2-删除订单 3-修改单价；4-修改数量；5-修改折扣 6-修改机器码
 */
export const OperateLogTypeEnum = {
  // 删除订单行
  DELETE_ORDER_DETAIL: 1,
  // 删除订单
  DELETE_ORDER: 2,
  // 修改单价
  EDIT_PRICE: 3,
  // 修改数量
  EDIT_QUANTITY: 4,
  // 修改折扣
  EDIT_DISCOUNT_RATE: 5,
  // 修改机器码
  EDIT_SN: 6
}