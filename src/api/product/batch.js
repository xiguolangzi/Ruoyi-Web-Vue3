import request from '@/utils/request'

// 查询商品批次列表
export function listBatch(query) {
  return request({
    url: '/product/batch/list',
    method: 'get',
    params: query
  })
}

// 查询商品批次详细
export function getBatch(batchId) {
  return request({
    url: '/product/batch/' + batchId,
    method: 'get'
  })
}

// 新增商品批次
export function addBatch(data) {
  return request({
    url: '/product/batch',
    method: 'post',
    data: data
  })
}

// 修改商品批次
export function updateBatch(data) {
  return request({
    url: '/product/batch',
    method: 'put',
    data: data
  })
}

// 删除商品批次
export function delBatch(batchId) {
  return request({
    url: '/product/batch/' + batchId,
    method: 'delete'
  })
}
