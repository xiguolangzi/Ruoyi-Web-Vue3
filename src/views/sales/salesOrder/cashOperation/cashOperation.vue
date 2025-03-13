<template>
  <div ref="cashierContainer"  class="app-container">
    <!-- 收银台的具体内容 -->
    <el-container class="cash-container">
      <!-- 左侧区域 -->
      <el-container class="left-container">

        <!-- 上部分：流水展示 -->
        <el-main class="main-data-container">
          <EditableTable :tableData="form.salesOrderDetailList" />
        </el-main>

        <!-- 下部分：商品输入框和汇总信息 -->
        <el-footer class="footer-data-container" height="200px">
          <div class="input-summary-container">
            <SkuSelect ref="skuSelectRef" @selectedData="selectedSkuData" />
          </div>
        </el-footer>
      </el-container>

      <!-- 右侧区域 -->
      <el-aside class="right-container" width="300px">
        <el-tabs type="border-card" class="full-height-tabs">
          <el-tab-pane label="工具">
            <div class="tool-keyboard">
              <TouchKeyboard ref="keyboardRef" />
            </div>
            <el-divider />
            <div class="tool-button">
              <el-button v-for="(action, index) in actions" :key="index" size="small" type="primary" plain
                class="action-button" @click="handleAction(action)">
                {{ action.label }}
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="订单设置">
            <div>
              <div class="left-row">
                <div>
                  <el-switch v-model="form.orderType" size="small"
                    style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ff4949;" :active-value='0'
                    :inactive-value='1' />
                  {{ form.orderType == 0 ? "销售订单" : "退货订单" }}
                </div>
                <el-divider content-position="left"> <span>订单绑定业务员</span> </el-divider>
                <el-form-item label="业务员:" prop="salesmanId">
                  <SalesmanSelect v-model="form.salesmanId" @selectedData="selectedSalesmanData" />
                </el-form-item>
                <el-form-item label="客户:" prop="customerId">
                  <CustomerSelect v-model="form.customerId" @selectedData="selectedCustomerData" />
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

    <el-dialog v-model="dialogVisible" title="交班信息" width="600" 
      style="margin-top: 100px !important;"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-tabs type="border-card" class="full-height-tabs" v-model="activeTab">
        <el-tab-pane label="核对信息" name="first">
          <el-descriptions class="margin-top" :column="2" size="small" border label-width="100px">
            <el-descriptions-item label="上次值班编号: ">
              {{ shiftForm.lastShiftNo }}
            </el-descriptions-item>
            <el-descriptions-item label="上次现金余额: " label-class-name="total-label" class-name="total-content">
              <strong class="strong-font">{{ formatTwo(shiftForm.lastShiftCashAmount) + ' €' }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="本次值班编号: " :span="2">
              {{ shiftForm.shiftNo ?? '系统自动生成' }}
            </el-descriptions-item>
            <el-descriptions-item label="当前值班: ">
              {{ shiftForm.userName ?? '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="收银台: ">
              {{ shiftForm.cajaName ?? '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="开始时间: ">
              {{ shiftForm.shiftStartTime ?? '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="结束时间: ">
              {{ shiftForm.shiftEndTime ?? '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="本次总收入: " :span="2" label-class-name="total-label" class-name="total-content" >
              <strong class="strong-font">{{ formatTwo(shiftForm.totalSalesAmount) + ' €' }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="现金收款: ">
              {{ formatTwo(shiftForm.totalCash) + ' €' }}
            </el-descriptions-item>
            <el-descriptions-item label="银行收款: ">
              {{ formatTwo(shiftForm.totalBank) + ' €' }}
            </el-descriptions-item>
            <el-descriptions-item label="现金退款: ">
              <span :style="{ color: shiftForm.totalRefundCash < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(shiftForm.totalRefundCash) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="银行退款: ">
              <span :style="{ color: shiftForm.totalRefundBank < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(shiftForm.totalRefundBank) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="现金找零: " :span="2" >
              <span :style="{ color: shiftForm.totalChange < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(shiftForm.totalChange) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="现金总收入: " label-class-name="total-label" class-name="total-content" >
              <span :style="{ color: totalCash < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(totalCash) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="银行总收入: " label-class-name="total-label" class-name="total-content" >
              <span :style="{ color: totalBank < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(totalBank) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="优惠抹零: " :span="2">
              <span :style="{ color: shiftForm.totalZero < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(shiftForm.totalZero) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="应交现金: " :span="2" label-class-name="total-label" class-name="total-content" >
              <strong class="strong-font">{{ formatTwo(shiftForm.currentExpectedCash) + ' €' }}</strong>  
            </el-descriptions-item>
            <el-descriptions-item label="补充现金: " :span="2" label-class-name="input-label" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.currentReplenishCash" 
              placeholder="请输入补充金额" :value-on-clear="0" :precision="2" :min="0" :max="99999" 
              v-focusSelect  style="width: 100%;" :disabled="!shiftForm.shiftId" :class="shiftForm.currentReplenishCash < 0 ? 'negative-input' : ''">
                <template #suffix>€</template>
              </el-input-number>
            </el-descriptions-item>
            <el-descriptions-item label="上交现金: " :span="2" label-class-name="input-label" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.currentDepositCash" 
              placeholder="请输入上交金额" :value-on-clear="0" :precision="2" :min="-9999" :max="0" 
              v-focusSelect style="width: 100%;" :disabled="!shiftForm.shiftId" :class="shiftForm.currentDepositCash < 0 ? 'negative-input' : ''">
                <template #suffix>€</template>
              </el-input-number>
            </el-descriptions-item>
            <el-descriptions-item label="长/短款: " :span="2" label-class-name="input-label" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.currentBalanceDifference" 
              placeholder="请输入长短款金额" :value-on-clear="0" :precision="2" :min="-999" :max="999" 
              v-focusSelect  style="width: 100%;" :disabled="!shiftForm.shiftId" :class="shiftForm.currentBalanceDifference < 0 ? 'negative-input' : ''">
                <template #suffix >€</template>
              </el-input-number>
            </el-descriptions-item>
            <el-descriptions-item label="交班现金余额: " :span="2" label-class-name="total-label" class-name="total-content" >
              <strong class="strong-font">{{ formatTwo(shiftForm.currentCashAmount) + ' €' }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="备注描述: ">
              <el-input v-model="shiftForm.remark" placeholder="请输入备注" type="textarea" :maxlength="50" show-word-limit
                :rows="2" />
            </el-descriptions-item>
          </el-descriptions>
          <el-row class="shift-dialog">
            <el-button type="primary"  @click="handlerDoShift">{{  shiftForm.shiftId ? '完成交班' : '开始值班'}}</el-button>
            <el-button type="success"  @click="handlerCloseDialog" v-if="shiftForm.shiftId">继续值班</el-button>
            <el-button type="danger"  @click="handlerCloseTab" v-if="!shiftForm.shiftId">退出值班</el-button>
          </el-row>
          
        </el-tab-pane>

        <el-tab-pane label="现金盘点" name="second">
          <el-descriptions class="margin-top" :column="4" size="small" border label-width="110px">
            <el-descriptions-item label="上次交班余额" :span="2" align="center" label-class-name="total-label" class-name="total-content" >
              <strong class="strong-font">{{formatTwo(shiftForm.lastShiftCashAmount) + ' €' }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="本次交班余额" :span="2" align="center" label-class-name="total-label" class-name="total-content" >
              <strong class="strong-font">{{formatTwo(shiftForm.currentCashAmount) + ' €' }}</strong>
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions class="margin-top" direction="vertical" :column="4" size="small" border label-width="100px">
            <el-descriptions-item label="0.01€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue1" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="0.02€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue2" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="0.05€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue5" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="合计金额" align="center" >
              {{ ((shiftForm.cashValue1 * 1 + shiftForm.cashValue2 * 2 + shiftForm.cashValue5 * 5) * 0.01).toFixed(2) }}
              €
            </el-descriptions-item>

            <el-descriptions-item label="0.1€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue10" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="0.2€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue20" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="0.5€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue50" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="合计金额" align="center">
              {{ ((shiftForm.cashValue10 + shiftForm.cashValue20 * 2 + shiftForm.cashValue50 * 5) * 0.1).toFixed(2) }} €
            </el-descriptions-item>

            <el-descriptions-item label="1€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue100" :min="0" :value-on-clear="0" :precision="0" v-focusSelect  style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="2€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue200" :min="0" :value-on-clear="0" :precision="0" v-focusSelect  style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="5€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue500" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="合计金额" align="center">
              {{ ((shiftForm.cashValue100 + shiftForm.cashValue200 * 2 + shiftForm.cashValue500 * 5) * 1).toFixed(2) }}
              €
            </el-descriptions-item>

            <el-descriptions-item label="10€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue1000" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="20€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue2000" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="50€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue5000" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="合计金额" align="center">
              {{ ((shiftForm.cashValue1000 + shiftForm.cashValue2000 * 2 + shiftForm.cashValue5000 * 5) * 10).toFixed(2)
              }} €
            </el-descriptions-item>

            <el-descriptions-item label="100€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue10000" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="200€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue20000" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="500€  数量" align="center" class-name="input-content" >
              <el-input-number v-model.number="shiftForm.cashValue50000" :min="0" :value-on-clear="0" :precision="0" v-focusSelect style="width: 135px;"/>
            </el-descriptions-item>
            <el-descriptions-item label="合计金额" align="center">
              {{ ((shiftForm.cashValue10000 + shiftForm.cashValue20000 * 2 + shiftForm.cashValue50000 * 5) *
              100).toFixed(2) }} €
            </el-descriptions-item>
            <el-descriptions-item label="盘点总金额" :span="4" align="center" label-class-name="total-label" class-name="total-content" >
              <strong class="strong-font">{{formatTwo(shiftForm.totalCashCompute) + ' €' }}</strong>
            </el-descriptions-item>
          </el-descriptions>
          <el-row class="shift-dialog">
            <el-button type="primary"  @click="handlerDoShift">{{ shiftForm.shiftId ? '完成交班' : '开始值班'}}</el-button>
            <el-button type="success"  @click="handlerCloseDialog" v-if="shiftForm.shiftId">继续值班</el-button>
            <el-button type="danger"  @click="handlerCloseTab" v-if="!shiftForm.shiftId">退出值班</el-button>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>



</template>

<script setup name="cashOperation">
import { ref, onMounted, watch } from 'vue';
import TouchKeyboard from '@/components/TouchKeyboard/index.vue';
import {initOrderData, initOrderDetailData, CajaStatusEnum, ShiftStatusEnum} from './cashOperationEnum.js';
import CustomerSelect from '@/components/Common/CustomerSelect.vue';
import SalesmanSelect from '@/components/Common/SalesmanSelect.vue';
import SalesActivitySelect from '@/components/Common/SalesActivitySelect.vue';
import SkuSelect from '@/components/Common/SkuSelect.vue';
import EditableTable from './EditableTable.vue';
import {playKeyHappySound} from '@/utils/playKeySound.js';
import { getDeviceFingerprint } from "@/utils/fingerprintJS";
import { getSalesCajaByMacAddress } from "@/api/sales/salesCaja";
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { getShiftRecordsIsActive, getLastShiftRecords, addSalesShiftRecords, continueSalesShiftRecords, getSalesShiftRecords, finishSalesShiftRecords } from '@/api/sales/SalesShiftRecords';
import useUserStore from "@/store/modules/user";
import {UserTypeEnum} from "@/views/system/tenant/tenantConstants.js";
import { size } from 'lodash';


const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_is_hold, sales_order_in_tax, sales_order_direction, sales_order_detail_type, sales_order_type, sales_order_status, erp_product_sku_type, sales_order_pay_status } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_in_tax', 'sales_order_direction', 'sales_order_detail_type', 'sales_order_type', 'sales_order_status', 'erp_product_sku_type', 'sales_order_pay_status');
// 获取当前用户信息
const userStore = useUserStore();


// -------------- 5 交班业务 start  ---------------------

const dialogVisible = ref(false) // 交班窗口
const activeTab = ref('first')  // 交班默认tab窗口

/** 交班业务  */
const checkSalesShiftRecords = () => {
  shiftForm.value.cajaId = currentCaja.value.cajaId;
  shiftForm.value.cajaName = currentCaja.value.cajaName;
  shiftForm.value.userId = userStore.id;
  shiftForm.value.userName = userStore.name;
  // 1 获取当前交班信息 状态为进行中 的交班信息 
  getShiftRecordsIsActive(currentCaja.value.cajaId).then(response => {
    // 1.1 存在进行中的交班
    if (response.rows.length > 0) {
      shiftForm.value = response.rows[0];
      console.log("获取当前交班信息：",shiftForm.value);
      // 1.1.1 判断收银员是否是同一人(租户管理员可以)
      if (shiftForm.value.userId != userStore.id && userStore.userType == UserTypeEnum.NORMAL) {
        proxy.$tab.closePage();
        ElMessageBox.confirm('存在不是你本人的未交班记录，值班之前需要先完成上一次交班！', '警告提示', {
          confirmButtonText: 'OK',
          showCancelButton: false,
          type: 'error',
        }).then(() => {
          proxy.$tab.closePage(); // 关闭当前页签
        }).catch(() => {
          proxy.$tab.closePage(); // 关闭当前页签
        });
        return;
      }

      // 1.1.2 获取上一次的交班记录
      getLastTimeShiftRecords();
      
      // 1.1.3 弹出交班界面 -> 继续值班/交班/退出交班
      handlerOpenDialog()

    } else {
      // 1.2 弹出交班界面 -> 开始值班
      getLastTimeShiftRecords();  // 获取上一次的交班记录
      handlerOpenDialog()
    }
  }).catch(()=>{
    console.error("获取交班信息异常, 请联系管理员！")
  });
};

/** 获取上一次值班记录 */
const getLastTimeShiftRecords = () => {
  getLastShiftRecords(currentCaja.value.cajaId).then((response) => {
    console.log("获取上一次值班记录：",response);
    if(!response){
      console.log("首次值班，没有之前的值班记录！")
      return;
    }
    shiftForm.value.lastShiftId = response.shiftId;
    shiftForm.value.lastShiftNo = response.shiftNo;
    shiftForm.value.lastShiftCashAmount = response.currentCashAmount;
    // shiftForm.value.cashValue1 = response.cashValue1;
    // shiftForm.value.cashValue2 = response.cashValue2;
    // shiftForm.value.cashValue5 = response.cashValue5;
    // shiftForm.value.cashValue10 = response.cashValue10;
    // shiftForm.value.cashValue20 = response.cashValue20;
    // shiftForm.value.cashValue50 = response.cashValue50;
    // shiftForm.value.cashValue100 = response.cashValue100;
    // shiftForm.value.cashValue200 = response.cashValue200;
    // shiftForm.value.cashValue500 = response.cashValue500;
    // shiftForm.value.cashValue1000 = response.cashValue1000;
    // shiftForm.value.cashValue2000 = response.cashValue2000;
    // shiftForm.value.cashValue5000 = response.cashValue5000;

  }).catch((error) => {
    console.error("获取上一次值班记录失败：", error);
  });

}

// 开始值班/完成交班
const handlerDoShift = () => {
  if(shiftForm.value.shiftId){
    // 完成交班
    ElMessageBox.confirm('你确定结束交班吗?','WARNING:',{type:'warning',appendTo:cashierContainer.value}).then(() => {
      // 核对 盘点金额 = 与本次交班现金余额
      if(shiftForm.value.totalCashCompute !== shiftForm.value.totalCashCompute){
        proxy.$modal.msgError('盘点金额与交班现金余额不一致，请重新盘点金额！');
        return;
      }else{
        finishSalesShiftRecords(shiftForm.value).then(() => {
          // 交班成功 关闭收银窗口
          proxy.$modal.msgSuccess('交班成功')
          proxy.$tab.closePage()
        }).catch(err => {
          proxy.$modal.msgError("交班失败：",err.message);
        })
      }
    }).catch(() => {
      proxy.$modal.msgSuccess("取消借宿交班成功！");
      dialogVisible.value = true;  // 不允许退出交班界面
      return;
    })

  } else {
    // 开始值班
    ElMessageBox.confirm('你确定开始值班吗?','WARNING:',{type:'warning',appendTo:cashierContainer.value}).then(() => {
      // 核对 盘点金额 = 上一次交班的现金余额
      if(shiftForm.value.totalCashCompute != shiftForm.value.lastShiftCashAmount){
        proxy.$modal.msgError('盘点金额 '+ shiftForm.value.totalCashCompute + ' 与 上一次交班现金余额 '+ shiftForm.value.lastShiftCashAmount + ' 不一致，请重新盘点金额');
        return;
      } 
      // 新增值班信息
      addSalesShiftRecords(shiftForm.value).then(res => {
        // 更新ID和编号
        shiftForm.value = res.data;
        proxy.$modal.msgSuccess('值班成功');
        //关闭交班界面
        dialogVisible.value = false;
        return;
      }).catch(err => {
        proxy.$modal.msgError("开始值班失败：",err.message);
        console.log("开始值班失败：",err);
        dialogVisible.value = true; // 不允许退出交班界面
        return;
      })
    }).catch(() => {
      proxy.$modal.msgSuccess("取消开始值班成功！");
      dialogVisible.value = true;  // 不允许退出交班界面
      return;
    });
  };
}

/** 继续值班 */
const handlerCloseDialog = () => {
  // TODO:更新 补充现金/上交现金/长短款/盘点数据
  continueSalesShiftRecords(shiftForm.value).then(res => {
    dialogVisible.value = false;
    activeTab.value = 'first';
  }).catch(err => {
    proxy.$modal.msgError("继续值班失败：",err.message);
  })
  
}

/** 退出值班 */
const handlerCloseTab = () => {
  proxy.$tab.closePage(); // 关闭收银台窗口
}

/** 弹出交班界面 */
const handlerOpenDialog = () => {
  activeTab.value = 'first';
  dialogVisible.value = true;
}

const shiftForm = ref({
  shiftId: null,
  shiftNo: null,
  shiftStatus: null,
  cajaId: null,
  cajaName: null,
  userId: null,
  userName: null,
  lastShiftId: null,
  lastShiftNo: null,
  lastShiftCashAmount: 0,
  shiftStartTime: null,
  shiftEndTime: null,
  totalSalesAmount: 0,
  totalCash: 0,
  totalBank: 0,
  totalChange: 0,
  totalZero: 0,
  totalRefundCash: 0,
  totalRefundBank: 0,
  currentExpectedCash: 0,
  currentReplenishCash: 0,
  currentDepositCash: 0,
  currentBalanceDifference: 0,
  currentCashAmount: 0,
  cashValue50000: 0,
  cashValue20000: 0,
  cashValue10000: 0,
  cashValue5000: 0,
  cashValue2000: 0,
  cashValue1000: 0,
  cashValue500: 0,
  cashValue200: 0,
  cashValue100: 0,
  cashValue50: 0,
  cashValue20: 0,
  cashValue10: 0,
  cashValue5: 0,
  cashValue2: 0,
  cashValue1: 0,
  totalCashCompute: 0,
  remark: null,
  delFlag: null,
});

/** 计算 现金盘点总金额 */
const totalCashCompute = computed(() => {
  return (
    (shiftForm.value.cashValue1 + shiftForm.value.cashValue2 * 2 + shiftForm.value.cashValue5 * 5) * 0.01 +
    (shiftForm.value.cashValue10 + shiftForm.value.cashValue20 * 2 + shiftForm.value.cashValue50 * 5) * 0.1 +
    (shiftForm.value.cashValue100 + shiftForm.value.cashValue200 * 2 + shiftForm.value.cashValue500 * 5) * 1 +
    (shiftForm.value.cashValue1000 + shiftForm.value.cashValue2000 * 2 + shiftForm.value.cashValue5000 * 5) * 10 +
    (shiftForm.value.cashValue10000 + shiftForm.value.cashValue20000 * 2 + shiftForm.value.cashValue50000 * 5) * 100
  ).toFixed(2);
});

// 监听 totalCashCompute 的变化，并赋值给 shiftForm.totalCashCompute
watch(totalCashCompute, (newValue) => {
  shiftForm.value.totalCashCompute = newValue;
});

/** 计算交班现金余额 */
const currentCashAmount = computed(() => {
  return (
    shiftForm.value.currentExpectedCash +
    shiftForm.value.currentReplenishCash +
    shiftForm.value.currentDepositCash +
    shiftForm.value.currentBalanceDifference
  ).toFixed(2);
});

watch(currentCashAmount, (newValue) => {
  shiftForm.value.currentCashAmount = newValue;
});

/** 计算现金总收入 */
const totalCash = computed(() => {
  return (
    shiftForm.value.totalCash +
    shiftForm.value.totalRefundCash +
    shiftForm.value.totalChange
  ).toFixed(2);
});

/** 计算银行总收入 */
const totalBank = computed(() => {
  return (
    shiftForm.value.totalBank +
    shiftForm.value.totalRefundBank
  ).toFixed(2);
});
// ----------------- 5 交班业务 end  -------------------------

// ------------------ 4 caja注册检查 start  -------------------
// 当前的caja
const currentCaja = ref(null);
/** 检查当前caja是否注册 状态是否启用 */
const checkCajaRegister = async () => {
  try {
    // 1 获取设备指纹
    const fingerprint = await getDeviceFingerprint();
    // 2 获取收银台信息
    const { data: cajaInfo } = await getSalesCajaByMacAddress(fingerprint);
    // 3 判断是否注册
    if (!cajaInfo) {
      handleCajaNoRegister();
      return;
    }

    // 更新当前收银台信息
    currentCaja.value = cajaInfo;
    console.log('当前收银台信息:', cajaInfo);

    // 4 检查收银台状态
    if (cajaInfo.cajaStatus === CajaStatusEnum.ENABLE) {
      // 收银台正常 -> 后续交班业务
      checkSalesShiftRecords();
      ElMessage.success('当前收银台正常');
    } else {
      handleCajaNoRegister(cajaInfo);
    }

  } catch (error) {
    ElMessage.error('后台获取收银台信息失败: ' + error.message);
    handleCajaNoRegister();
  }
};

const handleCajaNoRegister = () => {
  try {
    let messageStr = ''
    if(currentCaja.value){
      messageStr = '当前收银台已被禁用, 禁止访问收银界面，请联系管理员！'
    } else {
      messageStr = '当前收银台未注册, 禁止访问收银界面，请联系管理员！'
    }
    ElMessageBox.confirm(messageStr, '警告提示', {
      confirmButtonText: 'OK',
      showCancelButton: false,
      type: 'error',
    }).then(() => {
      proxy.$tab.closePage(); // 关闭当前页签
    }).catch(() => {
      proxy.$tab.closePage(); // 关闭当前页签
    });
  } catch (error) {
    proxy.$tab.closePage(); // 关闭当前页签
  }  
}

onMounted(() => {
  checkCajaRegister();
});

// ----------------- 4 caja注册检查 end  -------------------------



// -----------------  3 全屏锁屏 start     -------------------------
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
// -----------------  3 全屏锁屏 end     -------------------------


// ------------------ 2 侧边栏按钮区域 start  -------------------
const actions = [
  { label: "全屏", action: "toggleFullScreen" },
  { label: "交班", action: "shift" },
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
      playKeyHappySound()
      toggleFullScreen();
      break;
    case "shift":
      playKeyHappySound()
      getSalesShiftRecords(shiftForm.value.shiftId).then((response) => {
        if(response.data.isActive){
          // 更新交班记录
          shiftForm.value = response.data;
        } 
      });
      // 弹出交班对话框
      handlerOpenDialog()
      break;
    case "holdOrder":
      console.log("挂单");
      playKeyHappySound()
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


// ----------------- 2 侧边栏按钮区域 end  -------------------

// ***************** 1 键盘 + 表格 + 商品查询 组件处理 start *****************

// 组件加载完成后自动聚焦到商品输入框
onMounted(() => {
  nextTick(() => {
    if (skuSelectRef.value) {
      skuSelectRef.value.focus(); // 调用 SkuSelect 组件的 focus 方法
    }
  });
});

// 监听全局焦点事件
onMounted(() => {
  document.addEventListener('focus', handleFocus, true); // 捕获阶段监听
});

// 处理焦点事件
const handleFocus = (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    keyboardRef.value?.setActiveInput(event.target); // 将聚焦的输入框传递给键盘组件
    // 将 skuSelectRef 传递给键盘组件
    if (keyboardRef.value) {
      keyboardRef.value.setSkuSelectRef(skuSelectRef.value);
    }
  }
};

const keyboardRef = ref(null);  // 键盘组件实例
const skuSelectRef = ref(null); // skuSelect组件实例
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
  console.log('收银台获取的客户数据:', data)
  currentCustomer.value = data || null;
}

/** 获取选中的客户数据 */
const selectedSalesmanData = (data) => {
  console.log('收银台获取的业务员数据:', data)
  currentSalesman.value = data || null;
}

/** 获取选中的业务活动数据 */
const selectedSalesActivityData = (data) => {
  console.log('收银台获取的业务活动数据:', data)
  currentSalesActivity.value = data || null;
}

/** 获取选中的商品数据 */
const selectedSkuData = (data) => {
  console.log('收银台获取的商品数据:', data)
  currentSku.value = data || null;
  if (currentSku.value) {
    handleAddSalesOrderDetail(currentSku.value)
  }

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
function handleAddSalesOrderDetail(sku) {
  const obj = initOrderDetailData();
  obj.detailId = null
  obj.detailMainSkuId = null
  obj.skuId = sku.skuId
  obj.skuCode = sku.skuCode
  obj.skuImage = sku.skuImage
  obj.skuName = sku.skuName
  obj.assistName = sku.assistName
  obj.skuType = sku.skuType
  obj.skuValue = sku.skuValue
  obj.batchId = sku.batchId
  obj.skuUnit = sku.unitVo?.unitCode
  obj.detailPrice = sku.skuPrice
  obj.detailQuantity = 1
  obj.detailAmount = sku.skuPrice * 1
  obj.detailDiscountRate = 0
  obj.detailDiscountAmount = 0
  obj.detailSalesAmount = sku.skuPrice * 1
  obj.detailBaseAmount = sku.skuPrice * 1
  obj.detailTaxRate = sku.productRateVo?.rateValue
  obj.detailTaxAmount = sku.skuPrice * 1 * sku.productRateVo?.rateValue
  obj.detailNetAmount = sku.skuPrice * 1 * (1 + sku.productRateVo?.rateValue)
  form.value.salesOrderDetailList.push(obj)
}

// ***************** 1 键盘 + 表格 + 商品查询 组件处理 end *****************

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

.shift-dialog{
  width: 100%;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.strong-font{
  font-size: 16px;
}

:deep(.negative-input) input {
  color: red; /* 负数字体颜色 */
}

:deep(.total-label) {
  background: var(--el-color-info-light-5) !important;
}
:deep(.total-content) {
  background: var(--el-color-info-light-9);
}

:deep(.input-label) {
  background: var(--el-color-success-light-5) !important;
}
:deep(.input-content) {
  background: var(--el-color-success-light-9);
}



</style>