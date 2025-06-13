<template>
  <el-card class="box-card" shadow="hover">
    <template #header>退货记录查询</template>
    <el-form inline :model="query" class="form-query" @submit.prevent>
      <el-row>
        <el-form-item label="原始订单号:">
          <el-input v-model.trim="query.parentOrderInitNo" placeholder="原始订单初始号" clearable style="width: 350px;" />
        </el-form-item>
        <el-form-item label="退货单号:">
          <el-input v-model.trim="query.orderInitNo" placeholder="退货初始单号" clearable style="width: 350px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchHistory" style="margin-left: 20px;">查询</el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <el-table :data="historyList" border stripe size="small" style="margin-top: 10px" height="500">
      <el-table-column prop="parentOrderInitNo" label="原始订单号" />
      <el-table-column prop="orderInitNo" label="退货单号">
        <template #default="scope">
          <span class="link-type" @click="getInfoById(scope.row)">
            {{ scope.row.orderInitNo }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="订单时间" />
      <el-table-column prop="remark" label="退货原因" />
      <el-table-column prop="totalQuantity" label="退货数量" width="100" align="center" />
      <el-table-column prop="totalNetAmount" label="退货金额" width="100" align="right">
        <template #default="scope">
          {{ formatTwo(scope.row.totalNetAmount) + ' €'}}
        </template>
      </el-table-column>
    </el-table>

    <!-- 退货订单信息 -->
    <RefundTable ref="refundTableDialog" :orderData="form" @printTicket="handlePrintTicket" @payment="handleCompletePayment" />
  </el-card>
</template>

<script setup>
import { ref } from 'vue';
import { listSalesOrder, getSalesOrder, generateInvoice } from '@/api/sales/salesOrder';
import { ElMessage, ElMessageBox } from 'element-plus';
import RefundTable from '@/components/sales/RefundTable.vue';
import { InvoiceTypeEnum } from '@/views/verifuc/verifacInvoice/invoiceConstants.js';
import { completePayment } from '@/api/sales/salesOrder.js';
import { paymentAutoPrintEnum,} from '@/views/sales/salesOrder/cashOperationUtil/tenantConfigEnum.js';

const query = ref({
  parentOrderInitNo: '',
  orderInitNo: ''
})

const historyList = ref([])
const refundTableDialog = ref(null)

// ------------- 获取租户配置 start --------------------------

const paymentAutoPrint = ref(paymentAutoPrintEnum.OPEN);  // 是否开启完成支付自动打印
const { proxy } = getCurrentInstance();
/** 异步获取租户配置 */
const loadTenantConfig = async () => {
  try {
    const config3 = await proxy.getTenantConfig("paymentAutoPrint");
    paymentAutoPrint.value = (config3 != null) ? config3 : paymentAutoPrintEnum.OPEN;
  } catch (error) {
    console.error("加载租户配置失败:", error);
    // 设置默认值
    paymentAutoPrint.value = paymentAutoPrintEnum.OPEN;
  }
}
onMounted(() => {
  loadTenantConfig();
});

// ------------- 获取租户配置 end --------------------------

const fetchHistory = async () => {
  try {
    if  (!query.value.parentOrderInitNo && !query.value.orderInitNo) return ElMessage.warning('请输入查询条件')
    const res = await listSalesOrder(query.value)
    historyList.value = res.rows || []
  } catch (e) {
    ElMessage.error('查询失败: ' + e.message)
  }
}

// 表单数据
const data = reactive({
  // 退货订单
  form: {
    salesOrderDetailList: [], // 初始化为空数组
  },
  rules: {
    orderInitNo: [
      { required: true, message: "初始退货单号不能为空", trigger: "blur" }
    ],
  }
});

const { form, rules } = toRefs(data);


/** 通过传递的 orderId 获取订单信息 */
const getInfoById = async (row) => {
  // 获取修改传递的参数 productId
  const _orderId = row.orderId;
  if (!_orderId) {
    console.log("传递的参数orderId为空");
    return;
  }
  try {
    // 获取订单信息
    getSalesOrder(_orderId).then(response => {
      if (!response.data) {
        console.log("订单信息为空");
        return;
      }
      form.value = response.data;
      refundTableDialog.value.openDialog();
    });
  } catch (error) {
    console.error("获取订单信息失败:", error);
  }
}

/** 完成支付 */
function handleCompletePayment(salesOrderPayment) {
  if (!salesOrderPayment) return;
  if (!form.value.salesOrderPaymentList) form.value.salesOrderPaymentList = []
  form.value.salesOrderPaymentList.push(salesOrderPayment)
  completePayment(form.value).then(res => {
    if (res.code == 200) {
      if (res.data) {
        form.value = res.data;
      }
      // 是否自动打印
      if (paymentAutoPrint.value == paymentAutoPrintEnum.OPEN) {
        // 打印功能
        handlePrintTicket()
      }
    }
  })
}

/**
 * 打印小票
 */
const handlePrintTicket = () => {
  console.log('退货历史界面开始打印小票业务:')
  form.value.invoiceTipo = InvoiceTypeEnum.SIMPLIFICADA
  // 生成发票 - 返回带有QR的订单信息
  generateInvoice(form.value).then((res) => {
    console.log("确认发票响应的结果：", res)
    if (res.data) {
      form.value = res.data;
      if (form.value.verifacInvoice && form.value.verifacInvoice.invoiceQr) {
        // 打印简易发票
        printTicket80(form.value)
      } else {
        ElMessageBox.confirm('发票信息异常，请稍后再试，是否打印临时小票？', '警告提示', {
          confirmButtonText: 'OK',
          showCancelButton: false,
          type: 'error',
        }).then(() => {
          // 打印订单
          printPedido80(form.value)
        })
      }
    }
  }).catch((e) => {
    // 错误信息展示
    console.log("确认发票异常：", e)
    ElNotification({
      title: 'Error',
      message: "确认发票异常：" + e,
      type: 'error',
      position: 'bottom-right',
      // appendTo 挂载到 全屏组件上
      appendTo: cashierContainer.value
    })

  })
}

/** 打印简易发票 */
function printTicket80(orderFormData) {
  // TODO: 业务待完成
  console.log("打印的简易发票信息是：", orderFormData)
}

/** 没有QR，打印pedido临时订单 */
function printPedido80(orderFormData) {
  // TODO: 业务待完成
  console.log("打印的临时订单信息是：", orderFormData)
}




</script>

<style scoped>
.form-query {
  margin-bottom: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许滚动 */
}
</style>
