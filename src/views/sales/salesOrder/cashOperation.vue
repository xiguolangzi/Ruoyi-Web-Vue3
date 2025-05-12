<template>
  <div ref="cashierContainer" class="app-container">
    <!-- 收银台的具体内容 -->
    <el-container class="cash-container">
      <!-- 左侧区域 -->
      <el-container class="left-container">

        <!-- 上部分：流水展示 -->
        <el-main class="main-data-container">
          <EditableTable ref="editableTableRef" :tableData="form.salesOrderDetailList" :editPrice="canEditPrice"
            :editDiscountRate="canEditDiscountRate" @handleClickChangeImage="changeCurrentSkuData"
            @deleteRow="handleDeleteRow" @addLog="handleUpdateDetailAddLog" />
        </el-main>

        <!-- 下部分：商品输入框和汇总信息 -->
        <el-footer class="footer-data-container">
          <el-card class="footer-card">
            <el-row class="footer-row">
              <!-- 第1个区域：商品搜索和图片展示 -->
              <el-col class="footer-col" :style="{ width: '190px', flex: 'none' }">
                <div class="footer-col-content">
                  <SkuSelect ref="skuSelectRef" @selectedData="selectedSkuData" />
                  <div class="sku-image-container">
                    <ImageNormal v-if="currentSku" :src="currentSku.skuImage" />
                    <el-empty v-else :image-size="80" style="padding: 0px;margin: 0px;" />
                  </div>
                </div>
              </el-col>
              
              <!-- 第2个区域：订单配置数据 -->
              <el-col class="footer-col" style="flex: 1;">
                <div class="footer-col-content">
                  <div class="section-title">
                    <span>订单设置：</span>
                    <div>
                      <el-badge :value="10" :max="99" :show-zero="false" style="margin-left: 20px;">
                        <el-button type="primary" size="small">挂单</el-button>
                      </el-badge>
                    </div>

                  </div>
                  <el-descriptions :column="2" size="small" style="width: 100%;">
                    <el-descriptions-item label="客户名称:" :span="2">
                      <span class="highlight-text">{{form.customerName || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="税号:" :min-width="100">
                      <span class="highlight-text">{{form.invoiceTax || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="手机:" :min-width="100">
                      <span class="highlight-text">{{form.invoicePhone || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="地址:" :span="2">
                      <span class="highlight-text">{{form.invoiceAddress || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="仓库:">
                      <span class="highlight-text">{{form.warehouseName || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="业务员:">
                      <span class="highlight-text">{{form.salesmanName || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="业务活动:">
                      <span class="highlight-text">{{form.activityName || '--'}}</span>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-col>

              <!-- 第3个区域：订单统计数据 -->
              <el-col class="footer-col" style="flex: 1;">
                <div class="footer-col-content">
                  <!-- 订单状态+订单号 -->
                  <div class="section-title">
                    <span> {{ form.orderDirection == OrderDirectionEnum.SALES ? "销售订单：" : "退货订单: " }} </span>
                    <span style="font-size: 12px; margin-right: 10px; color: #409eff;">{{ form.orderInitNo }}</span>
                  </div>
                  <el-descriptions :column="2" size="small" style="margin-top: 10px;">
                    <el-descriptions-item label="销售金额:">
                      <span class="highlight-text">{{ formatTwo(form.totalAmount) + ' €'}} </span>
                    </el-descriptions-item>
                    <el-descriptions-item label="折扣金额:">
                      <span class="highlight-text">{{ formatTwo(form.totalDiscountAmount) + ' €' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="活动减免:">
                      <span class="highlight-text">{{ formatTwo(form.totalPromotionReduceAmount) + ' €' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="减免数量:">
                      <span class="highlight-text">{{ form.totalPromotionReduceQuantity ?? 0}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="基础金额:">
                      <span class="highlight-text">{{ formatTwo(form.totalBaseAmount) + ' €'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="交税金额:" :span="2">
                      <span class="highlight-text">{{ formatTwo(form.totalTaxAmount) + ' €'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="应收金额:" :span="2" class-name="total-label2"
                      label-class-name="total-content2">
                      <span>{{ formatTwo(form.totalNetAmount) + ' €'}}</span>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-footer>

      </el-container>

      <!-- 右侧区域 -->
      <el-aside class="right-container" width="300px">
        <el-tabs type="border-card" class="full-height-tabs">
          <el-tab-pane label="工具">
            <div class="tool-keyboard">
              <TouchKeyboard ref="keyboardRef" v-if="cajaShowKeyboard == cajaShowKeyboardEnum.SHOW" />
            </div>
            <el-divider v-if="cajaShowKeyboard == cajaShowKeyboardEnum.SHOW" />
            <div class="tool-button">
              <el-button v-for="(action, index) in actions" :key="index" size="small" type="primary" plain
                class="action-button" @click="handleAction(action)">
                <span class="button-content">
                  <span class="label">{{ action.label }}</span>
                  <span class="key-down">{{ action.keyDown }}</span>
                </span>
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="订单设置">
            <div>
              <div class="left-row">
                <!-- 业务员 -->
                <el-divider content-position="left"> <span>订单绑定业务员</span> </el-divider>
                <el-form-item label=" 业务员:" >
                  <SalesmanSelect v-model="form.salesmanName"  @selectedData="selectedSalesmanData" />
                </el-form-item>
                <!-- 客户信息 -->
                <el-divider content-position="left"> <span>客户信息</span> </el-divider>
                <el-form-item label="客户信息:" >
                  <CustomerSelect v-model="form.customerName"  @selectedData="selectedCustomerData" />
                </el-form-item>
                <!-- 仓库信息 -->
                <el-divider content-position="left"> <span>仓库信息</span> </el-divider>
                <el-form-item label="仓库信息:" >
                  <WarehouseSelect v-model="form.warehouseName"  @selectedData="selectedWarehouseData" />
                </el-form-item>
                <!-- 业务活动信息 -->
                <el-divider content-position="left"> <span>业务活动</span> </el-divider>
                <el-form-item label="业务活动:" >
                  <SalesActivitySelect v-model="form.activityName" @selectedData="selectedSalesActivityData" />
                </el-form-item>
                <el-divider content-position="left"> <span>促销活动查询</span> </el-divider>
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

    <!-- 交班信息 对话框 -->
    <el-dialog v-model="dialogVisible" title="交班信息" width="600" style="margin-top: 100px !important;"
      :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
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
            <el-descriptions-item label="交易总收入: " :span="2" label-class-name="total-label" class-name="total-content">
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
            <el-descriptions-item label="现金找零: ">
              <span :style="{ color: shiftForm.totalChange < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(shiftForm.totalChange) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="银行总收入: " label-class-name="total-label" class-name="total-content">
              <span :style="{ color: totalBank < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(totalBank) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="现金总收入: " label-class-name="total-label" class-name="total-content">
              <span :style="{ color: totalCash < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(totalCash) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="未收欠款: " label-class-name="total-label" class-name="total-content">
              <span :style="{ color: shiftForm.totalRemainAmount < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(shiftForm.totalRemainAmount) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="优惠抹零: " :span="2">
              <span :style="{ color: shiftForm.totalZero < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(shiftForm.totalZero) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="应交现金: " :span="2" label-class-name="total-label" class-name="total-content">
              <strong class="strong-font">{{ formatTwo(shiftForm.currentExpectedCash) + ' €' }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="补充现金: " :span="2" label-class-name="input-label" class-name="input-content">
              <el-input-number v-model.number="shiftForm.currentReplenishCash" placeholder="请输入补充金额" :value-on-clear="0"
                :precision="2" :min="0" :max="99999" v-focusSelect style="width: 100%;" :disabled="!shiftForm.shiftId"
                :class="shiftForm.currentReplenishCash < 0 ? 'negative-input' : ''">
                <template #suffix>€</template>
              </el-input-number>
            </el-descriptions-item>
            <el-descriptions-item label="上交现金: " :span="2" label-class-name="input-label" class-name="input-content">
              <el-input-number v-model.number="shiftForm.currentDepositCash" placeholder="请输入上交金额" :value-on-clear="0"
                :precision="2" :min="-9999" :max="0" v-focusSelect style="width: 100%;" :disabled="!shiftForm.shiftId"
                :class="shiftForm.currentDepositCash < 0 ? 'negative-input' : ''">
                <template #suffix>€</template>
              </el-input-number>
            </el-descriptions-item>
            <el-descriptions-item label="长/短款: " :span="2" label-class-name="input-label" class-name="input-content">
              <el-input-number v-model.number="shiftForm.currentBalanceDifference" placeholder="请输入长短款金额"
                :value-on-clear="0" :precision="2" :min="-999" :max="999" v-focusSelect style="width: 100%;"
                :disabled="!shiftForm.shiftId" :class="shiftForm.currentBalanceDifference < 0 ? 'negative-input' : ''">
                <template #suffix>€</template>
              </el-input-number>
            </el-descriptions-item>
            <el-descriptions-item label="交班现金余额: " :span="2" label-class-name="total-label" class-name="total-content">
              <strong class="strong-font">{{ formatTwo(shiftForm.currentCashAmount) + ' €' }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="备注描述: ">
              <el-input v-model="shiftForm.remark" placeholder="请输入备注" type="textarea" :maxlength="50" show-word-limit
                :rows="2" />
            </el-descriptions-item>
          </el-descriptions>
          <el-row class="shift-dialog">
            <el-button type="primary" @click="handlerDoShift">{{ shiftForm.shiftId ? '完成交班' : '开始值班'}}</el-button>
            <el-button type="success" @click="handlerCloseDialog" v-if="shiftForm.shiftId">继续值班</el-button>
            <el-button type="danger" @click="handlerCloseTab">退出值班</el-button>
          </el-row>

        </el-tab-pane>

        <el-tab-pane label="现金盘点" name="second">
          <el-descriptions class="margin-top" :column="4" size="small" border label-width="110px">
            <el-descriptions-item label="上次交班余额" :span="2" align="center" label-class-name="total-label"
              class-name="total-content">
              <strong class="strong-font">{{formatTwo(shiftForm.lastShiftCashAmount) + ' €' }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="本次交班余额" :span="2" align="center" label-class-name="total-label"
              class-name="total-content">
              <strong class="strong-font">{{formatTwo(shiftForm.currentCashAmount) + ' €' }}</strong>
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions class="margin-top" direction="vertical" :column="4" size="small" border label-width="100px">
            <el-descriptions-item label="0.01€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue1" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="0.02€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue2" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="0.05€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue5" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="合计金额" align="center">
              {{ ((shiftForm.cashValue1 * 1 + shiftForm.cashValue2 * 2 + shiftForm.cashValue5 * 5) * 0.01).toFixed(2) }}
              €
            </el-descriptions-item>

            <el-descriptions-item label="0.1€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue10" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="0.2€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue20" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="0.5€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue50" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="合计金额" align="center">
              {{ ((shiftForm.cashValue10 + shiftForm.cashValue20 * 2 + shiftForm.cashValue50 * 5) * 0.1).toFixed(2) }} €
            </el-descriptions-item>

            <el-descriptions-item label="1€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue100" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="2€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue200" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="5€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue500" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="合计金额" align="center">
              {{ ((shiftForm.cashValue100 + shiftForm.cashValue200 * 2 + shiftForm.cashValue500 * 5) * 1).toFixed(2) }}
              €
            </el-descriptions-item>

            <el-descriptions-item label="10€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue1000" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="20€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue2000" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="50€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue5000" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="合计金额" align="center">
              {{ ((shiftForm.cashValue1000 + shiftForm.cashValue2000 * 2 + shiftForm.cashValue5000 * 5) * 10).toFixed(2)
              }} €
            </el-descriptions-item>

            <el-descriptions-item label="100€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue10000" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="200€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue20000" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="500€  数量" align="center" class-name="input-content">
              <el-input-number v-model.number="shiftForm.cashValue50000" :min="0" :value-on-clear="0" :precision="0"
                v-focusSelect style="width: 135px;" />
            </el-descriptions-item>
            <el-descriptions-item label="合计金额" align="center">
              {{ ((shiftForm.cashValue10000 + shiftForm.cashValue20000 * 2 + shiftForm.cashValue50000 * 5) *
              100).toFixed(2) }} €
            </el-descriptions-item>
            <el-descriptions-item label="盘点总金额" :span="4" align="center" label-class-name="total-label"
              class-name="total-content">
              <strong class="strong-font">{{formatTwo(shiftForm.totalCashCompute) + ' €' }}</strong>
            </el-descriptions-item>
          </el-descriptions>
          <el-row class="shift-dialog">
            <el-button type="primary" @click="handlerDoShift">{{ shiftForm.shiftId ? '完成交班' : '开始值班'}}</el-button>
            <el-button type="success" @click="handlerCloseDialog" v-if="shiftForm.shiftId">继续值班</el-button>
            <el-button type="danger" @click="handlerCloseTab">退出值班</el-button>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>


    <!-- 套餐确认 对话框 -->
    <ComboConfirmDialog ref="comboDialog" @add-combo-details="handleAddComboDetails" :notification-container="cashierContainer" />

    <!-- 收款确认 对话框 -->
    <PaymentDialog ref="paymentDialog" :orderData="form" :paymentAutoPrint="paymentAutoPrint"
      :canRemainAmount="canRemainAmount" @paymentComplete="handlePaymentComplete" :notification-container="cashierContainer"/>

    <!-- 通用认证对话框 -->
    <AuthManagerDialog ref="authManager" :notification-container="cashierContainer" />

  </div>



</template>

<script setup name="cashOperation">
import { ref, onMounted, onUnmounted, watch, toRaw } from 'vue';
import TouchKeyboard from '@/components/TouchKeyboard/index.vue';
import { initOrderDetailData, CajaStatusEnum, ShiftStatusEnum, OrderDirectionEnum, orderSourceEnum, OrderTypeEnum, OrderStatusEnum, OrderIsHoldEnum, OrderPayStatusEnum } from './cashOperationUtil/cashOperationEnum.js';
import CustomerSelect from '@/components/Common/CustomerSelect.vue';
import SalesmanSelect from '@/components/Common/SalesmanSelect.vue';
import SalesActivitySelect from '@/components/Common/SalesActivitySelect.vue';
import WarehouseSelect from '@/components/Common/WarehouseSelect.vue';
import SkuSelect from '@/components/Common/SkuSelect.vue';
import EditableTable from './cashOperationUtil/EditableTable.vue';
import {playKeyHappySound} from '@/utils/playKeySound.js';
import { getDeviceFingerprint } from "@/utils/fingerprintJS";
import { getSalesCajaByMacAddress } from "@/api/sales/salesCaja";
import { ElMessageBox, ElNotification } from 'element-plus';
import { getShiftRecordsIsActive, getLastShiftRecords, addSalesShiftRecords, continueSalesShiftRecords, getSalesShiftRecords, finishSalesShiftRecords } from '@/api/sales/SalesShiftRecords';
import useUserStore from "@/store/modules/user";
import {UserTypeEnum} from "@/views/system/tenant/tenantConstants.js";
import { cloneDeep } from 'lodash';
import ImageNormal from '@/components/ImageNormal/index.vue';
import { addSalesOrder, updateSalesOrder } from "@/api/sales/salesOrder";
import SnowflakeID from '@/utils/SnowflakeID.js';
import IndexedDBUtil from '@/indexedDB/index.js';
import ComboConfirmDialog from './cashOperationUtil/ComboConfirmDialog.vue';
import PaymentDialog from './cashOperationUtil/PaymentDialog.vue';
import {canEditPriceEnum, canEditDiscountRateEnum, paymentAutoPrintEnum, canRemainAmountEnum, canDeleteOrderDetailEnum, cajaShowKeyboardEnum} from './cashOperationUtil/tenantConfigEnum.js';
import { addSalesOrderLog } from "@/api/sales/salesOrderLog";
import AuthManagerDialog from '@/components/AuthManagerDialog/index.vue';
import { OperateLogTypeEnum } from './cashOperationUtil/operateLogTypeEnum.js';


import { useRouter, useRoute } from "vue-router";
const router = useRouter();

const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_is_hold, sales_order_in_tax, sales_order_direction, sales_order_detail_type, sales_order_type, sales_order_status, erp_product_sku_type } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_in_tax', 'sales_order_direction', 'sales_order_detail_type', 'sales_order_type', 'sales_order_status', 'erp_product_sku_type');

const userStore = useUserStore(); // 获取当前用户信息
const dialogVisible = ref(false) // 交班窗口
const activeTab = ref('first')  // 交班默认tab窗口
const keyboardRef = ref(null);  // 键盘组件实例
const skuSelectRef = ref(null); // skuSelect组件实例
const editableTableRef = ref(null); // 表格组件实例
const currentSku = ref(null)
const currentWarehouse = ref(null);
const canEditPrice = ref(canEditPriceEnum.NOT_ALLOW);  // 表格子组件编辑单价disable控制
const canEditDiscountRate = ref(canEditDiscountRateEnum.NOT_ALLOW); // 表格子组件编辑折扣disable控制
const paymentAutoPrint = ref(paymentAutoPrintEnum.OPEN);  // 是否开启完成支付自动打印
const canRemainAmount = ref(canRemainAmountEnum.OPEN); // 是否开启欠款支付
const canDeleteOrderDetail = ref(canDeleteOrderDetailEnum.OPEN);  // 是否开启删除订单行
const cajaShowKeyboard = ref(cajaShowKeyboardEnum.SHOW); // 是否展示触摸键盘配置

/** 跳转退货界面*/
const openReturnView = () => {
  // 跳转
  router.push({ path: "/cashier/refundedOperation" })
}

const DB_NAME = "OrderDB";    // 本地缓存数据库
const STORE_NAME_ORDER = "order"; // 本地缓存表明

// **************** 获取配置 end *******************
/** 获取租户配置 */
const getTenantConfig = async () => {
  const config = await proxy.getTenantConfig("editPrice");
  canEditPrice.value = config?.configValue || canEditPriceEnum.NOT_ALLOW;
  const config2 = await proxy.getTenantConfig("editDiscountRate");
  canEditDiscountRate.value = config2?.configValue || canEditDiscountRateEnum.NOT_ALLOW;
  const config3 = await proxy.getTenantConfig("paymentAutoPrint");
  paymentAutoPrint.value = config3?.configValue || paymentAutoPrintEnum.OPEN;
  const config4 = await proxy.getTenantConfig("canRemainAmount");
  canRemainAmount.value = config4?.configValue || canRemainAmountEnum.OPEN;
  const config5 = await proxy.getTenantConfig("canDeleteOrderDetail");
  canDeleteOrderDetail.value = config5?.configValue || canDeleteOrderDetailEnum.OPEN;
  const config6 = await proxy.getTenantConfig("cajaShowKeyboard");
  cajaShowKeyboard.value = config6.configValue || cajaShowKeyboardEnum.SHOW;
}
getTenantConfig()


// --------------****************************
// 引用认证组件
const authManager = ref(null);

// 表格组件 - 处理删除行（管理员认证）
const handleDeleteRow = (index, row) => {
  if (canDeleteOrderDetail.value === canDeleteOrderDetailEnum.OPEN) {
    handleDeleteRowData(index, row)
    return
  }

  // 需要认证时调用
  authManager.value.requestAuth(handleDeleteRowData, index, row)
}

/**
 * 订单明细 - 删除行数据
 * @param index 索引
 * @param row 订单行数据
 */
const handleDeleteRowData = (index, row) => {
  handleAddSalesOrderLog(OperateLogTypeEnum.DELETE_ORDER_DETAIL, row)
  form.value.salesOrderDetailList.splice(index, 1); // 删除指定行
  oldOrderDetailList.value.splice(index, 1);
}

/**
 * 订单明细 - 修改数据记录日志
 * @param logType 操作日志类型
 * @param row 当前行数据
 * @param index 原始行数据
 */
const handleUpdateDetailAddLog = (logType, row, index) => {
  handleAddSalesOrderLog(logType, row, index)
}

/**
 * 处理skuSelect组件选中事件
 * @param data 
 */
const changeCurrentSkuData = (data) => {
  currentSku.value = data || null;
}

// ------------------------------------- 9 操作日志 start -------------------------------------

/**
 * 插入订单操作日志 删除日志
 */
const oldOrderDetailList = ref([])

/**
 * 添加订单操作日志
 * @param operateLogType 操作日志类型
 * @param row 当前行数据
 * @param index 原始行数据
 */
const handleAddSalesOrderLog = (operateLogType, row, index) =>{
  let oldRow = {}
  if(index){
    oldRow = oldOrderDetailList.value[index] || {};
  }
  const logParams = {
    orderInitNo: form.value.orderInitNo,
    cajaId: currentCaja.value.cajaId,
    cajaName: currentCaja.value.cajaName,
    operationType: operateLogType,
    skuId: null,
    skuCode: null,
    skuName: null,
    price: null,
    quantity: null,
    amount: null,
    discountRate: null,
    totalNetAmount: null,
    oldPrice: null,
    oldQuantity: null,
    oldAmount: null,
    oldDiscountRate: null,
    oldTotalNetAmount: null,
  }
  switch(operateLogType){
    case OperateLogTypeEnum.DELETE_ORDER_DETAIL:
      if (!row) {
        break;
      }
      logParams.skuId = row.skuId;
      logParams.skuCode = row.skuCode;
      logParams.skuName = row.skuName;
      logParams.price = row.detailPrice;
      logParams.quantity = row.detailQuantity;
      logParams.amount = row.detailAmount;
      logParams.discountRate = row.detailDiscountRate;
      logParams.totalNetAmount = row.detailNetAmount;
      break;
    case OperateLogTypeEnum.DELETE_ORDER:
      logParams.totalNetAmount = form.value.totalNetAmount;
      break;
    case OperateLogTypeEnum.EDIT_PRICE:
      if (!row) {
        break;
      }
      logParams.skuId = row.skuId;
      logParams.skuCode = row.skuCode;
      logParams.skuName = row.skuName;
      logParams.price = row.detailPrice;
      logParams.quantity = row.detailQuantity;
      logParams.amount = row.detailAmount;
      logParams.discountRate = row.detailDiscountRate;
      logParams.totalNetAmount = row.detailNetAmount;
      logParams.oldPrice = oldRow.detailPrice;
      logParams.oldQuantity = oldRow.detailQuantity;
      logParams.oldAmount = oldRow.detailAmount;
      logParams.oldDiscountRate = oldRow.detailDiscountRate;
      logParams.oldTotalNetAmount = oldRow.detailNetAmount;
      break;
    case OperateLogTypeEnum.EDIT_QUANTITY:
      if (!row ) {
        break;
      }
      logParams.skuId = row.skuId;
      logParams.skuCode = row.skuCode;
      logParams.skuName = row.skuName;
      logParams.price = row.detailPrice;
      logParams.quantity = row.detailQuantity;
      logParams.amount = row.detailAmount;
      logParams.discountRate = row.detailDiscountRate;
      logParams.totalNetAmount = row.detailNetAmount;
      logParams.oldPrice = oldRow.detailPrice;
      logParams.oldQuantity = oldRow.detailQuantity;
      logParams.oldAmount = oldRow.detailAmount;
      logParams.oldDiscountRate = oldRow.detailDiscountRate;
      logParams.oldTotalNetAmount = oldRow.detailNetAmount;
      break;
    case OperateLogTypeEnum.EDIT_DISCOUNT_RATE:
      if (!row) {
        break;
      }
      logParams.skuId = row.skuId;
      logParams.skuCode = row.skuCode;
      logParams.skuName = row.skuName;
      logParams.price = row.detailPrice;
      logParams.quantity = row.detailQuantity;
      logParams.amount = row.detailAmount;
      logParams.discountRate = row.detailDiscountRate;
      logParams.totalNetAmount = row.detailNetAmount;
      logParams.oldPrice = oldRow.detailPrice;
      logParams.oldQuantity = oldRow.detailQuantity;
      logParams.oldAmount = oldRow.detailAmount;
      logParams.oldDiscountRate = oldRow.detailDiscountRate;
      logParams.oldTotalNetAmount = oldRow.detailNetAmount;
      break;
    case OperateLogTypeEnum.EDIT_SN:
      if(!row){
        break;
      }
      // 暂时不处理
      return;
  }

  console.log("logParams***********:",logParams)
  addSalesOrderLog(logParams).then(()=>{
    console.log("插入订单操作日志成功")
  }).catch((e)=>{
    console.error("插入订单操作日志失败:",e)
  })
}

// ------------------------------------- 9 操作日志 end -------------------------------------

// ------------------------------------- 10 form 订单表单 start -------------------------------------
const data = reactive({
  form: {
    salesOrderDetailList: [], // 初始化为空数组
    salesOrderPaymentList: [],
  },
  rules: {
    tenantId: [
      { required: true, message: "租户id不能为空", trigger: "blur" }
    ],
  }
});

const { form, rules } = toRefs(data);

// 挂单 - 数据本地存储
const indexedDBForm = () =>{
  try {
    // 先去掉 Proxy，转为普通对象
    const data = {
      ...toRaw(form.value),
      salesOrderDetailList: toRaw(form.value.salesOrderDetailList),
      salesOrderPaymentList: toRaw(form.value.salesOrderPaymentList)
    }
    IndexedDBUtil.saveData(DB_NAME, STORE_NAME_ORDER, data);
  } catch (error) {
    console.error("存储数据失败:", error);
  }
}

/**
 * 订单数据持久化 localStory
 */
const localStorageForm = () =>{
  try {
    // 先去掉 Proxy，转为普通对象
    const data = {
      ...toRaw(form.value),
      salesOrderDetailList: toRaw(form.value.salesOrderDetailList),
      salesOrderPaymentList: toRaw(form.value.salesOrderPaymentList)
    }
    localStorage.setItem('currentOrderForm', JSON.stringify(data));
    const oldDetailData = toRaw(oldOrderDetailList.value)
    localStorage.setItem('oldDetailData', JSON.stringify(oldDetailData))
  } catch (error) {
    console.error("localStorage存储数据失败:", error);
  }
}
/**
 * 获取本地存储数据
 */
const getLocalStorageForm = () =>{
  try {
    const data = localStorage.getItem('currentOrderForm');
    if (data) {
      const parsedData = JSON.parse(data);
      form.value = parsedData;
      form.value.salesOrderDetailList = parsedData.salesOrderDetailList;
      form.value.salesOrderPaymentList = parsedData.salesOrderPaymentList;
    }
    const oldDetailData = localStorage.getItem('oldDetailData');
    if (oldDetailData){
      const parsedOldDetailData = JSON.parse(oldDetailData);
      oldOrderDetailList.value = parsedOldDetailData;
    }
  } catch(error) {
    console.error("localStorage获取数据失败:", error);
  }
}
/**
 * 删除本地存储数据
 */
const removeLocalStorageForm = () =>{
  try {
    localStorage.removeItem('currentOrderForm');
    localStorage.removeItem('oldDetailData');
  } catch (error) {
    console.error("localStorage删除数据失败:", error);
  }
}

// 销售订单表单数据重置
function reset() {
  const snowflake = new SnowflakeID({ objectId: userStore.id});
  const orderInitNo = snowflake.nextId();
  form.value = {
    orderId: null,
    orderDirection: OrderDirectionEnum.SALES,
    orderInitNo: orderInitNo,
    orderNo: null,
    parentOrderId: null,
    orderSource: orderSourceEnum.CAJA,
    warehouseId: null,
    cajaId: null,
    shiftId: null,
    salesmanId: null,
    customerId: null,
    customerPriceLevel: 1,
    customerDiscountRate: 0,
    activityId: null,
    orderType: OrderTypeEnum.PRE_ORDER,
    orderStatus: OrderStatusEnum.INIT,
    orderIsHold: OrderIsHoldEnum.NORMAL,
    orderPayStatus: OrderPayStatusEnum.SETTLE,
    totalQuantity: 0,
    totalAmount: 0,
    totalDiscountAmount: 0,
    totalSalesAmount: 0,
    totalPromotionReduceAmount: 0,
    totalBaseAmount: 0,
    totalTaxAmount: 0,
    totalNetAmount: 0,
    cashAmount: 0,
    bankAmount: 0,
    changeAmount: 0,
    zeroAmount: 0,
    remainAmount: 0,
    verifiedAmount: 0,
    totalGiftQuantity: 0,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null,
    delFlag: null,
    operateLog: null,
    salesOrderDetailList: [],
    salesOrderPaymentList: [],
  };

  proxy.resetForm("salesOrderRef");
  getLocalStorageForm(); //  获取本地存储数据
  
}

// form.value 变化 则 本地存储数据
watch(
  () => form.value,
  (newValue, oldValue) => {
    localStorageForm(); // 订单数据持久化 localStory
  },
  { deep: true }
);

onMounted(() => {
  console.log("mounted***************66666");
  reset();
});
// ------------------------------------- 10 form 订单表单 End -------------------------------------


// -------------------------------- 5 交班业务 start  ----------------------------------

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
      // TODO: 交班之前不允许有未完成的订单/挂单

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
  totalRemainAmount: 0,
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

/**
 * 计算现金总收入 = 销售现金(正数) + 退货现金(负数) - 找零现金(正数)
 */
const totalCash = computed(() => {
  return (
    shiftForm.value.totalCash +
    shiftForm.value.totalRefundCash -
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
      ElNotification({
        title: 'Success',
        message: '当前收银台正常',
        type: 'success',
        position: 'bottom-right',
        // appendTo 挂载到 全屏组件上
        appendTo: cashierContainer.value
      })
    } else {
      handleCajaNoRegister(cajaInfo);
    }

  } catch (error) {
    ElNotification({
      title: 'Error',
      message: '后台获取收银台信息失败: ' + error.message,
      type: 'error',
      position: 'bottom-right',
      // appendTo 挂载到 全屏组件上
      appendTo: cashierContainer.value
    })
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
  { label: "全屏", action: "toggleFullScreen", keyDown:"F3" },
  { label: "交班", action: "shift", keyDown: "F4" },
  { label: "挂单", action: "holdOrder", keyDown: "F5" },
  { label: "取单", action: "holdOrder", keyDown: "F6" },
  { label: "收款", action: "handlerPayment", keyDown: "F7" },
  { label: "钱箱", action: "openCashDrawer", keyDown: "F8" },
  { label: "重打", action: "reprint", keyDown: "F9" },
  { label: "无价打印", action: "reprint", keyDown: "F10" },
  { label: "赠品", action: "reprint", keyDown: "F11" },
  { label: "通用商品", action: "reprint", keyDown: "F12" },
  { label: "整单折扣", action: "reprint", keyDown: "Ctrl + F1" },
  { label: "折上折", action: "reprint", keyDown: "Ctrl + F2" },
  { label: "拆单", action: "splitOrder", keyDown: "Ctrl + F3" },
  { label: "退货", action: "refund", keyDown: "Ctrl + F4" }
];

const handleAction = (action) => {
  console.log("执行操作:", action.label);
  switch (action.action) {
    case "toggleFullScreen":
      playKeyHappySound()
      toggleFullScreen();
      break;
    case "shift":
      playKeyHappySound();
      handleShift();
      break;
    case "holdOrder":
      console.log("挂单");
      playKeyHappySound()
      console.log("表单form的数据：*****", form.value)
      indexedDBForm()
      break;
    case "splitOrder":
      console.log("拆单");
      break;
    case "handlerPayment":
      handlerPayment()
      console.log("收款"); 
      break;
    case "refund":
      openReturnView()
      console.log("开始打开退货窗口");
      break;
  }
};


// ----------------- 2 侧边栏按钮区域 end  -------------------

// ---------------- 1 键盘 + 表格 + 商品查询 组件处理 start -----------------

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
  document.addEventListener('focus', handleFocus, { passive: true }); // 捕获阶段监听
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


/** 获取选中的客户数据 */
const selectedCustomerData = (data) => {
  console.log('收银台获取的客户数据:', data)
  if(data){
    form.value.customerId = data.customerId;
    form.value.customerName = data.customerName; 
    form.value.invoiceTax = data.invoiceTax;
    form.value.invoicePhone = data.invoicePhone;
    form.value.invoiceAddress = data.invoiceAddress;
    form.value.customerPriceLevel = data.customerLevel?.levelPrice || 1;
    form.value.customerDiscountRate = data.customerLevel?.levelDiscount || 0;
    if(data.salesmanVo){
      form.value.salesmanId = data.salesmanVo?.userId || null;
      form.value.salesmanName = data.salesmanVo?.userName || null;
    } else {
      form.value.salesmanId =  null;
      form.value.salesmanName =  null;
    }
  } else {
    form.value.customerId =  null;
    form.value.customerName =  null; 
    form.value.customerPriceLevel =  1;
    form.value.customerDiscountRate =  0;
  }
  // 更新价格和折扣
  updateDetailPriceAndDiscount();
}

// 根据客户信息 折扣/价格 更新明细价格/折扣 根据是否含税计算最终金额
const updateDetailPriceAndDiscount = () => {
  if (form.value.salesOrderDetailList.length > 0 ) {
    // 更新每个订单明细的价格、折扣和金额
    form.value.salesOrderDetailList.forEach((item) => {
      // 动态构建 priceMap
      const priceMap = {
        1: item.skuPrice,
        2: item.skuPrice2,
        3: item.skuPrice3,
        4: item.skuPrice4,
        5: item.skuPrice5,
        6: item.skuPrice6,
      };

      // 更新价格
      item.detailPrice = priceMap[form.value.customerPriceLevel] || item.skuPrice;
      // 更新折扣率
      item.detailDiscountRate = form.value.customerDiscountRate || 0;

      // 计算订单金额
      item.detailAmount = item.detailPrice * item.detailQuantity;
      item.detailDiscountAmount = item.detailAmount * (item.detailDiscountRate / 100);
      item.detailSalesAmount = item.detailAmount - item.detailDiscountAmount;

      // 根据是否含税计算净金额、基础金额和税额
      if (item.inTax === 0) {
        // 含税
        item.detailNetAmount = item.detailSalesAmount;
        item.detailBaseAmount = item.detailNetAmount / (1 + item.detailTaxRate / 100);
        item.detailTaxAmount = item.detailNetAmount - item.detailBaseAmount;
      } else if (item.inTax === 1) {
        // 不含税
        item.detailBaseAmount = item.detailSalesAmount;
        item.detailTaxAmount = item.detailBaseAmount * (item.detailTaxRate / 100);
        item.detailNetAmount = item.detailBaseAmount + item.detailTaxAmount;
      }

      console.log("订单明细计算结果：", item);
    });

  }
};

/** 获取选中的业务员数据 */
const selectedSalesmanData = (data) => {
  console.log('收银台获取的业务员数据:', data)
  form.value.salesmanId = data.userId || null;
  form.value.salesmanName = data.userName || null ; 
}

/** 获取选中的业务活动数据 */
const selectedSalesActivityData = (data) => {
  console.log('收银台获取的业务活动数据:', data)
  form.value.activityId = data.activityId || null;
  form.value.activityName = data.activityName || null;
}

/** 获取选中的商品数据 */
const selectedSkuData = (data) => {
  console.log('收银台获取的商品数据:', data)
  currentSku.value = data || null;
  if (currentSku.value) {
    handleAddSalesOrderDetail(currentSku.value)
  }
}

/** 获取选中的仓库 */
const selectedWarehouseData = (data) => {
  console.log('收银台获取的仓库数据:', data)
  currentWarehouse.value = data || null;
  form.value.warehouseId = data.warehouseId || null;
  form.value.warehouseName = data.warehouseName || null;
}



// ***************** 1 键盘 + 表格 + 商品查询 组件处理 end *****************

// ----------------- 0 快捷键 start -----------------
// 1 监听快捷键
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});
// 2 释放快捷键监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

/** 3 快捷键实现 */
const handleKeyDown = (event) => {
  // 捕获 F1 到 F12
  if (event.key.startsWith('F') && event.key.length > 1) {
    const keyNumber = parseInt(event.key.slice(1), 10); // 提取 F 后面的数字
    if (keyNumber >= 1 && keyNumber <= 12) {
      event.preventDefault();
      console.log(`F${keyNumber} 被按下`);
      // 根据 F 键执行不同的逻辑
      switch (keyNumber) {
        case 1:
          // 播放按键音效
          playKeyHappySound();
          focusLastRowQuantity();
          break;
        case 2:
          // 播放按键音效
          playKeyHappySound();
          focusSkuInput();
          break;
        case 3:
          // 播放按键音效
          playKeyHappySound();
          toggleFullScreen();
          break;
        case 4:
          // 播放按键音效
          playKeyHappySound();
          handleShift();
          break;
        case 5:
          // 播放按键音效
          playKeyHappySound();
          handlerPayment()
          break;
        default:
          console.log(`F${keyNumber} 被按下`);
          break;
      }
    }
  }

  // 捕获组合键 Ctrl + T
  if (event.ctrlKey && event.key === 'o') {
    event.preventDefault();
    // 播放按键音效
    playKeyHappySound();
    console.log("Ctrl + O 被按下");
    // 执行 Ctrl + O 的逻辑
  }

  // 捕获组合键 Ctrl + Alt
  if (event.ctrlKey && event.altKey) {
    event.preventDefault();
    // 播放按键音效
    playKeyHappySound();
    console.log("Ctrl + Alt 被按下");
    // 执行 Ctrl + Alt 的逻辑
  }
};

/** 键盘组件聚焦到最后一行的数量单元格 */
const focusLastRowQuantity = () => {
  if (editableTableRef.value) {
    editableTableRef.value.focusLastRowQuantity();
  }
};

/** 聚焦到商品查询输入框 */
const focusSkuInput = () => {
  if (skuSelectRef.value) {
    skuSelectRef.value.focus();
  }
};

/** 交班 */
const handleShift = () => {
  getSalesShiftRecords(shiftForm.value.shiftId).then((response) => {
    if (response.data.shiftStatus == ShiftStatusEnum.ACTIVE) {
      // 更新交班记录
      shiftForm.value = response.data;
    }
  });
  // 弹出交班对话框
  handlerOpenDialog()
}

// ----------------- 0 快捷键 end -----------------

// -------------------------------------- 9 订单明细计算 start ------------------------------------------
/** 计算含税和不含税的金额 */
function calculateAmounts(detailPrice, taxRate, inTax) {
  const rateValue = (taxRate || 0)/100;
  let detailBaseAmount, detailTaxAmount, detailNetAmount;

  if (inTax === 0) {
    // 含税
    detailBaseAmount = detailPrice / (1 + rateValue);
    detailTaxAmount = detailPrice - detailBaseAmount;
    detailNetAmount = detailPrice;
  } else {
    // 不含税
    detailBaseAmount = detailPrice;
    detailTaxAmount = detailPrice * (rateValue);
    detailNetAmount = detailPrice + detailTaxAmount;
  }

  return { detailBaseAmount, detailTaxAmount, detailNetAmount };
}

const comboDialog = ref()

// 添加处理回调
const handleAddComboDetails = (comboDetail) => {
  form.value.salesOrderDetailList.push(comboDetail);
  oldOrderDetailList.value.push(comboDetail);
}

/** 销售订单明细添加按钮操作 */
function handleAddSalesOrderDetail(sku) {
  const obj = initOrderDetailData();
  const { skuId, skuCode, skuImage, skuName, assistName, skuType, comboId, skuValue, batchNo, unitVo, productRateVo, inTax, skuPrice, skuPrice2, skuPrice3, skuPrice4, skuPrice5, skuPrice6 } = sku;
  obj.detailMainSkuId = null;
  obj.skuId = skuId;
  obj.skuCode = skuCode;
  obj.skuImage = skuImage;
  obj.skuName = skuName;
  obj.assistName = assistName;
  obj.skuType = skuType;
  obj.comboId = comboId;
  obj.skuValue = skuValue;
  obj.batchNo = batchNo;
  obj.detailSn = null;
  obj.skuUnit = unitVo?.unitCode;
  obj.inTax = inTax;
  obj.skuPrice = skuPrice;
  obj.skuPrice2 = skuPrice2;
  obj.skuPrice3 = skuPrice3;
  obj.skuPrice4 = skuPrice4;
  obj.skuPrice5 = skuPrice5;
  obj.skuPrice6 = skuPrice6;

  // 根据客户等级 价格/折扣转换
  const levelPriceMap = {
    1: skuPrice,
    2: skuPrice2,
    3: skuPrice3,
    4: skuPrice4,
    5: skuPrice5,
    6: skuPrice6,
  };

  // 2 数量和金额计算
  obj.detailPrice = levelPriceMap[form.value.customerPriceLevel] || skuPrice;
  obj.detailQuantity = 1;
  obj.detailAmount = obj.detailPrice * obj.detailQuantity;
  obj.detailDiscountRate = form.value.customerDiscountRate || 0;
  obj.promotionDiscountRate = 0;
  obj.activityDiscountRate = 0;
  obj.detailDiscountAmount = 0;
  obj.detailSalesAmount = sku.skuPrice;
  obj.detailTaxRate = productRateVo?.rateValue || 0;
  // 3 含税/不含税
  const { detailBaseAmount, detailTaxAmount, detailNetAmount } = calculateAmounts(
    obj.detailSalesAmount,
    obj.detailTaxRate,
    obj.inTax
  );
  obj.detailBaseAmount = detailBaseAmount;
  obj.detailTaxAmount = detailTaxAmount;
  obj.detailNetAmount = detailNetAmount;
  
  // 4 套餐确认
  if (skuType == 2) {
    comboDialog.value.showComboDialog(obj) 
  } else {
    // 5 添加到订单明细列表
    form.value.salesOrderDetailList.push(obj); 
    oldOrderDetailList.value.push(obj);
  }
  
}



// -------------------------------------- 9 订单明细计算 end ------------------------------------------

// ------------------------------------- 8 计算表格数据 start -------------------------
// 8.1 总数量
const totalQuantity = computed(() => {
  return data.form.salesOrderDetailList.reduce((total, item) => {
    return total + Number(item.detailQuantity);
  }, 0);
});
// 8.2 总金额 form.totalAmount
const totalAmount = computed(() => {
  return data.form.salesOrderDetailList.reduce((total, item) => {
    return total + Number(item.detailAmount);
  }, 0);
});
// 8.3 总折扣额
const totalDiscountAmount = computed(() => {
  return data.form.salesOrderDetailList.reduce((total, item) => {
    return total + Number(item.detailDiscountAmount);
  }, 0);
});
// 8.4 销售总金额 form.totalSalesAmount
const totalSalesAmount = computed(() => {
  return data.form.salesOrderDetailList.reduce((total, item) => {
    return total + Number(item.detailSalesAmount);
  }, 0);
});

// 8.6 发票计算基础金额 form.totalBaseAmount 含税/不含税
const totalBaseAmount = computed(() => {
  return data.form.salesOrderDetailList.reduce((total, item) => {
    return total + Number(item.detailBaseAmount);
  }, 0);
});

// 8.7 税额 form.totalTaxAmount 含税/不含税
const totalTaxAmount = computed(() => {
  return data.form.salesOrderDetailList.reduce((total, item) => {
    return total + Number(item.detailTaxAmount);
  }, 0);
});

// 8.8 应收金额 form.totalNetAmount 含税/不含税
const totalNetAmount = computed(() => {
  return data.form.salesOrderDetailList.reduce((total, item) => {
    return total + Number(item.detailNetAmount);
  }, 0);
});


/**
 * 完成支付操作
 */
const handlePaymentComplete = () => {
  console.log('支付完成:')
  // TODO:初始化当前表单数据
  removeLocalStorageForm()
  reset()
}


const paymentDialog = ref(null)
// 9 收款操作
const handlerPayment = () => {
  form.value.cajaId = currentCaja.value.cajaId;
  form.value.shiftId = shiftForm.value.shiftId;
  if(form.value.orderId){
    // 修改订单信息 -> 返回计算后的订单信息
    updateSalesOrder(form.value).then((res) => {
      if(res.code == 200 && res.data){
        form.value = res.data;
        oldOrderDetailList.value = cloneDeep(res.data.salesOrderDetailList) ;
        // 打开收款界面
        paymentDialog.value.openPaymentDialog()

      } else {
        ElNotification({
          title: 'Error',
          message: res.msg,
          type: 'error',
          position: 'bottom-right',
          // appendTo 挂载到 全屏组件上
          appendTo: cashierContainer.value
        })
      }
    }).catch(error => {
      ElNotification({
        title: 'Error',
        message: error.message,
        type: 'error',
        position: 'bottom-right',
        // appendTo 挂载到 全屏组件上
        appendTo: cashierContainer.value
      })
    });

  } else {
    // 添加订单信息 -> 返回计算后的订单信息
    addSalesOrder(form.value).then((res) => {
      console.log("添加订单信息返回：", res.data);
        form.value = res.data; 
        oldOrderDetailList.value = cloneDeep(res.data.salesOrderDetailList);
        // 打开收款界面
        paymentDialog.value.openPaymentDialog()
      }
    ).catch(error => {
      ElNotification({
        title: 'Error',
        message: "收款操作异常：" + error.message,
        type: 'error',
        position: 'bottom-right',
        // appendTo 挂载到 全屏组件上
        appendTo: cashierContainer.value
      })
    });
  }
  
};

// ----------------------------------------- 8 计算表格数据 end ----------------------

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
        background-color: #f5f7fa;  /* 浅灰色背景 */
        //overflow-y: auto; /* 允许滚动 */
        
        .footer-card {
          min-height: 100%;
          width: 100%;
          border-radius: 8px;
          /* 圆角 */
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          /* 阴影 */
          padding: 0px;
          margin: 0px;
      
          .footer-row {
            height: 100%;
            margin: 0 !important;
            /* 移除默认的外边距 */
          }
      
          .footer-col {
            height: 100%;
            display: flex;
            align-items: center;
            border-right: 1px solid #d8dce6; /* 更细、更浅的分割线 */
            padding-right: 10px; /* 分割线与内容的间距 */
            margin-right: 10px; /* 区域之间的间距 */

            &:last-child {
              border-right: none; /* 去除最后一个区域的分割线 */
              padding-right: 0;
              margin-right: 0;
            }
      
            .footer-col-content {
              height: 90%;
              width: 100%;
              display: flex;
              flex-direction: column;
              justify-content: center;
              padding: 5px; /* 内边距 */
              margin: 0px;

              .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #303133; /* 标题颜色 */
                display: flex;
                justify-content: space-between; /* 将内容分散对齐 */
                align-items: center; /* 垂直居中 */
                padding: 5px;
              }
      
              .sku-image-container {
                flex: 1;
                margin: 10px;
                text-align: center;
              }
      
              .highlight-text {
                color: #409eff;
                /* 高亮文本颜色 */
                font-weight: bold;
              }
            }
      
          }
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

          .button-content {
            display: flex;
            justify-content: space-between; /* 让内容分居两侧 */
            align-items: center;
            width: 100%;
            .label {
              text-align: left; /* label 左对齐 */
            }
            .key-down {
              color: hsl(128, 90%, 49%);
              margin-left: 25px;
              font-size: 12px;
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

:deep(.total-label2){
  font-size: 20px;
  color: #f30909;
}

:deep(.total-content2) {
  font-size: 20px;
}

:deep(.el-card__body){
  padding: 0px !important;
}





</style>