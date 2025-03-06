import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询客户分类列表
export function listCustomerCategory(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/order/customerCategory/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询客户分类详细
export function getCustomerCategory(categoryId) {
  return request({
    url: '/order/customerCategory/' + categoryId,
    method: 'get'
  })
}

// 新增客户分类
export function addCustomerCategory(data) {
  return request({
    url: '/order/customerCategory',
    method: 'post',
    data: data
  })
}

// 修改客户分类
export function updateCustomerCategory(data) {
  return request({
    url: '/order/customerCategory',
    method: 'put',
    data: data
  })
}

// 删除客户分类
export function delCustomerCategory(categoryId) {
  return request({
    url: '/order/customerCategory/' + categoryId,
    method: 'delete'
  })
}

// 修改状态
export function changeStatus(data) {
  return request({
    url: '/order/customerCategory/changeStatus',
    method: 'put',
    data: data
  })
}

// 查询分类下拉树结构
export function categoryTreeSelect() {
  return request({
    url: '/order/customerCategory/categoryTree',
    method: 'get'
  })
}