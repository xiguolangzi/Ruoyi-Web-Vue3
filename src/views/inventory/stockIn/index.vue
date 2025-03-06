<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="入库类型" prop="inType">
        <el-select v-model="queryParams.inType" placeholder="请选择入库类型" clearable>
          <el-option
            v-for="dict in erp_stock_in_type"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="入库单号" prop="inNo">
        <el-input
          v-model="queryParams.inNo"
          placeholder="请输入入库单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="仓库名称" prop="warehouseName">
        <el-input
          v-model="queryParams.warehouseName"
          placeholder="请输入仓库名称"
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
          v-hasPermi="['inventory:stockIn:add']"
          v-if="showOperation"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['inventory:stockIn:edit']"
          v-if="showOperation"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['inventory:stockIn:remove']"
          v-if="showOperation"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['inventory:stockIn:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="stockInList" @selection-change="handleSelectionChange">
      <el-table-column label="序号" align="center" type="index" width="50"/>
      <el-table-column label="入库类型" align="center" prop="inType">
        <template #default="scope">
          <dict-tag :options="erp_stock_in_type" :value="scope.row.inType"/>
        </template>
      </el-table-column>
      <el-table-column label="入库单号" align="center" prop="inNo"  min-width="120" show-overflow-tooltip />
      <el-table-column label="入库时间" align="center" prop="inTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.inTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="仓库" align="center" prop="warehouseForStockInVo.warehouseName" />
      <el-table-column label="总数量" align="center" prop="totalQuantity" />
      <el-table-column label="总金额" align="center" prop="totalAmount" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.totalAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="总费用" align="center" prop="totalCost" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.totalCost) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="showOperation">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['inventory:stockIn:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['inventory:stockIn:remove']">删除</el-button>
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

    <!-- 添加或修改入库单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="stockInRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="入库类型" prop="inType">
          <el-select v-model="form.inType" placeholder="请选择入库类型">
            <el-option
              v-for="dict in erp_stock_in_type"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入库单号" prop="inNo">
          <el-input v-model="form.inNo" placeholder="请输入入库单号" />
        </el-form-item>
        <el-form-item label="入库时间" prop="inTime">
          <el-date-picker clearable
            v-model="form.inTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择入库时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="仓库id" prop="warehouseId">
          <el-input v-model="form.warehouseId" placeholder="请输入仓库id" />
        </el-form-item>
        <el-form-item label="总数量" prop="totalQuantity">
          <el-input v-model="form.totalQuantity" placeholder="请输入总数量" />
        </el-form-item>
        <el-form-item label="总金额" prop="totalAmount">
          <el-input v-model="form.totalAmount" placeholder="请输入总金额" />
        </el-form-item>
        <el-form-item label="总费用" prop="totalCost">
          <el-input v-model="form.totalCost" placeholder="请输入总费用" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-divider content-position="center">入库明细信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddStockInDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteStockInDetail">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="stockInDetailList" :row-class-name="rowStockInDetailIndex" @selection-change="handleStockInDetailSelectionChange" ref="stockInDetail">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column type="序号" align="center" prop="index" width="50"/>
          <el-table-column label="商品ID" prop="skuId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.skuId" placeholder="请输入商品ID" />
            </template>
          </el-table-column>
          <el-table-column label="批次号" prop="batchNo" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.batchNo" placeholder="请输入批次号" />
            </template>
          </el-table-column>
          <el-table-column label="入库数量" prop="quantity" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.quantity" placeholder="请输入入库数量" />
            </template>
          </el-table-column>
          <el-table-column label="单价" prop="unitPrice" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.unitPrice" placeholder="请输入单价" />
            </template>
          </el-table-column>
          <el-table-column label="单体费用" prop="unitExpense" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.unitExpense" placeholder="请输入单体费用" />
            </template>
          </el-table-column>
          <el-table-column label="单体成本" prop="unitCost" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.unitCost" placeholder="请输入单体成本" />
            </template>
          </el-table-column>
          <el-table-column label="总价" prop="totalPrice" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.totalPrice" placeholder="请输入总价" />
            </template>
          </el-table-column>
          <el-table-column label="总费用" prop="totalExpense" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.totalExpense" placeholder="请输入总费用" />
            </template>
          </el-table-column>
          <el-table-column label="总成本" prop="totalCost" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.totalCost" placeholder="请输入总成本" />
            </template>
          </el-table-column>
          <el-table-column label="过期日期" prop="expireDate" width="240">
            <template #default="scope">
              <el-date-picker clearable
                v-model="scope.row.expireDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择过期日期">
              </el-date-picker>
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="StockIn">
import { listStockIn, getStockIn, delStockIn, addStockIn, updateStockIn } from "@/api/inventory/stockIn";
import useUserStore from "@/store/modules/user";
import { ref } from "vue";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { erp_stock_in_type } = proxy.useDict('erp_stock_in_type');

const stockInList = ref([]);
const stockInDetailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedStockInDetail = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
// 控制增删改查的操作
const showOperation = ref(false)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    inType: null,
    inNo: null,
    warehouseName: null,
    tenantId: null
  },
  rules: {
    inType: [
      { required: true, message: "入库类型不能为空", trigger: "change" }
    ],
    inNo: [
      { required: true, message: "入库单号不能为空", trigger: "blur" }
    ],
    inTime: [
      { required: true, message: "入库时间不能为空", trigger: "blur" }
    ],
    warehouseId: [
      { required: true, message: "仓库id不能为空", trigger: "blur" }
    ],
    totalQuantity: [
      { required: true, message: "总数量不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询入库单列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listStockIn(queryParams.value).then(response => {
    stockInList.value = response.rows;
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
    inId: null,
    inType: null,
    inNo: null,
    inTime: null,
    warehouseId: null,
    totalQuantity: null,
    totalAmount: null,
    totalCost: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null
  };
  stockInDetailList.value = [];
  proxy.resetForm("stockInRef");
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
  ids.value = selection.map(item => item.inId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加入库单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _inId = row.inId || ids.value
  getStockIn(_inId).then(response => {
    form.value = response.data;
    stockInDetailList.value = response.data.stockInDetailList;
    open.value = true;
    title.value = "修改入库单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["stockInRef"].validate(valid => {
    if (valid) {
      form.value.stockInDetailList = stockInDetailList.value;
      if (form.value.inId != null) {
        updateStockIn(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStockIn(form.value).then(response => {
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
  const _inIds = row.inId || ids.value;
  proxy.$modal.confirm('是否确认删除入库单编号为"' + _inIds + '"的数据项？').then(function() {
    return delStockIn(_inIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 入库明细序号 */
function rowStockInDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 入库明细添加按钮操作 */
function handleAddStockInDetail() {
  let obj = {};
  obj.skuId = "";
  obj.batchNo = "";
  obj.quantity = "";
  obj.unitPrice = "";
  obj.unitExpense = "";
  obj.unitCost = "";
  obj.totalPrice = "";
  obj.totalExpense = "";
  obj.totalCost = "";
  obj.expireDate = "";
  obj.tenantId = "";
  stockInDetailList.value.push(obj);
}

/** 入库明细删除按钮操作 */
function handleDeleteStockInDetail() {
  if (checkedStockInDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的入库明细数据");
  } else {
    const stockInDetails = stockInDetailList.value;
    const checkedStockInDetails = checkedStockInDetail.value;
    stockInDetailList.value = stockInDetails.filter(function(item) {
      return checkedStockInDetails.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleStockInDetailSelectionChange(selection) {
  checkedStockInDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('inventory/stockIn/export', {
    ...queryParams.value
  }, `stockIn_${new Date().getTime()}.xlsx`)
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
