import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询供应商列表
export function listSupplier(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/order/supplier/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询供应商详细
export function getSupplier(supplierId) {
  return request({
    url: '/order/supplier/' + supplierId,
    method: 'get'
  })
}

// 新增供应商
export function addSupplier(data) {
  return request({
    url: '/order/supplier',
    method: 'post',
    data: data
  })
}

// 修改供应商
export function updateSupplier(data) {
  return request({
    url: '/order/supplier',
    method: 'put',
    data: data
  })
}

// 删除供应商
export function delSupplier(supplierId) {
  return request({
    url: '/order/supplier/' + supplierId,
    method: 'delete'
  })
}
