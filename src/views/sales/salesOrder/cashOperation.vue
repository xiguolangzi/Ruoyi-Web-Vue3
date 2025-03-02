<template>
  <div ref="cashierContainer" class="cashier-container">
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
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="unlock-input"
          />
          <button @click="unlockScreen" class="unlock-button">解锁</button>
        </div>
      </div>
    </div>

    <!-- 收银台的具体内容 -->
    <el-container class="cash-body">
      <!-- 头部 -->
      <el-header class="header">
        <el-card class="header-card" shadow="hover">
          <div class="header-container">
            <div class="left-row">
              <el-form-item label="订单：">销售订单</el-form-item>
              <el-form-item label="业务员：">小樱</el-form-item>
              <el-form-item label="客户：">银幕军团</el-form-item>
            </div>
            <div class="right-row">
              <el-row class="right-top">
                <span class="time">{{ currentTime }}</span>
                <span class="cashier">值班人员：QH007</span>
                <span class="version">收银台：1234567890abcdefghijklmn</span>
              </el-row>
              <el-row>
                <el-form-item label="是否含税：">含税/不含税</el-form-item>
                <el-form-item label="参加活动：">手机活动</el-form-item>
                <el-form-item label="其他编辑：">其他信息</el-form-item>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-header>

      <!-- 主体部分 -->
      <el-container class="main-data">
        <el-main class="main">
          主体内容
          <div style="height: 900px;"></div>
        </el-main>
        <el-aside class="aside">
          <el-button
            v-for="(action, index) in actions"
            :key="index"
            size="small"
            type="primary"
            plain
            class="action-button"
            @click="handleAction(action)"
          >
            {{ action.label }}
          </el-button>
        </el-aside>
      </el-container>

      <!-- 尾部 -->
      <el-footer class="footer">
        <el-card shadow="always" class="footer-card">
          <el-row :gutter="20">
            <el-col :span="1.5">
              <el-form-item label="商品编码">
                <el-input v-model="price" placeholder="请输入商品编码/名称" style="width: 100%;" @focus="setActiveInput($refs.priceRef.$el.querySelector('input'))" ref="priceRef"></el-input>
              </el-form-item>
              <div>
                <strong>"客户税号: "</strong><span>x123456x</span>
              </div>
              <div>
                <strong>"客户电话号: "</strong><span>15518509821</span>
              </div>
              <div>
                <strong>"邮编: "</strong><span>132459</span>
              </div>
              <div>
                <strong>"客户地址: "</strong><span>madrid españa</span>
              </div>
            </el-col>
            <el-col :span="1.5">
              <div>订单汇总信息：</div>
              <div>总数量</div>
              <div>总金额</div>
              <div>折扣额</div>
              <div>优惠金额</div>
              <div>基础金额</div>
              <div>税额</div>
              <div>应交金额</div>
            </el-col>
            <el-col :span="1.5">
              <el-button class="footer-button">确认</el-button>
              <el-button class="footer-button">支付</el-button>
            </el-col>
          </el-row>
          <TouchKeyboard ref="keyboardRef" />
        </el-card>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TouchKeyboard from '@/components/TouchKeyboard/index.vue';
import { set } from 'lodash';

const actions = [
  { label: "全屏", action: "toggleFullScreen" },
  { label: "锁屏", action: "lockScreen" },
  { label: "挂单", action: "holdOrder" },
  { label: "拆单", action: "splitOrder" },
  { label: "支付", action: "pay" },
  { label: "钱箱", action: "openCashDrawer" },
  { label: "重打", action: "reprint" },
  { label: "赠品", action: "reprint" },
  { label: "通用商品", action: "reprint" },
  { label: "整单折扣", action: "reprint" },
];

const handleAction = (action) => {
  console.log("执行操作:", action.label);
  switch (action.action) {
    case "toggleFullScreen":
      toggleFullScreen();
      break;
    case "lockScreen":
      lockScreen();
      break;
    case "holdOrder":
      console.log("挂单");
      break;
    case "splitOrder":
      console.log("拆单");
      break;
    case "pay":
      console.log("支付");
  }
};

// -------------------------     1 全屏锁屏 start     -------------------------
const cashierContainer = ref(null);
const isFullScreen = ref(false);

const toggleFullScreen = () => {
  if (isFullScreen.value) {
    document.exitFullscreen();
  } else {
    cashierContainer.value.requestFullscreen();
  }
  isFullScreen.value = !isFullScreen.value;
};

// -------------------------     1 全屏锁屏 end     -------------------------

// --------------------------     2 锁屏 start     -------------------------
const isLocked = ref(false);
const password = ref('');

const lockScreen = () => {
  isLocked.value = true;
};

const unlockScreen = () => {
  if (password.value === '123456') {
    isLocked.value = false;
    password.value = '';
  } else {
    alert('密码错误,请重新输入！');
  }
};
// --------------------------     2 锁屏 end     -------------------------

// --------------------------     3 时间 start     -------------------------
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

// -------------------------     3 时间 end     -------------------------

const price = ref("");
const quantity = ref("");
const keyboardRef = ref(null);
const priceRef = ref(null);
const quantityRef = ref(null);

const setActiveInput = (inputEl) => {
  keyboardRef.value.setActiveInput(inputEl);
};

onMounted(() => {
  setActiveInput(priceRef.value.$el.querySelector("input"));
});
</script>

<style lang="scss" scoped>
.cashier-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #f5f7fa, #e6e9ef); /* 浅灰色渐变 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

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
  }
}

.cash-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff; /* 白色背景 */
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  flex-shrink: 0;
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0px;
  margin: 0px;

  .header-card {
    width: 100%;
    height: 100%;
    margin: 5px 0px;
    background: #ffffff; /* 白色背景 */
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;

      .left-row {
        display: flex;
        gap: 20px;
      }

      .right-row {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        gap: 10px;

        .right-top {
          justify-content: flex-end;
          gap: 20px;
          font-size: 12px;
        }
      }
    }
  }
}

.main-data {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 0px;
  margin: 0px;

  .main {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    background: #ffffff; /* 白色背景 */
    border-radius: 10px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .aside {
    width: 100px;
    overflow-y: auto;
    padding: 5px 4px 4px 5px;
    margin: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background: #ffffff; /* 白色背景 */
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    .action-button {
      width: 100%;
      height: 40px;
      padding: 0px;
      margin: 0px;
      font-size: 14px;
      color: white;
      background: #007aff; /* 蓝色 */
      border: none;
      border-radius: 10px;
      cursor: pointer;
      user-select: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;

      &:hover {
        background: #005bb5; /* 深蓝色 */
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
      }

      &:active {
        background: #004080; /* 更深蓝色 */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transform: translateY(0);
      }
    }
  }
}

.footer {
  flex-shrink: 0;
  height: 200px;
  background: #ffffff; /* 白色背景 */
  padding: 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);

  .footer-card {
    width: 100%;
    height: 100%;
    margin: 5px 0px;
    background: #ffffff; /* 白色背景 */
    border-radius: 10px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

    .footer-button {
      width: 100%;
      height: 40px;
      padding: 0px;
      margin: 0px;
      font-size: 14px;
      color: white;
      background: #007aff; /* 蓝色 */
      border: none;
      border-radius: 10px;
      cursor: pointer;
      user-select: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;

      &:hover {
        background: #005bb5; /* 深蓝色 */
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
      }

      &:active {
        background: #004080; /* 更深蓝色 */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transform: translateY(0);
      }
    }
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>