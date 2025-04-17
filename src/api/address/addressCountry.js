import request from '@/utils/request'

// 查询国家表列表
export function listAddressCountry(query) {
  return request({
    url: '/address/addressCountry/list',
    method: 'get',
    params: query
  })
}

// 查询国家表详细
export function getAddressCountry(countryId) {
  return request({
    url: '/address/addressCountry/' + countryId,
    method: 'get'
  })
}

// 新增国家表
export function addAddressCountry(data) {
  return request({
    url: '/address/addressCountry',
    method: 'post',
    data: data
  })
}

// 修改国家表
export function updateAddressCountry(data) {
  return request({
    url: '/address/addressCountry',
    method: 'put',
    data: data
  })
}

// 删除国家表
export function delAddressCountry(countryId) {
  return request({
    url: '/address/addressCountry/' + countryId,
    method: 'delete'
  })
}
