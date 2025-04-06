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
            @deleteRow="handleDeleteRow" />
        </el-main>

        <!-- 下部分：商品输入框和汇总信息 -->
        <el-footer class="footer-data-container">
          <el-card class="footer-card">
            <el-row class="footer-row">
              <!-- 第一个区域：商品搜索和图片展示 -->
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
                      <span class="highlight-text">{{currentCustomer?.customerName || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="税号:" :min-width="100">
                      <span class="highlight-text">{{currentCustomer?.invoiceTax || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="手机:" :min-width="100">
                      <span class="highlight-text">{{currentCustomer?.invoicePhone || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="地址:" :span="2">
                      <span class="highlight-text">{{currentCustomer?.invoiceAddress || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="仓库:">
                      <span class="highlight-text">{{currentWarehouse?.warehouseName || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="业务员:">
                      <span class="highlight-text">{{currentSalesman?.userName || '--'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="业务活动:">
                      <span class="highlight-text">{{currentSalesActivity?.activityName || '--'}}</span>
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
                    <el-descriptions-item label="金额:">
                      <span class="highlight-text">{{ formatTwo(totalAmount) + ' €'}} </span>
                    </el-descriptions-item>
                    <el-descriptions-item label="折扣:">
                      <span class="highlight-text">{{ formatTwo(totalDiscountAmount) + ' €' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="减免:">
                      <span class="highlight-text">{{ formatTwo(form.totalPromotionReduceAmount) + ' €' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="赠送:">
                      <span class="highlight-text">{{ form.totalGiftQuantity}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="基础:">
                      <span class="highlight-text">{{ formatTwo(totalBaseAmount) + ' €'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="税额:" :span="2">
                      <span class="highlight-text">{{ formatTwo(totalTaxAmount) + ' €'}}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="应收金额:" :span="2" class-name="total-label2"
                      label-class-name="total-content2">
                      <span>{{ formatTwo(totalNetAmount) + ' €'}}</span>
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
              <TouchKeyboard ref="keyboardRef" v-if="cajaShowKeyboard == 0" />
            </div>
            <el-divider v-if="cajaShowKeyboard == 0" />
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
                <el-divider content-position="left"> <span>订单绑定业务员</span> </el-divider>
                <el-form-item label="业务员:" prop="salesmanId">
                  <SalesmanSelect v-model="form.salesmanId" @selectedData="selectedSalesmanData" />
                </el-form-item>
                <el-divider content-position="left"> <span>客户信息</span> </el-divider>
                <el-form-item label="客户信息:" prop="customerId">
                  <CustomerSelect v-model="form.customerId" @selectedData="selectedCustomerData" />
                </el-form-item>
                <el-divider content-position="left"> <span>仓库信息</span> </el-divider>
                <el-form-item label="仓库信息:" prop="customerId">
                  <WarehouseSelect v-model="form.warehouseId" @selectedData="selectedWarehouseData" />
                </el-form-item>
                <el-divider content-position="left"> <span>业务活动</span> </el-divider>
                <el-form-item label="业务活动:" prop="customerId">
                  <SalesActivitySelect v-model="form.activityId" @selectedData="selectedSalesActivityData" />
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
            <el-descriptions-item label="本次总收入: " :span="2" label-class-name="total-label" class-name="total-content">
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
            <el-descriptions-item label="现金找零: " :span="2">
              <span :style="{ color: shiftForm.totalChange < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(shiftForm.totalChange) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="现金总收入: " label-class-name="total-label" class-name="total-content">
              <span :style="{ color: totalCash < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(totalCash) + ' €' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="银行总收入: " label-class-name="total-label" class-name="total-content">
              <span :style="{ color: totalBank < 0 ? '#ff4949' : 'inherit' }">
                {{ formatTwo(totalBank) + ' €' }}
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
            <el-button type="danger" @click="handlerCloseTab" v-if="shiftForm.shiftId">退出值班</el-button>
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
            <el-button type="danger" @click="handlerCloseTab" >退出值班</el-button>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 店长认证 对话框 -->
    <el-dialog v-model="dialogVisible2" title="店长认证:" width="400" :close-on-click-modal="false"
      :close-on-press-escape="false" :show-close="false">
      <el-form :model="userForm" ref="userFormRef">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="userForm.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible2 = false">取消</el-button>
        <el-button type="primary" @click="checkAuthStoreManager">确定</el-button>
      </template>
    </el-dialog>

    <!-- 套餐确认 对话框 -->
    <ComboConfirmDialog ref="comboDialog" @add-combo-details="handleAddComboDetails" />

    <!-- 收款确认 对话框 -->
    <PaymentDialog ref="paymentDialog"  @paymentComplete="handlePaymentComplete" @continueUpdateOrder="handleContinueUpdateOrder"/>

  </div>



</template>

<script setup name="cashOperation">
import { ref, onMounted, onUnmounted, watch } from 'vue';
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
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { getShiftRecordsIsActive, getLastShiftRecords, addSalesShiftRecords, continueSalesShiftRecords, getSalesShiftRecords, finishSalesShiftRecords } from '@/api/sales/SalesShiftRecords';
import useUserStore from "@/store/modules/user";
import {UserTypeEnum} from "@/views/system/tenant/tenantConstants.js";
import { clone, cloneDeep, size } from 'lodash';
import ImageNormal from '@/components/ImageNormal/index.vue';
import { Picture as IconPicture } from '@element-plus/icons-vue'
import { addSalesOrder, updateSalesOrder } from "@/api/sales/salesOrder";
import {authStoreManager} from "@/api/system/user.js"
import SnowflakeID from '@/utils/SnowflakeID.js';
import IndexedDBUtil from '@/indexedDB/index.js';
import { getProductCombo} from "@/api/product/productCombo";
import { ComboItemIsOptionalEnum } from "@/views/product/productCombo/productComboEnum.js"
import ComboConfirmDialog from './cashOperationUtil/ComboConfirmDialog.vue';
import PaymentDialog from './cashOperationUtil/PaymentDialog.vue';

const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_is_hold, sales_order_in_tax, sales_order_direction, sales_order_detail_type, sales_order_type, sales_order_status, erp_product_sku_type } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_in_tax', 'sales_order_direction', 'sales_order_detail_type', 'sales_order_type', 'sales_order_status', 'erp_product_sku_type');

// 获取当前用户信息
const userStore = useUserStore();
const dialogVisible = ref(false) // 交班窗口
const dialogVisible2 = ref(false) // 店长认证
const dialogVisible3 = ref(false) // 套餐确认
const userForm = ref({});  // 店长信息
const activeTab = ref('first')  // 交班默认tab窗口
const keyboardRef = ref(null);  // 键盘组件实例
const skuSelectRef = ref(null); // skuSelect组件实例
const editableTableRef = ref(null); // 表格组件实例
const currentCustomer = ref(null)
const currentSalesman = ref(null)
const currentSalesActivity = ref(null)
const currentSku = ref(null)
const currentWarehouse = ref(null);
const canEditPrice = ref(1);  // 表格子组件编辑单价disable控制
const canEditDiscountRate = ref(1); // 表格子组件编辑折扣disable控制

const DB_NAME = "OrderDB";
const STORE_NAME_ORDER = "order";

/** 获取租户配置 */
const getTenantConfig = async () => {
  const config = await proxy.getTenantConfig("editPrice");
  canEditPrice.value = config?.configValue || '1';
  const config2 = await proxy.getTenantConfig("editDiscountRate");
  canEditDiscountRate.value = config2?.configValue || '1';
}
getTenantConfig()

const changeCurrentSkuData = (data) => {
  currentSku.value = data || null;
}

/**
 * 处理删除行
 */
const handleDeleteRow = (index) => {
  // 门店权限校验
  dialogVisible2.value = true;
  userForm.value.index = index;
  
};

/**
 * 店长认证
 */
const checkAuthStoreManager = () => {
  authStoreManager(userForm.value).then(()=>{
    form.value.salesOrderDetailList.splice(userForm.value.index, 1); // 删除指定行
    dialogVisible2.value = false
    userForm.value = {}
  }).catch((e)=>{
    userForm.value = {}
    ElNotification({
      title: 'error',
      message: '没有店长权限，禁止删除行数据！',
      type: 'error',
      position: 'bottom-right',
      // appendTo 挂载到 全屏组件上
      appendTo: cashierContainer.value
    })
    console.error("店长权限校验",e)
  }) 
}

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

// 数据本地存储
const indexedDBForm = () =>{
  try {
    // 先去掉 Proxy，转为普通对象
    console.log("存储前的数据:", toRaw(form.value));
    const rawData = toRaw(form.value);
    // const clonedForm = structuredClone(rawData);
    IndexedDBUtil.saveData(DB_NAME, STORE_NAME_ORDER, rawData);
  } catch (error) {
    console.error("存储数据失败:", error);
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
  
}

onMounted(() => {
  console.log("mounted***************66666");
  reset();
});
// ------------------------------------- 10 form 订单表单 End -------------------------------------


// -------------- 7 订单数据处理 start --------------------



/** 提交按钮 */
function submitForm() {
  proxy.$refs["salesOrderRef"].validate(valid => {
    if (valid) {
      form.value.salesOrderDetailList = salesOrderDetailList.value;
      if (form.value.orderId != null) {
        updateSalesOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSalesOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}


// --------------- 7 订单数据处理 end --------------------

// **************** 获取配置 start *******************

/** 是否展示触摸键盘配置 */
const cajaShowKeyboard = ref(0)
const getCajaShowKeyboard = async () => {
  const config = await proxy.getTenantConfig("cajaShowKeyboard");
  cajaShowKeyboard.value = config.configValue || 0;
}
getCajaShowKeyboard()

// **************** 获取配置 end *******************


// -------------- 5 交班业务 start  ---------------------

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
  { label: "退货", action: "reprint", keyDown: "Ctrl + F4" }
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




/** 获取选中的客户数据 */
const selectedCustomerData = (data) => {
  console.log('收银台获取的客户数据:', data)
  currentCustomer.value = data || null;

  // 更新价格和折扣
  updateDetailPriceAndDiscount();

  // 更新业务员信息
  if(currentCustomer.value?.salesmanVo){
    currentSalesman.value = currentCustomer.value.salesmanVo
  }
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

/** 获取选中的仓库 */
const selectedWarehouseData = (data) => {
  console.log('收银台获取的仓库数据:', data)
  currentWarehouse.value = data || null;
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
    if (response.data.isActive) {
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
  form.value.salesOrderDetailList.push(comboDetail)
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

  // 2 数量和金额计算
  obj.detailPrice = sku.skuPrice;
  obj.detailQuantity = 1;
  obj.detailAmount = sku.skuPrice;
  obj.detailDiscountRate = 0;
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
  }
  
}

// 根据客户信息 折扣/价格 更新明细价格/折扣 根据是否含税计算最终金额
const updateDetailPriceAndDiscount = () => {
  if (form.value.salesOrderDetailList.length > 0 ) {
    // 获取客户等级和折扣
    const customerLevel = currentCustomer.value?.customerLevel;
    const levelPrice = customerLevel?.levelPrice;
    const levelDiscount = customerLevel?.levelDiscount || 0;

    console.log("当前客户等级：", customerLevel);
    console.log("当前客户等级价格：", levelPrice);
    console.log("当前客户等级折扣：", levelDiscount);

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
      item.detailPrice = priceMap[levelPrice] || item.skuPrice;
      console.log("更新后的价格：", item.detailPrice);

      // 更新折扣率
      item.detailDiscountRate = levelDiscount;
      console.log("更新后的折扣率：", item.detailDiscountRate);

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

// 8.5 销售活动减免金额（后台计算返回） form.totalPromotionReduceAmount 促销活动

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

// 8.9 赠送数量 (后台计算返回) form.totalGiftQuantity  促销活动

// 更新订单form数据
const updateFormData = () => {
  form.value.cajaId = currentCaja.value.cajaId;
  form.value.shiftId = shiftForm.value.shiftId;
  form.value.totalAmount = totalAmount.value;
  form.value.totalQuantity = totalQuantity.value;
  form.value.totalDiscountAmount = totalDiscountAmount.value;
  form.value.totalSalesAmount = totalSalesAmount.value;
  form.value.totalBaseAmount = totalBaseAmount.value;
  form.value.totalTaxAmount = totalTaxAmount.value;
  form.value.totalNetAmount = totalNetAmount.value;

};


/**
 * 完成支付操作
 */
const handlePaymentComplete = () => {
  console.log('支付完成:')
  // TODO:初始化当前表单数据
  reset()
}

/**
 *  继续修改订单
 */
const handleContinueUpdateOrder = (orderData) => {
  console.log('收款子组件继续修改订单传递给父组件的数据:', orderData)
  form.value = orderData
}

const paymentDialog = ref(null)
// 9 收款操作
const handlerPayment = () => {
  updateDetailPriceAndDiscount();   // 根据客户信息 折扣/价格 更新明细价格/折扣 根据是否含税计算最终金额
  updateFormData();   // 更新订单form统计数据
  console.log("传递给收款子组件的订单数据*******************：", form.value);
  if(form.value.orderId){
    // 修改订单信息 -> 返回计算后的订单信息
    updateSalesOrder(form.value).then((res) => {
      if(res.code == 200 && res.data){
        form.value = res.data;
        // 打开收款界面
        paymentDialog.value.openPaymentDialog(form.value)

      } else {
        ElMessage.error(res.msg);
      }
    }).catch(error => {
      ElMessage.error(error.message);
    });

  } else {
    // 添加订单信息 -> 返回计算后的订单信息
    addSalesOrder(form.value).then((res) => {
      console.log("添加订单信息返回：", res.data);
        form.value = res.data;
        // 打开收款界面
        paymentDialog.value.openPaymentDialog(form.value)
      }
    ).catch(error => {
      ElMessage.error("收款操作异常：",error.message);
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