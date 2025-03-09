<template>
  <div :class="classObj" class="app-wrapper" :style="{ '--current-color': theme }">
    <!-- 锁屏 -->
    <LockScreen ref="lockScreenRef" />

    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar v-if="!sidebar.hide" class="sidebar-container" />
    <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar @setLayout="setLayout" @handleLockScreen="lockScreen" />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <settings ref="settingRef" />
    </div>
  </div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import Sidebar from './components/Sidebar/index.vue'
import { AppMain, Navbar, Settings, TagsView } from './components'
import defaultSettings from '@/settings'

import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'

import LockScreen from '@/components/LockScreen/index.vue'
import { ElMessageBox, ElNotification } from 'element-plus'

const settingsStore = useSettingsStore()
const theme = computed(() => settingsStore.theme);
const sideTheme = computed(() => settingsStore.sideTheme);
const sidebar = computed(() => useAppStore().sidebar);
const device = computed(() => useAppStore().device);
const needTagsView = computed(() => settingsStore.tagsView);
const fixedHeader = computed(() => settingsStore.fixedHeader);

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}))

const { width, height } = useWindowSize();
const WIDTH = 992; // refer to Bootstrap's responsive design

watch(() => device.value, () => {
  if (device.value === 'mobile' && sidebar.value.opened) {
    useAppStore().closeSideBar({ withoutAnimation: false })
  }
})

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile')
    useAppStore().closeSideBar({ withoutAnimation: true })
  } else {
    useAppStore().toggleDevice('desktop')
  }
})

function handleClickOutside() {
  useAppStore().closeSideBar({ withoutAnimation: false })
}

const settingRef = ref(null);
function setLayout() {
  settingRef.value.openSetting();
}

// --------------------------     2 锁屏 start     -------------------------
// 引用锁屏组件
const lockScreenRef = ref(null);
// 锁定屏幕
// const lockScreen = () => {
//   let inputPassword = prompt('请输入密码（1-6位）以锁定屏幕');
//   if (inputPassword) {
//     // 检查密码长度
//     if (inputPassword.length < 1 || inputPassword.length > 6) {
//       alert('密码长度必须为 1-6 位！');
//       return;
//     }

//     lockScreenRef.value.lockScreen(inputPassword); // 锁定屏幕

//   }else {
//     alert('密码不能为空！');
//   }
// };

const lockScreen = async () => {
  try {
    // 弹出密码输入框
    const { value: inputPassword } = await ElMessageBox.prompt(
      '请输入密码（1-6位）以锁定屏幕', // 提示信息
      '锁定屏幕', // 标题
      {
        inputType: 'password', // 设置为密码输入模式
        inputPattern: /^.{1,6}$/, // 正则表达式限制输入长度为 1-6 位
        inputErrorMessage: '密码长度必须为 1-6 位！', // 输入不符合规则时的错误提示
      }
    );

    // 如果用户输入了密码
    if (inputPassword) {
      // 调用锁定屏幕的逻辑
      lockScreenRef.value.lockScreen(inputPassword);
    }
  } catch (error) {
    // 用户点击了取消
    console.log('用户取消了输入密码');
  }
};

// --------------------------     2 锁屏 end     -------------------------


</script>

<style lang="scss" scoped>
  @import "@/assets/styles/mixin.scss";
  @import "@/assets/styles/variables.module.scss";

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$base-sidebar-width});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}

.main-container{
  height: 100%;
}


.lock-screen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle, #001f3f, #000);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 99999;

    .time-display {
      font-family: 'Digital-7', monospace;
      font-size: 10rem;
      font-weight: bold;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;

      .digit {
        background: rgba(255, 255, 255, 0.1);
        padding: 10px 20px;
        margin: 0 5px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6), 0 0 30px rgba(0, 255, 255, 0.4);
        animation: glow 1.5s infinite alternate;
      }

      .colon {
        margin: 0 10px;
        animation: blink 1s infinite;
      }
    }

    .unlock-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      margin-top: 40px;

      .unlock-input {
        width: 200px;
        padding: 10px;
        font-size: 16px;
        color: white;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 5px;
        outline: none;
        text-align: center;

        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      }

      .unlock-button {
        width: 200px;
        padding: 10px;
        font-size: 16px;
        color: white;
        background: rgba(0, 255, 255, 0.2);
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s ease;

        &:hover {
          background: rgba(0, 255, 255, 0.4);
        }

        &:active {
          background: rgba(0, 255, 255, 0.6);
        }
      }
    }
  }
</style>