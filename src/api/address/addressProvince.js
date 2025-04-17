import request from '@/utils/request'

// 查询省份列表
export function listAddressProvince(query) {
  return request({
    url: '/address/addressProvince/list',
    method: 'get',
    params: query
  })
}

// 查询省份详细
export function getAddressProvince(provinceId) {
  return request({
    url: '/address/addressProvince/' + provinceId,
    method: 'get'
  })
}

// 新增省份
export function addAddressProvince(data) {
  return request({
    url: '/address/addressProvince',
    method: 'post',
    data: data
  })
}

// 修改省份
export function updateAddressProvince(data) {
  return request({
    url: '/address/addressProvince',
    method: 'put',
    data: data
  })
}

// 删除省份
export function delAddressProvince(provinceId) {
  return request({
    url: '/address/addressProvince/' + provinceId,
    method: 'delete'
  })
}
