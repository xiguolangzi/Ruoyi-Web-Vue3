import request from '@/utils/request'
import { MaxLengthEnum } from '@/api/constants/commonConstants'

// 查询sku规格名称列表
export function listSkuName(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/product/skuName/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询sku规格名称详细
export function getSkuName(id) {
  return request({
    url: '/product/skuName/' + id,
    method: 'get'
  })
}

// 新增sku规格名称
export function addSkuName(data) {
  return request({
    url: '/product/skuName',
    method: 'post',
    data: data
  })
}

// 修改sku规格名称
export function updateSkuName(data) {
  return request({
    url: '/product/skuName',
    method: 'put',
    data: data
  })
}

// 删除sku规格名称
export function delSkuName(id) {
  return request({
    url: '/product/skuName/' + id,
    method: 'delete'
  })
}
