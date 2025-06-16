<template>
  <div class="login">
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">{{title}}</h3>
      <LangSelect class="set-language"></LangSelect>
      <el-form-item prop="tenantCode">
        <el-autocomplete
          v-model="loginForm.tenantCode"
          :fetch-suggestions="querySearch"
          clearable
          class="inline-input w-50"
          placeholder="公司编码"
          @select="handleSelect"
        >
          <template #prefix><svg-icon icon-class="CIF" class="el-input__icon input-icon" /></template>
        </el-autocomplete>
      </el-form-item>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          :show-password=true
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img"/>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width:100%;"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2025 ruoyi.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import LangSelect from "@/components/LangSelect";

const title = import.meta.env.VITE_APP_TITLE
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  tenantCode:"",
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
})

const loginRules = {
  tenantCode: [
    { required: true, trigger: "blur", message: "请输入您的公司编码" },
    { min: 9, max: 9, trigger: "blur", message: "税号长度为9位" }
  ],
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(false);
const redirect = ref(undefined);

// ------------------------- PWA 通知权限 start ---------------------
/** pwa - 浏览器通知 - 状态检查 */
function checkNotificationSupport() {
  if (!('Notification' in window)) {
    alert('您的浏览器不支持通知功能');
    return false;
  }
  return true;
}
// 请求通知权限
function requestNotificationPermission() {
  if (checkNotificationSupport()) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('通知权限已授予');
          new Notification('温馨提示：', {
            body: '您已经启用了Ok云的通知权限！',
          });
        } else if (permission === 'denied') {
          console.log('用户拒绝了通知权限');
        }
      });
    } else if (Notification.permission === 'denied') {
      alert(
        '通知权限已被永久拒绝，请手动在浏览器设置中启用：\n' +
        '1. 点击地址栏左侧的 锁图标、调音图标、或 叹号图标。\n' +
        '2. 找到“通知”选项，将其设置为“允许”。\n' +
        '3. 刷新页面。'
      );
    } else {
      console.log('通知权限已被授予，无需重复请求');
    }
  }
}
// ------------------------- PWA 通知权限 end ---------------------

// ------ 税号输入处理 -- start
// 1 建议列表
const taxRecentList = ref([]);
// 1.1 从 localStorage 获取存储的税号最近访问记录列表
const loadTaxRecentList = () => {
  try {
    const storedList = localStorage.getItem('taxRecentList');
    if (storedList) {
      taxRecentList.value = JSON.parse(storedList);
    } else {
      taxRecentList.value = []; // 如果没有找到，初始化为空数组
    }
  } catch (e) {
    console.log('税号存储到localStory异常:', e);
    taxRecentList.value = [];  // 初始化为空数组，防止后续操作出错
  }
};
// 2 查询建议的函数
const querySearch = (queryString, cb) => {
  const results = taxRecentList.value.filter(item => {
    return item.value.toLowerCase().includes(queryString.toLowerCase());
  });
  cb(results);
};
// 3 选择建议时的处理
const handleSelect = (item) => {
  // 去重，保留唯一值
  let updatedList = taxRecentList.value.filter(i => i.value !== item.value);
  // 新选择的值放在最前面
  updatedList.unshift(item);
  // 保持最多 5 条记录
  if (updatedList.length > 5) {
    updatedList = updatedList.slice(0, 5);
  }
  // 更新响应式列表和 localStorage
  taxRecentList.value = updatedList;
  localStorage.setItem('taxRecentList', JSON.stringify(updatedList));
};

// ------ 税号输入处理 -- end


watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handleLogin() {
  // 通知权限提示：
  requestNotificationPermission()
  // 表单预校验 -> 校验表单元素是否符合规则
  proxy.$refs.loginRef.validate(valid => {
    // 预校验通过
    if (valid) {
      // 登录按钮 切换成 登陆中状态
      loading.value = true;
      // 存储当前税号
      Cookies.set("tenantCode", loginForm.value.tenantCode, { expires: 30 });
      // 存储将当前税号存储到税号查询列表
      let newTaxRecentList = taxRecentList.value || []
      if (!newTaxRecentList.some(item => item.value === loginForm.value.tenantCode)) {
        newTaxRecentList.unshift({ value: loginForm.value.tenantCode });
        if (newTaxRecentList.length > 5) {
          newTaxRecentList = newTaxRecentList.slice(0, 5);
        }
        localStorage.setItem('taxRecentList', JSON.stringify(newTaxRecentList));
        taxRecentList.value = newTaxRecentList;
      }
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        // encrypt() 自定义密码加密，一定要更换密钥对 
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        // 获取当前路由的查询参数 query
        const query = route.query;
        // 获取除 redirect 外的其他查询参数
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc;
        }, {});
        // 跳转路由 ： http://localhost:8080/login?redirect=/index ->  参数 redirect.value == "/index"
        router.push({ path: redirect.value || "/", query: otherQueryParams });
      }).catch(() => {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie() {
  const tenantCode = Cookies.get("tenantCode");
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    tenantCode: tenantCode === undefined ? loginForm.value.tenantCode : tenantCode,
    username: username === undefined ? loginForm.value.username : username,
    // decrypt(password) 解析cookie中密码
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode();            // 获取验证码
getCookie();          // 记住密码
loadTaxRecentList();  // 获取税号最近访问记录
</script>

<style lang='scss' scoped>
.login {
  display: flex;
  justify-content: right;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background1.jpg");
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  margin-right: 10%;
  border-radius: 6px;
  // background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  
  background: rgb(249, 252, 252,0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    // transform: translateY(-10px);
    transform: translate3d(0px,-10px,10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
    z-index: -1;
    transition: all 0.3s ease;
  }
  &:hover::before {
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  }
  
  .set-language {
    height: 40px;
    color: #000000;
    font-size: 16px;
    margin-bottom: 20px;
  }
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
