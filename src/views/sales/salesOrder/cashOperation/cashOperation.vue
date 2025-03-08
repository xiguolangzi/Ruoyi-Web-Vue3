<template>
  <div ref="cashierContainer" class="app-container">
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
    <el-container class="cash-container">
      <!-- 左侧区域 -->
      <el-container class="left-container">

        <!-- 上部分：流水展示 -->
        <el-main class="main-data-container">
          <EditableTable :tableData="form.salesOrderDetailList"/>
        </el-main>

        <!-- 下部分：商品输入框和汇总信息 -->
        <el-footer class="footer-data-container" height="200px">
          <div class="input-summary-container">
            <SkuSelect v-model="form.skuId"  @selectedData="selectedSkuData"/>          
          </div>
        </el-footer>
      </el-container>

      <!-- 右侧区域 -->
      <el-aside class="right-container" width="300px">
        <el-tabs type="border-card" class="full-height-tabs">
          <el-tab-pane label="工具" >
            <div class="tool-keyboard">
              <TouchKeyboard ref="keyboardRef" />
            </div>
            <el-divider />
            <div class="tool-button">
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
            </div>
          </el-tab-pane>
          <el-tab-pane label="订单设置">
            <div>
              <div class="left-row">
                <div>
                  <el-switch v-model="form.orderType" size="small" style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ff4949;" :active-value='0' :inactive-value='1' />
                  {{ form.orderType == 0 ? "销售订单" : "退货订单" }}
                </div>
                <el-divider content-position="left"> <span>订单绑定业务员</span> </el-divider>
                <el-form-item label="业务员:" prop="salesmanId">
                  <SalesmanSelect v-model="form.salesmanId" @selectedData="selectedSalesmanData"/>
                </el-form-item>
                <el-form-item label="客户:" prop="customerId">
                  <CustomerSelect v-model="form.customerId"  @selectedData="selectedCustomerData"/>
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="商品查询">
            商品区域
          </el-tab-pane>
          <el-tab-pane label="系统设置">
            其他预留区域
          </el-tab-pane>
        </el-tabs>
      </el-aside>
    </el-container>

    <el-drawer v-model="drawer" title="I am the title" :with-header="false">
      <span>Hi there!</span>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TouchKeyboard from '@/components/TouchKeyboard/index.vue';
import {initOrderData, initOrderDetailData, StatusEnum} from './cashOperationEnum.js';
import CustomerSelect from '@/components/Common/CustomerSelect.vue';
import SalesmanSelect from '@/components/Common/SalesmanSelect.vue';
import SalesActivitySelect from '@/components/Common/SalesActivitySelect.vue';
import SkuSelect from '@/components/Common/SkuSelect.vue';
import EditableTable from './EditableTable.vue';

const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_is_hold, sales_order_in_tax, sales_order_direction, sales_order_detail_type, sales_order_type, sales_order_status, erp_product_sku_type, sales_order_pay_status } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_in_tax', 'sales_order_direction', 'sales_order_detail_type', 'sales_order_type', 'sales_order_status', 'erp_product_sku_type', 'sales_order_pay_status');

const keyboardRef = ref(null); // 键盘组件实例
const productInput = ref(''); // 商品输入框的值

// 监听全局焦点事件
onMounted(() => {
  document.addEventListener('focus', handleFocus, true); // 捕获阶段监听
});

// 处理焦点事件
const handleFocus = (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    keyboardRef.value?.setActiveInput(event.target); // 将聚焦的输入框传递给键盘组件
  }
};



const drawer = ref(false)
const currentCustomer = ref(null)
const currentSalesman = ref(null)
const currentSalesActivity = ref(null)
const currentSku = ref(null)

const data = reactive({
  form: {
    salesOrderDetailList: [], // 初始化为空数组
  },
  rules: {
    tenantId: [
      { required: true, message: "租户id不能为空", trigger: "blur" }
    ],
  }
});

const { form, rules } = toRefs(data);

/** 获取选中的客户数据 */
const selectedCustomerData = (data) => {
  console.log('收银台获取的客户数据:',data)
  currentCustomer.value = data || null;
}

/** 获取选中的客户数据 */
const selectedSalesmanData = (data) => {
  console.log('收银台获取的业务员数据:',data)
  currentSalesman.value = data || null;
}

/** 获取选中的业务活动数据 */
const selectedSalesActivityData = (data) => {
  console.log('收银台获取的业务活动数据:',data)
  currentSalesActivity.value = data || null;
}

/** 获取选中的商品数据 */
const selectedSkuData = (data) => {
  console.log('收银台获取的商品数据:',data)
  currentSku.value = data || null;
}

// 表单重置
function reset() {
  form.value = initOrderData();
  proxy.resetForm("salesOrderRef");
}

onMounted(() => {
  reset();
});

/** 销售订单明细添加按钮操作 */
function handleAddSalesOrderDetail() {
  const obj = initOrderDetailData();
  form.value.salesOrderDetailList.push(obj)
}

// **********************




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


// --------------------------  5 侧边栏按钮区域 start  -------------------
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
      handleAddSalesOrderDetail()
      break;
    case "splitOrder":
      console.log("拆单");
      break;
    case "pay":
      console.log("支付");
      console.log("表单form的数据：*****", form.value)
      break;
  }
};

// --------------------------  5 侧边栏按钮区域 end  -------------------

</script>

<style lang="scss" scoped>
.app-container {
  width: 100%;
  height: 100%; /* 占据整个视口高度 */
  display: flex;
  flex-direction: column;
  margin: 0px;
  padding: 0px;
  background: linear-gradient(145deg, #f5f7fa, #e6e9ef);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 0;

  .lock-screen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, #001f3f, #000);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;

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

  .cash-container {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;

    .left-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;

      .main-data-container {
        flex: 1;
        padding: 0px;
        margin: 0px;
        background-color: #f0f0f0; /* 上部分背景色 */
        overflow-y: auto; /* 允许滚动 */

        .flow-container {
          height: 100%;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .footer-data-container {
        flex-shrink: 0;
        height: 200px; /* 固定高度 */
        width: 100%;
        padding: 0px;
        margin: 0px;
        background-color: #e0e0e0; /* 下部分背景色 */

        .input-summary-container {
          height: 100%;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .right-container {
      width: 300px;
      height: 100%;
      padding: 0px;
      margin: 0px;
      background-color: #f5f7fa; /* 右侧背景色 */
      overflow-y: auto; /* 允许滚动 */

      .full-height-tabs{
        width: 100%;
        height: 100%;



        .tool-keyboard {
          width: 100%;
        }

        .tool-button {
        margin-top: 30px;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr); /* 两列布局 */
        gap: 10px; /* 按钮间距 */

          .action-button {
            margin: 0px;
            width: 100%;
            height: 100%;
            padding: 12px;
            font-size: 14px;
            color: white;
            background: linear-gradient(145deg, #007aff, #005bb5); /* 渐变背景 */
            border: none;
            border-radius: 8px; /* 圆角 */
            cursor: pointer;
            user-select: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 阴影 */
            transition: all 0.2s ease;

            &:hover {
              background: linear-gradient(145deg, #005bb5, #007aff); /* 悬停时反转渐变 */
              box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2); /* 悬停时阴影加深 */
              transform: translateY(-2px); /* 轻微上移 */
            }

            &:active {
              background: linear-gradient(145deg, #004080, #007aff); /* 点击时颜色加深 */
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 点击时阴影减小 */
              transform: translateY(0); /* 恢复原位 */
            }
          }
        }

        /* 设置 Tab 内容区域的高度 */
        :deep(.el-tabs__content) {
          flex: 1;
          overflow-y: auto; /* 允许内容区域滚动 */
          padding: 10px;
        }

      }

    }
  }
}
</style>