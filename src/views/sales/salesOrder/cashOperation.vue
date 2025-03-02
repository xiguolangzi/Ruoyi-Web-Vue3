<template>
  <div ref="cashierContainer" class="cashier-container">
    <!-- 锁屏 -->
    <div v-if="isLocked" class="lock-screen-overlay">
      <div class="lock-screen-content">
        <el-input v-model="password" type="password" placeholder="请输入密码"></el-input>
        <el-button @click="unlockScreen">解锁</el-button>
      </div>
    </div>

    <!-- 收银台的具体内容 -->
    <el-container class="cash-body">
      <!-- 头部 -->
      <el-header class="header">
        <el-card class="header-card" shadow="hover" >
          <div class="header-container">
            <div class="left-row">
              <el-form-item label="订单：">销售订单</el-form-item>
              <el-form-item label="业务员：">小樱</el-form-item>
              <el-form-item label="客户：">银幕军团</el-form-item>
            </div>
            <div class="right-row">
              <el-row class="right-top">
                <span class="time">{{ currentTime }}</span>
                <span class="cashier">收银：QH007</span>
                <span class="version">仓库：主仓库</span>
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
              <el-button>确认</el-button>
              <el-button>支付</el-button>
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
  // 根据 action.action 执行对应的逻辑
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
}

// -------------------------     1 全屏锁屏 end     -------------------------

// --------------------------     2 锁屏 start     -------------------------

const isLocked = ref(false);
const password = ref('');
const lockScreen = () => {
  isLocked.value = true;
}

const unlockScreen = () => {
  if (password.value === '123456') {
    isLocked.value = false;
    password.value = '';
  } else {
    alert('密码错误,请重新输入！');
  }
}
// --------------------------     2 锁屏 end     -------------------------

// --------------------------     3 时间 start     -------------------------
// 当前时间
const currentTime = ref("");
/** 更新当前时间 */
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString();
};

onMounted(() => {
  updateTime();
  setInterval(updateTime, 1000); // 每秒更新时间
});
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
  height: 100%; /* 让整个页面撑满窗口 */
  display: flex;
  flex-direction: column; /* 纵向排列 header、main-container 和 footer */
  background: linear-gradient(145deg, #f0f0f0, #e0e0e0); /* 整体背景渐变 */
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 容器阴影 */

  .lock-screen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color:rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;

    .lock-screen-content {
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      text-align: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* 锁屏弹窗阴影 */
    }
  }

  .cash-body{
    display: flex;
    flex-direction: column; /* 让 header、main-container 和 footer 纵向排列 */
    height: 100%;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 内容区域阴影 */
    overflow: hidden;

    .header{
      flex-shrink: 0; /* 固定头部，不被挤压 */
      height: 80px;
      display: flex;
      align-items: center;
      padding: 0px;
      margin: 0px;

      .header-card{
        width: 100%;
        height: 100%;
        margin: 5px 0px;
        background: linear-gradient(145deg, #007aff, #005bb5); /* 头部渐变背景 */
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* 头部阴影 */

        .header-container{
          display: flex;
          justify-content: space-between; /* 左右分布 */
          align-items: center;
          gap: 20px;

          .left-row {
            //左悬浮
            display: flex;
            gap: 20px;
          }
          .right-row {
            display: flex;
            flex-direction: column;
            // 右对齐
            justify-content: flex-end;
            align-items: center;
            gap: 10px;

            .right-top{
              // 右对齐
              justify-content: flex-end;
              gap: 20px;
              font-size: 12px;
            }
            .right-bottom{
              // 右对齐
              justify-content: flex-end;
              gap: 10px;
            }
          }
        }

      }
    }

    .main-data{
      flex: 1; /* 填充 header 和 footer 之间的所有空间 */
      display: flex; /* 确保 main 和 aside 横向排列 */
      overflow: hidden; /* 避免 main 或 aside 撑大影响 footer */
      padding: 0px;
      margin: 0px;

      .main{
        flex: 1; /* 填充剩余空间 */
        overflow-y: auto; /* 超出时滚动 */
        padding: 10px;
        background: #f9f9f9; /* 主体背景色 */
        border-radius: 10px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1); /* 内阴影 */
      }

      .aside{
        width: 100px;
        overflow-y: auto; /* 确保数据超出时滚动 */
        padding: 5px 4px 4px 5px;
        margin: 0px;
        display: flex;
        flex-direction: column; /* 垂直排列 */
        align-items: center; /* 水平居中 */
        gap: 10px; /* 按钮之间的间距 */
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 侧边栏阴影 */

        .action-button {
          width: 100%;
          height: 40px;
          padding: 0px;
          margin: 0px;
          font-size: 14px;
          color: white;
          background: linear-gradient(145deg, #007aff, #005bb5); /* 渐变背景 */
          border: none;
          border-radius: 10px;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* 按钮阴影 */
          transition: all 0.2s ease; /* 平滑过渡 */

          &:hover {
            background: linear-gradient(145deg, #005bb5, #007aff); /* 悬浮时反转渐变 */
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3); /* 悬浮时阴影加深 */
            transform: translateY(-2px); /* 悬浮时轻微上移 */
          }

          &:active {
            background: linear-gradient(145deg, #004080, #007aff); /* 点击时颜色加深 */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 点击时阴影减小 */
            transform: translateY(0); /* 点击时恢复原位 */
          }
        }

        
      }

      
    }

    .footer{
      flex-shrink: 0; /* 确保 footer 不被挤压 */
      height: 200px;
      background: #fff;
      padding: 0px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 10px;
      box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1); /* 尾部阴影 */

      .footer-card{
        width: 100%;
        height: 100%;
        margin: 5px 0px;
        background: #f9f9f9; /* 尾部背景色 */
        border-radius: 10px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1); /* 内阴影 */
      }
    }
  }

}







</style>