<template>
  <el-card class="box-card" shadow="hover">
    <template #header>退货记录查询</template>
    <el-form inline :model="query" class="form-query" @submit.prevent>
      <el-row >
        <el-form-item label="原始订单号:">
          <el-input v-model="query.parentOrderNo" placeholder="原始订单号" clearable style="width: 350px;"/>
        </el-form-item>
        <el-form-item label="退货单号:">
          <el-input v-model="query.orderInitNo" placeholder="退货单号" clearable style="width: 350px;"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchHistory" style="margin-left: 20px;">查询</el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <el-table :data="historyList" border stripe size="small" style="margin-top: 10px" height="500">
      <el-table-column prop="parentOrderNo" label="原始订单号" />
      <el-table-column prop="orderInitNo" label="退货单号" />
      <el-table-column prop="createTime" label="订单时间" />
      <el-table-column prop="remark" label="退货原因" />
      <el-table-column prop="totalQuantity"  label="退货数量" width="100" align="center" />
      <el-table-column prop="totalNetAmount" label="退货金额" width="100" align="right" />
    </el-table>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { listSalesOrder } from '@/api/sales/salesOrder'
import { ElMessage } from 'element-plus'

const query = ref({
  parentOrderNo: '',
  orderInitNo: ''
})

const historyList = ref([])

const fetchHistory = async () => {
  try {
    const res = await listSalesOrder(query.value)
    historyList.value = res.rows || []
  } catch (e) {
    ElMessage.error('查询失败: ' + e.message)
  }
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
