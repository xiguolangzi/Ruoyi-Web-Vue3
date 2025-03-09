
// 订单数据
export const initOrderData = () => ({
  orderId: null,
  orderInitNo: null,
  orderNo: null,
  parentOrderId: null,
  orderSource: null,
  orderInTax: 0,
  warehouseId: null,
  cajaId: null,
  shiftId: null,
  salesmanId: null,
  customerId: null,
  activityId: null,
  orderType: 0,
  orderStatus: null,
  orderIsHold: null,
  orderPayStatus: null,
  totalAmount: null,
  totalDiscountAmount: null,
  totalPromotionReduceAmount: null,
  totalSalesAmount: null,
  totalBaseAmount: null,
  totalTaxAmount: null,
  totalNetAmount: null,
  remainAmount: null,
  verifiedAmount: null,
  totalGiftQuantity: null,
  totalZeroAmount: null,
  remark: null,
  createBy: null,
  createTime: null,
  updateBy: null,
  updateTime: null,
  tenantId: null,
  delFlag: null,
  operateLog: null,
  salesOrderDetailList: []
});

export const initOrderDetailData = () => ({
  detailId: null,
  detailType: null,
  detailMainSkuId: null,
  skuId: null,
  skuCode: null,
  skuName: null,
  assistName: null,
  skuType: null,
  skuValue: null,
  batchId: null,
  detailSn: null,
  detailPrice: 0,
  detailQuantity: 1,
  detailAmount: 0,
  detailDiscountRate: 1,
  detailDiscountAmount: 0,
  detailSalesAmount: 0,
  detailBaseAmount: 0,
  detailTaxRate: 0,
  detailTaxAmount: 0,
  detailNetAmount: 0,
  promotionId: null,
  promotionName: null,
  remark: null,
})

export const StatusEnum = {
  // 正常
  ENABLE: 0,
  // 禁用
  DISABLE: 1
}
