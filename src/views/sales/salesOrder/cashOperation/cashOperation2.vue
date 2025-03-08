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
      <el-header class="header-container">
        <el-card class="header-card" shadow="hover">
          <div class="header-container">
            <div class="left-row">
              <div>
                <el-switch v-model="form.orderType" size="small" style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ff4949;" :active-value='0' :inactive-value='1' />
                {{ form.orderType == 0 ? "销售订单" : "退货订单" }}
              </div>
              <el-form-item label="业务员:" prop="salesmanId">
                <SalesmanSelect v-model="form.salesmanId" @selectedData="selectedSalesmanData"/>
              </el-form-item>
              <el-form-item label="客户:" prop="customerId">
                <CustomerSelect v-model="form.customerId"  @selectedData="selectedCustomerData"/>
              </el-form-item>
            </div>
            <div class="right-row">
              <el-row class="right-top">
                <span class="time">{{ currentTime }}</span>
                <span class="cashier">值班人员：QH007</span>
                <span class="version">收银台：1234567890abcdefghijklmn</span>
              </el-row>
              <el-row class="right-bottom">
                <div>
                  <el-switch v-model="form.orderInTax" size="small" style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ff4949;" :active-value="0" :inactive-value="1" />
                  {{ form.orderInTax === 0 ? "含税" : "不含税" }}
                </div>
                <el-form-item label="业务活动">
                  <SalesActivitySelect v-model="form.activityId" @selectedData="selectedSalesActivityData"/>
                </el-form-item>
                <el-form-item label="其他编辑：">其他信息</el-form-item>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-header>

      <!-- 主体部分 -->
      <el-container class="main-data">
        <el-main class="main">
          <div class="table-container">
            <el-table :data="form.salesOrderDetailList" border show-summary :stripe="true" size="small" style="width: 100%;height: 100%;">
              <el-table-column type="index" label="序号" align="center" width="55"/>
              <el-table-column prop="skuCode" label="商品编码" align="center" min-width="150" show-overflow-tooltip>
                <template v-slot="scope">
                  <el-popover trigger="hover" placement="left">
                    <image-preview :src="scope.row.skuImage" :width="60" :height="60" />
                    <template #reference>
                      <el-link type="primary" :underline="false">{{ scope.row.skuCode || '--' }}</el-link>
                    </template>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column prop="skuName" label="商品名称" align="center"  min-width="150" show-overflow-tooltip>
                <template #default="scope">
                  <span>
                    {{ scope.row.skuName || '' }}{{ scope.row.skuName && scope.row.assistName ? ' *** ' : '' }}{{ scope.row.assistName || '' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="skuValue" align="center"  label="规格属性" />
              <el-table-column prop="detailPrice" align="center"  label="单价" />
              <el-table-column prop="detailQuantity" align="center" label="数量" />
              <el-table-column prop="detailDiscountRate" align="center" label="折扣" />
              <el-table-column prop="detailSalesAmount" align="center" label="金额" />
              <el-table-column prop="promotionName" align="center" label="活动名称" />
              <el-table-column prop="skuType" align="center" label="商品类型" />
              <el-table-column prop="detailSn" align="center" label="机器码" />
              
            </el-table>
            
          </div>
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
              <el-form-item label="选中商品">
                <SkuSelect v-model="form.skuId"  @selectedData="selectedSkuData"/>
              </el-form-item>
              <div>
                <strong>"客户税号: "</strong><span>{{ currentCustomer?.invoiceTax || '--'}}</span>
              </div>
              <div>
                <strong>"客户电话号: "</strong><span>{{ currentCustomer?.invoicePhone || '--'}}</span>
              </div>
              <div>
                <strong>"邮编: "</strong><span>{{ currentCustomer?.invoicePostcode || '--'}}</span>
              </div>
              <div>
                <strong>"客户地址: "</strong><span>{{ currentCustomer?.invoiceAddress || '--'}}</span>
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
              <el-button class="footer-button" @click="handleAddSalesOrderDetail">确认</el-button>
              <el-button class="footer-button" @click="drawer = true">支付</el-button>
            </el-col>
          </el-row>
          <TouchKeyboard ref="keyboardRef" />
        </el-card>
      </el-footer>
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


const drawer = ref(false)
const currentCustomer = ref(null)
const currentSalesman = ref(null)
const currentSalesActivity = ref(null)
const currentSku = ref(null)

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


// ******************* 数据区域 ****************************
const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_is_hold, sales_order_in_tax, sales_order_direction, sales_order_detail_type, sales_order_type, sales_order_status, erp_product_sku_type, sales_order_pay_status } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_in_tax', 'sales_order_direction', 'sales_order_detail_type', 'sales_order_type', 'sales_order_status', 'erp_product_sku_type', 'sales_order_pay_status');


// 初始 - 头部数据

// 初始 - 主体数据

// 初始 - 尾部数据

const data = reactive({
  form: {
  },
  rules: {
    tenantId: [
      { required: true, message: "租户id不能为空", trigger: "blur" }
    ],
  }
});

const { form, rules } = toRefs(data);

// 表单重置
function reset() {
  form.value = initOrderData();
  proxy.resetForm("salesOrderRef");
}

/** 销售订单明细添加按钮操作 */
function handleAddSalesOrderDetail() {
  const obj = initOrderDetailData();
  form.value.salesOrderDetailList.push(obj)
}



onMounted(() => {
  reset();
});


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
// --------------------------    4 触摸键盘 start     --------------------
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
// --------------------------    4 触摸键盘 end     ----------------------

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
.cashier-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #f5f7fa, #e6e9ef); /* 浅灰色渐变 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 0; /* 确保基础层级 */
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
  margin: 0px;
  padding: 0px;
  height: 100%;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-size: 12px;

  .header-container {
    flex-shrink: 0;
    margin: 0px;
    padding: 0px;
    height: 80px;
    align-items: center;
    padding: 0px;
    margin: 0px;

    .header-card {
      width: 100%;
      height: 100%;
      margin: 0px;
      margin: 0px;
      padding: 0px;
      background: #ffffff; /* 白色背景 */
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0px;
        padding: 0px;
        gap: 20px;

        .left-row {
          display: flex;
          align-items: center;
          margin: 0px;
          padding: 0px 5px;
          gap: 10px;
        }

        .right-row {
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          margin: 0px;
          padding: 0px 5px;
          gap: 10px;

          .right-top {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 20px;
            font-size: 12px;
            margin-top: 5px;
            padding: 0px;
          }

          .right-bottom {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin: 0px;
            padding: 0px;
            gap: 10px;
          }
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
    height: 100%;
    width: 100%;
    display: flex; /* 使用 flex 布局 */
    flex-direction: column; /* 垂直排列子元素 */
    padding: 0px;
    background: #ffffff; /* 白色背景 */
    border-radius: 10px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

    .table-container{
      width: 100%;
      height: 100%;
    }

  }

  .aside {
    width: 100px;
    overflow-y: auto;
    padding: 5px 4px 4px 5px;
    margin: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    background: #ffffff; /* 白色背景 */
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    .action-button {
      flex-shrink: 0;
      width: 100%;
      padding: 0px;
      margin: 0px;
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .footer-card {
    width: 100%;
    height: 100%;
    margin: 2px 0px;
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

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6), 0 0 30px rgba(0, 255, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 15px rgba(0, 255, 255, 1), 0 0 25px rgba(0, 255, 255, 0.8), 0 0 35px rgba(0, 255, 255, 0.6);
  }
}


:deep(.el-form-item){
  margin: 0px ;
}


:deep(.el-card__body){
  margin: 0px !important;
  padding: 0px !important;
}





</style>