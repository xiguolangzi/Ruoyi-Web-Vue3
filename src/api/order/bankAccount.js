import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询银行账户信息列表
export function listBankAccount(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/order/bankAccount/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询银行账户信息详细
export function getBankAccount(accountId) {
  return request({
    url: '/order/bankAccount/' + accountId,
    method: 'get'
  })
}

// 新增银行账户信息
export function addBankAccount(data) {
  return request({
    url: '/order/bankAccount',
    method: 'post',
    data: data
  })
}

// 修改银行账户信息
export function updateBankAccount(data) {
  return request({
    url: '/order/bankAccount',
    method: 'put',
    data: data
  })
}

// 删除银行账户信息
export function delBankAccount(accountId) {
  return request({
    url: '/order/bankAccount/' + accountId,
    method: 'delete'
  })
}
