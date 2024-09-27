import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: []
    }),
    actions: {
      // 登录
      login(userInfo) {
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        // Promise 是 JavaScript 中处理异步操作的一种方式
        return new Promise((resolve, reject) => {
          // 调用 @/api/login 中的 login 方法
          login(username, password, code, uuid).then(res => {
            // 设置 cookie中的token
            setToken(res.token)
            // 重置store中的token
            this.token = res.token
            // .then 异步调用成功之后的处理 -> resolve() 代表异步调用成功结束
            resolve()
          }).catch(error => {
            // .catch 异步调用失败之后的处理 -> reject(error) 返回给调用者错误信息
            reject(error)
          })
        })
      },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          // 调用 @/api/login 中的 getInfo 方法
          getInfo().then(res => {
            const user = res.user
            // 获取头像 = "默认路径" 或者 "/dev-api + 头像地址"
            const avatar = (user.avatar == "" || user.avatar == null) ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar;

            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.userId
            this.name = user.userName
            this.avatar = avatar
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          logout(this.token).then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            removeToken()
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      }
    }
  })

export default useUserStore
