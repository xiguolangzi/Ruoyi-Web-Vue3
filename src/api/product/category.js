import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询商品分类列表
export function listCategory(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/product/category/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询商品分类详细
export function getCategory(categoryId) {
  return request({
    url: '/product/category/' + categoryId,
    method: 'get'
  })
}

// 新增商品分类
export function addCategory(data) {
  return request({
    url: '/product/category',
    method: 'post',
    data: data
  })
}

// 修改商品分类
export function updateCategory(data) {
  return request({
    url: '/product/category',
    method: 'put',
    data: data
  })
}

// 删除商品分类
export function delCategory(categoryId) {
  return request({
    url: '/product/category/' + categoryId,
    method: 'delete'
  })
}
