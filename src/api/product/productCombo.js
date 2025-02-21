import request from '@/utils/request'

// 查询商品套餐列表
export function listProductCombo(query = {}) {
  const pageSize = query.pageSize || 1000;
  return request({
    url: '/product/productCombo/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询商品套餐详细
export function getProductCombo(comboId) {
  return request({
    url: '/product/productCombo/' + comboId,
    method: 'get'
  })
}

// 新增商品套餐
export function addProductCombo(data) {
  return request({
    url: '/product/productCombo',
    method: 'post',
    data: data
  })
}

// 修改商品套餐
export function updateProductCombo(data) {
  return request({
    url: '/product/productCombo',
    method: 'put',
    data: data
  })
}

// 删除商品套餐
export function delProductCombo(comboId) {
  return request({
    url: '/product/productCombo/' + comboId,
    method: 'delete'
  })
}
