import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询仓库列表
export function listWarehouse(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/product/warehouse/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询仓库详细
export function getWarehouse(warehouseId) {
  return request({
    url: '/product/warehouse/' + warehouseId,
    method: 'get'
  })
}

// 新增仓库
export function addWarehouse(data) {
  return request({
    url: '/product/warehouse',
    method: 'post',
    data: data
  })
}

// 修改仓库
export function updateWarehouse(data) {
  return request({
    url: '/product/warehouse',
    method: 'put',
    data: data
  })
}

// 删除仓库
export function delWarehouse(warehouseId) {
  return request({
    url: '/product/warehouse/' + warehouseId,
    method: 'delete'
  })
}
