<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-row :gutter="20">
        <el-form-item label="入库单号:" prop="receiptsNo">
          <el-input
            v-model="queryParams.receiptsNo"
            placeholder="请输入入库单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="采购订单:" prop="purchaseOrderNo">
          <el-input
            v-model="queryParams.purchaseOrderNo"
            placeholder="请输入采购订单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="sku编码:" prop="skuCode">
          <el-input
            v-model="queryParams.skuCode"
            placeholder="请输入sku编码或商品编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="商品名称:" prop="skuName">
          <el-input
            v-model="queryParams.skuName"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-row>    
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:receiptsDetails:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="receiptsDetailsList" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="55"  align="center"/>
      <el-table-column label="入库单号" align="center" prop="receiptsNo" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">
            {{ scope.row.receiptsNo }}
        </span>
        </template>
      </el-table-column>
      <el-table-column label="采购订单" align="left" header-align="center" prop="purchaseOrderNo" min-width="100" show-overflow-tooltip/>
      <el-table-column label="商品编码" align="left" header-align="center" prop="productCode" min-width="100" show-overflow-tooltip/>
      <el-table-column label="商品名称" align="left" header-align="center" prop="skuName" min-width="100" show-overflow-tooltip/> 
      <el-table-column label="sku编码" align="left" header-align="center" prop="skuCode" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <el-popover trigger="hover" placement="left">
            <image-preview :src="scope.row.skuImage" :width="60" :height="60" />
            <template #reference>
              <el-link type="primary" :underline="false">{{ scope.row.skuCode }}</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="sku值" align="center" min-width="100" show-overflow-tooltip>
         <template #default="scope">
          <div v-if="getSkuValue(scope.row.skuValue) === 'default'">
            --  <!-- 直接显示默认 SKU -->
          </div>
          <div v-else v-for="(item, index) in getSkuValue(scope.row.skuValue)" :key="index">
            <strong>{{ item[0] }}:</strong>
            <span>{{ item[1] }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="计量单位" align="center" prop="unitVo.skuUnit" >
         <template #default="scope">
            {{scope.row.unitCode || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="入库数量" align="center" prop="receivedQuantity" />
      <el-table-column label="采购单价" align="right" header-align="center" prop="unitPrice" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span> {{ formatTwo(scope.row.unitPrice) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="采购金额" align="right" header-align="center" prop="purchaseAmount" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span> {{ formatTwo(scope.row.purchaseAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="折扣率" align="right" header-align="center" prop="discountRate"  show-overflow-tooltip>
        <template #default="scope">
          <span v-if="scope.row.discountRate"> {{ scope.row.discountRate }} %</span>
          <span v-if="!scope.row.discountRate"> -- %</span>
        </template>
      </el-table-column>
      <el-table-column label="折扣金额" align="right" header-align="center" prop="discountAmount" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span> {{ formatTwo(scope.row.discountAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="税率" align="right" header-align="center" prop="taxRate" show-overflow-tooltip  >
        <template #default="scope">
          <span v-if="scope.row.taxRate"> {{ scope.row.taxRate }} %</span>
          <span v-if="!scope.row.taxRate"> -- %</span>
        </template>
      </el-table-column>
      <el-table-column label="税金金额" align="right" header-align="center" prop="taxAmount" min-width="100" show-overflow-tooltip >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.taxAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="实际金额" align="right" header-align="center" prop="netAmount" min-width="100" show-overflow-tooltip >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.netAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="采购订单的数量" align="center" prop="quantity" />
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

<script setup name="ReceiptsDetails">
import { listReceiptsDetails } from "@/api/order/receiptsDetails";
import useUserStore from "@/store/modules/user";
import { useRouter, useRoute } from "vue-router";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const receiptsDetailsList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    receiptsId: null,
    purchaseOrderId: null,
    skuId: null,
    skuName: null,
    productCode: null,
    skuCode: null,
    tenantId: null,
  },
});

const { queryParams } = toRefs(data);

/** 修改按钮操作 */
const router = useRouter();
function handleUpdate(row) {
  const _receiptsId = row.receiptsId || ids.value
  const obj = {path: "/order/receipts/edit", name:"editReceipts"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/order/receipts/edit", query: { receiptsId: _receiptsId } });
    } 
  )
}

/** 查询采购入库明细列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listReceiptsDetails(queryParams.value).then(response => {
    receiptsDetailsList.value = response.rows;
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
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}


/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/receiptsDetails/export', {
    ...queryParams.value
  }, `receiptsDetails_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style lang="scss" scoped>
.app-container {
  height: 100%; /* 确保父容器高度充满 */
  display: flex;
  flex-direction: column;
}

.table-container {
  flex-grow: 1; /* 表格区域充满剩余空间 */
  display: flex;
  flex-direction: column;
}

.el-table {
  flex-grow: 1; /* 表格充满剩余空间 */
}

.pagination {
  flex-shrink: 0; /* 分页栏固定在底部 */
  margin-top: auto; /* 将分页栏推到容器底部 */
}
</style>
