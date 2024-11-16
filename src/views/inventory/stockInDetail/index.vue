<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="入库单ID" prop="inId">
        <el-input
          v-model="queryParams.inId"
          placeholder="请输入入库单ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品ID" prop="skuId">
        <el-input
          v-model="queryParams.skuId"
          placeholder="请输入商品ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="批次号" prop="batchNo">
        <el-input
          v-model="queryParams.batchNo"
          placeholder="请输入批次号"
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
          v-hasPermi="['inventory:stockInDetail:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['inventory:stockInDetail:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['inventory:stockInDetail:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['inventory:stockInDetail:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="stockInDetailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="index" width="50"/>
      <el-table-column label="入库单ID" align="center" prop="inId" />
      <el-table-column label="商品编码" align="center" prop="productSku.skuCode" />
      <el-table-column label="商品规格" align="center" prop="productSku.skuValue" >
        <template #default="scope">
          <div v-for="(item, index) in getSkuValue(scope.row.productSku.skuValue)" :key="index">
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
      <el-table-column label="计量单位" align="center" prop="unit.unitCode" ></el-table-column>
      <el-table-column label="批次号" align="center" prop="batchNo" />
      <el-table-column label="入库数量" align="center" prop="quantity" />
      <el-table-column label="单价" align="center" prop="unitPrice" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.unitPrice) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="单体费用" align="center" prop="unitExpense" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.unitExpense) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="单体成本" align="center" prop="unitCost" >
          <template #default="scope">
            <span> {{ formatTwo(scope.row.unitCost) }} €</span>
          </template>
      </el-table-column>
      <el-table-column label="总价" align="center" prop="totalPrice" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.totalPrice) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="总费用" align="center" prop="totalExpense" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.totalExpense) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="总成本" align="center" prop="totalCost" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.totalCost) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="过期日期" align="center" prop="expireDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expireDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['inventory:stockInDetail:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['inventory:stockInDetail:remove']">删除</el-button>
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

    <!-- 添加或修改入库明细对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="stockInDetailRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="入库单ID" prop="inId">
          <el-input v-model="form.inId" placeholder="请输入入库单ID" />
        </el-form-item>
        <el-form-item label="商品ID" prop="skuId">
          <el-input v-model="form.skuId" placeholder="请输入商品ID" />
        </el-form-item>
        <el-form-item label="批次号" prop="batchNo">
          <el-input v-model="form.batchNo" placeholder="请输入批次号" />
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input v-model="form.quantity" placeholder="请输入入库数量" />
        </el-form-item>
        <el-form-item label="单价" prop="unitPrice">
          <el-input v-model="form.unitPrice" placeholder="请输入单价" />
        </el-form-item>
        <el-form-item label="单体费用" prop="unitExpense">
          <el-input v-model="form.unitExpense" placeholder="请输入单体费用" />
        </el-form-item>
        <el-form-item label="单体成本" prop="unitCost">
          <el-input v-model="form.unitCost" placeholder="请输入单体成本" />
        </el-form-item>
        <el-form-item label="总价" prop="totalPrice">
          <el-input v-model="form.totalPrice" placeholder="请输入总价" />
        </el-form-item>
        <el-form-item label="总费用" prop="totalExpense">
          <el-input v-model="form.totalExpense" placeholder="请输入总费用" />
        </el-form-item>
        <el-form-item label="总成本" prop="totalCost">
          <el-input v-model="form.totalCost" placeholder="请输入总成本" />
        </el-form-item>
        <el-form-item label="过期日期" prop="expireDate">
          <el-date-picker clearable
            v-model="form.expireDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择过期日期">
          </el-date-picker>
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

<script setup name="StockInDetail">
import { listStockInDetail, getStockInDetail, delStockInDetail, addStockInDetail, updateStockInDetail } from "@/api/inventory/stockInDetail";
import useUserStore from "@/store/modules/user";


// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const stockInDetailList = ref([]);
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
    inId: null,
    skuId: null,
    batchNo: null,
    tenantId: null
  },
  rules: {
    inId: [
      { required: true, message: "入库单ID不能为空", trigger: "blur" }
    ],
    skuId: [
      { required: true, message: "商品ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

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

/** 保留2位小数 */
const formatTwo = (value) => {
  // 使用 Number.isFinite 确保是有效的数字
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
};

/** 查询入库明细列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listStockInDetail(queryParams.value).then(response => {
    stockInDetailList.value = response.rows;
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
    id: null,
    inId: null,
    skuId: null,
    batchNo: null,
    quantity: null,
    unitPrice: null,
    unitExpense: null,
    unitCost: null,
    totalPrice: null,
    totalExpense: null,
    totalCost: null,
    expireDate: null,
    tenantId: null
  };
  proxy.resetForm("stockInDetailRef");
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

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加入库明细";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getStockInDetail(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改入库明细";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["stockInDetailRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateStockInDetail(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStockInDetail(form.value).then(response => {
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
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除入库明细编号为"' + _ids + '"的数据项？').then(function() {
    return delStockInDetail(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('inventory/stockInDetail/export', {
    ...queryParams.value
  }, `stockInDetail_${new Date().getTime()}.xlsx`)
}

getList();
</script>
