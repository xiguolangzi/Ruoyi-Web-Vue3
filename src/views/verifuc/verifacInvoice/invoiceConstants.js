/**
 * 发票状态枚举
 * 1:未发送 2:请求异常 3:响应异常 4:成功
 */
export const InvoiceStatusEnum = {
  UNSENT: 1,
  REQUEST_EXCEPTION: 2,
  RESPONSE_EXCEPTION: 3,
  SUCCESS: 4,
}

/**
 * 发票类型:
 * F1-完整发票 F2-简化发票 F3-完整发票替换简易发票 
 * R1- 更正错误发票 R2- 更正破产清算发票 R3- 更正坏账发票 R4- 其他原因的更正 R5- 更正简易发票
 */
export const InvoiceTypeEnum = {
  COMPLETA: 'F1',
  SIMPLIFICADA: 'F2',
  COMPLETA_SUSTITUTIVA_SIMPLIFICADA: 'F3',
  RECTIFICATIVA_ERROR: 'R1',
  RECTIFICATIVA_CONCURSO: 'R2',
  RECTIFICATIVA_INCOBRABLE: 'R3',
  RECTIFICATIVA_OTRAS: 'R4',
  RECTIFICATIVA_SIMPLIFICADA: 'R5',
}