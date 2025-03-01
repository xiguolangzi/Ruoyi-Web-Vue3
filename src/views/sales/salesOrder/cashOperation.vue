<template>
  <div ref="cashierContainer" class="cashier-container">
    <!-- 锁屏 -->
    <div v-if="isLocked" class="lock-screen-overlay">
      <div class="lock-screen-content">
        <el-input v-model="password" type="password" placeholder="请输入密码"></el-input>
        <el-button @click="unlockScreen">解锁</el-button>
      </div>
    </div>
    <!-- 收银台内容 -->
    <div class="cashier-content">
      <!-- 收银台的具体内容 -->
       <el-container class="full-height">
        <!-- 头部 -->
        <el-header style="background-color: aqua;">
          123456
        </el-header>
        <!-- 头部 -->
        <el-container class="full-height">
          <el-main >Main</el-main>
          <el-aside width="200px" style="background-color: blue;">
            <el-button @click="toggleFullScreen">全屏</el-button>
            <el-button @click="lockScreen">锁屏</el-button>
          </el-aside>
        </el-container>
        <!-- 尾部 -->
        <el-footer style="background-color: aqua;">Footer</el-footer>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'


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





</script>

<style lang="scss" scoped>
.cashier-container {
  width: 100%;
  height: 100%;
  background-color: #ecc8c8;

  .lock-screen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;

    .lock-screen-content {
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      text-align: center;
    }


  }

  .cashier-content {

    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);

    .full-height {
      height: 100%; /* el-container 高度充满 */
    }

    .el-header, .el-footer {
      flex-shrink: 0; /* 防止 header 和 footer 被压缩 */
    }

    .el-main {
      flex-grow: 1; /* Main 区域充满剩余空间 */
      overflow: auto; /* 内容溢出时显示滚动条 */
    }

    .el-aside {
      height: 100%; /* Aside 高度充满 */
    }
  }


}







</style>