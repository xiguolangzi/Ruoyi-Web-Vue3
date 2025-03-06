import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询供应商分类列表
export function listSupplierCategory(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/order/supplierCategory/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询供应商分类详细
export function getSupplierCategory(categoryId) {
  return request({
    url: '/order/supplierCategory/' + categoryId,
    method: 'get'
  })
}

// 新增供应商分类
export function addSupplierCategory(data) {
  return request({
    url: '/order/supplierCategory',
    method: 'post',
    data: data
  })
}

// 修改供应商分类
export function updateSupplierCategory(data) {
  return request({
    url: '/order/supplierCategory',
    method: 'put',
    data: data
  })
}

// 删除供应商分类
export function delSupplierCategory(categoryId) {
  return request({
    url: '/order/supplierCategory/' + categoryId,
    method: 'delete'
  })
}

// 修改状态
export function changeStatus(data) {
  return request({
    url: '/order/supplierCategory/changeStatus',
    method: 'put',
    data: data
  })
}

// 查询分类下拉树结构
export function categoryTreeSelect() {
  return request({
    url: '/order/supplierCategory/categoryTree',
    method: 'get'
  })
}
