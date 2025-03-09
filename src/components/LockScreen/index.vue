<template>
  <!-- 锁屏 -->
  <div v-if="isLocked" class="lock-screen-overlay">
    <div class="lock-screen-content">
      <!-- 时间显示 -->
      <div class="time-display">
        <span class="digit">{{ hours }}</span>
        <span class="colon">:</span>
        <span class="digit">{{ minutes }}</span>
        <span class="colon">:</span>
        <span class="digit">{{ seconds }}</span>
      </div>
      <!-- 解锁输入框和按钮 -->
      <div class="unlock-section">
        <input v-model="unLockPassword" type="password" placeholder="请输入解锁密码" class="unlock-input" maxlength="6"
          @keydown.enter="unlockScreen" />
        <button @click="unlockScreen" class="unlock-button">解锁</button>
        <button @click="handleForgotPassword" class="forgot-password-button">退出登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { dbConfig } from '@/indexedDB/dbConfig.js';
import IndexedDBUtil from '@/indexedDB/index.js';
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()

// --------------------------     1 锁屏 start     -------------------------
const DB_NAME = "configDB";
const STORE_NAME = "lockScreenConfig";
const indexName = "lockScreenKey";

// 1 先判断 DB_NAME 和 STORE_NAME 是否存加入配置
const dbObject = dbConfig.find((db) => db.dbName === DB_NAME);
if (!dbObject) {
  throw new Error(`未找到数据库 '${DB_NAME}' 的配置`);
} else {
  if (!dbObject.storeNameList.find((store) => store.storeName === STORE_NAME)) {
    throw new Error(`未找到数据库 '${DB_NAME}' 中的存储 '${STORE_NAME}' 的配置`);
  }
}

const isLocked = ref(false);


// 判断 IndexedDB 是否已经存在密码，如果存在则锁屏
const loadPasswordFromDB = async () => {
  try {
    const config = await IndexedDBUtil.getAllData(DB_NAME, STORE_NAME);
    if (config?.length > 0) {
      isLocked.value = true; // 如果存在密码，默认锁定屏幕
    }
  } catch (error) {
    console.log(DB_NAME, STORE_NAME);
    console.error('加载密码失败:', error);
  }
};

// 初始化时检查密码是否存在
onMounted(() => {
  loadPasswordFromDB();
});


const lockScreen = (password) => {
   IndexedDBUtil.saveData(DB_NAME, STORE_NAME, {
      id: 1,
     lockScreenKey: password,
    }).then(() => {
      isLocked.value = true;
      console.log('锁屏成功！');
    });
};

const unLockPassword = ref('');
const unlockScreen = async () => {
  const config = await IndexedDBUtil.getDataByIndex(DB_NAME, STORE_NAME, indexName, unLockPassword.value);
  if (config) {
    isLocked.value = false;
    unLockPassword.value = '';

    // 解锁成功后清除密码
    await IndexedDBUtil.clearStore(DB_NAME, STORE_NAME);
  } else {
    alert('密码错误,请重新输入！');
  }
};

// 忘记密码处理
const handleForgotPassword = () => {
  try{
    
    // 注销成功后跳转首页
    userStore.logOut().then(() => {
      // 清除锁屏密码
      IndexedDBUtil.clearStore(DB_NAME, STORE_NAME).then(() => {
        console.log("清除锁屏密码成功！")
      }).catch(() => {
        console.error("清除锁屏密码失败！")
      });
      // 返回首页
      location.href = '/index';
    }).catch(() => {
      console.error("注销失败！")
   });
  } catch(e) {
    console.error("调用注销失败！" + e)
  };
};

// 暴露锁屏方法给父组件
defineExpose({
  lockScreen,
});
// --------------------------     1 锁屏 end     -------------------------

// --------------------------     2 时间 start     -------------------------
const hours = ref('00');
const minutes = ref('00');
const seconds = ref('00');

// 更新时间
const updateTime = () => {
  const now = new Date();
  hours.value = String(now.getHours()).padStart(2, '0');
  minutes.value = String(now.getMinutes()).padStart(2, '0');
  seconds.value = String(now.getSeconds()).padStart(2, '0');
};

// 每秒更新时间
onMounted(() => {
  updateTime();
  setInterval(updateTime, 1000);
  setInterval(getCurrentLocalTime, 1000);
});

// 获取当前本地时间
const currentTime = ref(null);
const getCurrentLocalTime = () => {
  // 返回当前日期+时间
  currentTime.value = new Date().toLocaleString();
};

// -------------------------     2 时间 end     -------------------------
</script>

<style lang="scss" scoped>
.lock-screen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #001f3f, #000); /* 科技感背景 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .time-display {
    font-family: 'Digital-7', monospace; /* 使用电子表字体 */
    font-size: 10rem;
    font-weight: bold;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;

    .digit {
      background: rgba(255, 255, 255, 0.1); /* 半透明背景 */
      padding: 10px 20px;
      margin: 0 5px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6), 0 0 30px rgba(0, 255, 255, 0.4); /* 发光效果 */
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
      background: rgba(255, 255, 255, 0.1); /* 半透明背景 */
      border: none;
      border-radius: 5px;
      outline: none;
      text-align: center;

      &::placeholder {
        color: rgba(255, 255, 255, 0.5); /* 半透明占位符 */
      }
    }

    .unlock-button {
      width: 200px;
      padding: 10px;
      font-size: 16px;
      color: white;
      background: rgba(0, 255, 255, 0.2); /* 半透明背景 */
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s ease;

      &:hover {
        background: rgba(0, 255, 255, 0.4); /* 悬浮时背景变亮 */
      }

      &:active {
        background: rgba(0, 255, 255, 0.6); /* 点击时背景更亮 */
      }
    }

    .forgot-password-button {
      width: 200px;
      padding: 10px;
      font-size: 16px;
      color: white;
      background: rgba(0, 255, 255, 0.2); /* 半透明背景 */
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s ease;

      &:hover {
        background: rgba(0, 255, 255, 0.4); /* 悬浮时背景变亮 */
      }

      &:active {
        background: rgba(0, 255, 255, 0.6); /* 点击时背景更亮 */
      }
    }
  }
}
</style>