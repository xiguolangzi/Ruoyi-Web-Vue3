<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter="handleQuery"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item label="商品编码" prop="productCode">
        <el-input
          v-model="queryParams.productCode"
          placeholder="请输入商品编码"
          clearable
          @keyup.enter="handleQuery"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item label="sku编码" prop="skuCode">
        <el-input
          v-model="queryParams.skuCode"
          placeholder="请输入sku编码"
          clearable
          @keyup.enter="handleQuery"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:purchaseOrderDetail:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="purchaseOrderDetailList" @selection-change="handleSelectionChange">

      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="55"  align="center"/>
      <el-table-column label="订单编号" align="center" prop="orderNo" min-width="150" show-overflow-tooltip >
        <template v-slot="scope">
          <router-link :to="'/order/purchaseOrder/edit?orderId=' + scope.row.orderId" class="link-type">
            <span>{{ scope.row.orderNo }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" prop="productName"  min-width="150" show-overflow-tooltip/>
      <!-- <el-table-column label="商品编码" align="center" prop="productCode" min-width="150" show-overflow-tooltip/> -->
      <el-table-column label="sku编码" align="center" prop="skuCode" min-width="150" show-overflow-tooltip/>
      <el-table-column label="suk属性值" align="center" prop="skuValue" show-overflow-tooltip>
        <template #default="scope">
          <div v-for="(item, index) in getSkuValue(scope.row.skuValue)" :key="index">
            <strong v-if="item[0] !== '' && item[0] !== 'skuName'">
              {{ item[0] }}:
            </strong>
            <span v-if="item[0] !== '' && item[1] !== 'skuValue'">
              {{ item[1] }}
            </span>
            <span v-if="item[0] == '' || item[0] == 'skuName'"> -- -- </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="采购单价" align="right" header-align="center" prop="unitPrice" >
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.unitPrice) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="采购数量" align="center" prop="quantity" />
      <el-table-column label="采购金额" align="right" header-align="center" prop="purchaseAmount" >
        <template  v-slot="scope">
          <span> {{ formatTwo(scope.row.purchaseAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="折扣率" align="right" header-align="center" prop="discountRate">
        <template  v-slot="scope">
          <span v-if="scope.row.discountRate"> {{ scope.row.discountRate }} %</span>
          <span v-if="!scope.row.discountRate"> -- %</span>
        </template>
      </el-table-column>
      <el-table-column label="折扣金额" align="right" header-align="center" prop="discountAmount" >
        <template  v-slot="scope">
          <span> {{ formatTwo(scope.row.discountAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="税率" align="right" header-align="center" prop="taxRate" >
        <template  v-slot="scope">
          <span v-if="scope.row.taxRate"> {{ scope.row.taxRate }} %</span>
          <span v-if="!scope.row.taxRate"> -- %</span>
        </template>
      </el-table-column>
      <el-table-column label="税金金额" align="right" header-align="center" prop="taxAmount" >
        <template  v-slot="scope">
          <span> {{ formatTwo(scope.row.taxAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="实际采购金额" align="right" header-align="center" prop="netAmount" min-width="100" show-overflow-tooltip>
        <template  v-slot="scope">
          <span> {{ formatTwo(scope.row.netAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="缺货数量" align="center" prop="shortageQuantity" />
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script setup name="PurchaseOrderDetail">
import { listPurchaseOrderDetail } from "@/api/order/purchaseOrderDetail";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const purchaseOrderDetailList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: null,
    orderNo: null,
    skuId: null,
    productName: null,
    productCode: null,
    skuCode: null,
    tenantId: null
  },
});

const { queryParams, form } = toRefs(data);

/** 查询采购订单明细列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listPurchaseOrderDetail(queryParams.value).then(response => {
    purchaseOrderDetailList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.detailId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/purchaseOrderDetail/export', {
    ...queryParams.value
  }, `purchaseOrderDetail_${new Date().getTime()}.xlsx`)
}

/** 保留2位小数 */
const formatTwo = (value) => {
  if (value) {
    return value.toFixed(2);
  } else {
    return 0;
  }
};

/**  skuValue 转化成表格数据 */
const getSkuValue = (skuValue) => {
  if (!skuValue) {
    return [];
  }

  let paramsSkuValue;
  try {
    paramsSkuValue = JSON.parse(skuValue);
  } catch (error) {
    // 如果解析失败，返回空数组或进行其他处理
    console.warn('Invalid JSON string:', skuValue);
    return [];
  }

  if (!paramsSkuValue || typeof paramsSkuValue !== 'object') {
    return [];
  }

  // 将 paramsSkuValue 转化成 [["型号","AA"] , ["尺寸","SS"]]
  const tableData = ref(Object.entries(paramsSkuValue));
  return tableData.value;
};

getList();
</script>
