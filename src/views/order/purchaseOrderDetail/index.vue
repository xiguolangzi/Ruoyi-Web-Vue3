<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品编码" prop="productCode">
        <el-input
          v-model="queryParams.productCode"
          placeholder="请输入商品编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="sku编码" prop="skuCode">
        <el-input
          v-model="queryParams.skuCode"
          placeholder="请输入sku编码"
          clearable
          @keyup.enter="handleQuery"
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
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['order:purchaseOrderDetail:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['order:purchaseOrderDetail:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order:purchaseOrderDetail:remove']"
        >删除</el-button>
      </el-col>
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
      <el-table-column label="主键ID" align="center" prop="detailId" />
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      <el-table-column label="商品名称" align="center" prop="productName" />
      <el-table-column label="商品编码" align="center" prop="productCode" />
      <el-table-column label="sku编码" align="center" prop="skuCode" />
      <el-table-column label="sku属性值" align="center" prop="skuValue" />
      <el-table-column label="采购单价" align="center" prop="unitPrice" />
      <el-table-column label="采购数量" align="center" prop="quantity" />
      <el-table-column label="采购金额" align="center" prop="totalAmount" />
      <el-table-column label="折扣率" align="center" prop="discountRate" />
      <el-table-column label="折扣金额" align="center" prop="discountAmount" />
      <el-table-column label="税率" align="center" prop="taxRate" />
      <el-table-column label="税金金额" align="center" prop="taxAmount" />
      <el-table-column label="采购总金额" align="center" prop="finalAmount" />
      <el-table-column label="缺货数量" align="center" prop="shortageQuantity" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:purchaseOrderDetail:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:purchaseOrderDetail:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改采购订单明细对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="purchaseOrderDetailRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单ID" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单ID" />
        </el-form-item>
        <el-form-item label="订单编号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单编号" />
        </el-form-item>
        <el-form-item label="skuID" prop="skuId">
          <el-input v-model="form.skuId" placeholder="请输入skuID" />
        </el-form-item>
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入商品编码" />
        </el-form-item>
        <el-form-item label="sku编码" prop="skuCode">
          <el-input v-model="form.skuCode" placeholder="请输入sku编码" />
        </el-form-item>
        <el-form-item label="sku属性值" prop="skuValue">
          <el-input v-model="form.skuValue" placeholder="请输入sku属性值" />
        </el-form-item>
        <el-form-item label="采购单价" prop="unitPrice">
          <el-input v-model="form.unitPrice" placeholder="请输入采购单价" />
        </el-form-item>
        <el-form-item label="采购数量" prop="quantity">
          <el-input v-model="form.quantity" placeholder="请输入采购数量" />
        </el-form-item>
        <el-form-item label="采购金额" prop="totalAmount">
          <el-input v-model="form.totalAmount" placeholder="请输入采购金额" />
        </el-form-item>
        <el-form-item label="折扣率" prop="discountRate">
          <el-input v-model="form.discountRate" placeholder="请输入折扣率" />
        </el-form-item>
        <el-form-item label="折扣金额" prop="discountAmount">
          <el-input v-model="form.discountAmount" placeholder="请输入折扣金额" />
        </el-form-item>
        <el-form-item label="税率" prop="taxRate">
          <el-input v-model="form.taxRate" placeholder="请输入税率" />
        </el-form-item>
        <el-form-item label="税金金额" prop="taxAmount">
          <el-input v-model="form.taxAmount" placeholder="请输入税金金额" />
        </el-form-item>
        <el-form-item label="采购总金额" prop="finalAmount">
          <el-input v-model="form.finalAmount" placeholder="请输入采购总金额" />
        </el-form-item>
        <el-form-item label="缺货数量" prop="shortageQuantity">
          <el-input v-model="form.shortageQuantity" placeholder="请输入缺货数量" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PurchaseOrderDetail">
import { listPurchaseOrderDetail, getPurchaseOrderDetail, delPurchaseOrderDetail, addPurchaseOrderDetail, updatePurchaseOrderDetail } from "@/api/order/purchaseOrderDetail";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const purchaseOrderDetailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

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
  rules: {
    orderId: [
      { required: true, message: "订单ID不能为空", trigger: "blur" }
    ],
    skuId: [
      { required: true, message: "skuID不能为空", trigger: "blur" }
    ],
    skuCode: [
      { required: true, message: "sku编码不能为空", trigger: "blur" }
    ],
    quantity: [
      { required: true, message: "采购数量不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

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

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    detailId: null,
    orderId: null,
    orderNo: null,
    skuId: null,
    productName: null,
    productCode: null,
    skuCode: null,
    skuValue: null,
    unitPrice: null,
    quantity: null,
    totalAmount: null,
    discountRate: null,
    discountAmount: null,
    taxRate: null,
    taxAmount: null,
    finalAmount: null,
    shortageQuantity: null,
    tenantId: null
  };
  proxy.resetForm("purchaseOrderDetailRef");
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

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加采购订单明细";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _detailId = row.detailId || ids.value
  getPurchaseOrderDetail(_detailId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改采购订单明细";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["purchaseOrderDetailRef"].validate(valid => {
    if (valid) {
      if (form.value.detailId != null) {
        updatePurchaseOrderDetail(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPurchaseOrderDetail(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _detailIds = row.detailId || ids.value;
  proxy.$modal.confirm('是否确认删除采购订单明细编号为"' + _detailIds + '"的数据项？').then(function() {
    return delPurchaseOrderDetail(_detailIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/purchaseOrderDetail/export', {
    ...queryParams.value
  }, `purchaseOrderDetail_${new Date().getTime()}.xlsx`)
}

getList();
</script>
