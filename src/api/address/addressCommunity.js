import request from '@/utils/request'

// 查询大区列表
export function listAddressCommunity(query) {
  return request({
    url: '/address/addressCommunity/list',
    method: 'get',
    params: query
  })
}

// 查询大区详细
export function getAddressCommunity(communityId) {
  return request({
    url: '/address/addressCommunity/' + communityId,
    method: 'get'
  })
}

// 新增大区
export function addAddressCommunity(data) {
  return request({
    url: '/address/addressCommunity',
    method: 'post',
    data: data
  })
}

// 修改大区
export function updateAddressCommunity(data) {
  return request({
    url: '/address/addressCommunity',
    method: 'put',
    data: data
  })
}

// 删除大区
export function delAddressCommunity(communityId) {
  return request({
    url: '/address/addressCommunity/' + communityId,
    method: 'delete'
  })
}
