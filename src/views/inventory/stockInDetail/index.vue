<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="入库单号" prop="inNo">
        <el-input
          v-model="queryParams.inNo"
          placeholder="请输入入库单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="skuName">
        <el-input
          v-model="queryParams.skuName"
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
      <el-form-item label="SKU编码" prop="skuCode">
        <el-input
          v-model="queryParams.skuCode"
          placeholder="请输入SKU编码"
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
          v-hasPermi="['inventory:stockInDetail:edit']"
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
          v-hasPermi="['inventory:stockInDetail:remove']"
          v-if="showOperation"
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
      <el-table-column label="序号" align="center" type="index" width="50"/>
      <el-table-column label="入库单号" align="center" prop="inNo"  min-width="150" show-overflow-tooltip />
      <el-table-column label="SKU名称" align="center" >
        <template #default="scope">
          <span> {{ scope.row.productSkuVo?.skuName || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="SKU编码" align="center"  min-width="120" show-overflow-tooltip>
        <template v-slot="scope">
          <el-popover trigger="hover" placement="left">
            <image-preview :src="scope.row.productSkuVo?.skuImage" :width="60" :height="60" />
            <template #reference>
              <el-link type="primary" :underline="false">{{ scope.row.productSkuVo?.skuCode || '--' }}</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="SKU规格" align="left" header-align="center" >
        <template #default="scope">
          <div v-if="getSkuValue(scope.row.productSkuVo?.skuValue) === 'default'">
            --  <!-- 直接显示默认 SKU -->
          </div>
          <div v-else v-for="(item, index) in getSkuValue(scope.row.productSkuVo?.skuValue)" :key="index">
            <strong>{{ item[0] }}:</strong>
            <span>{{ item[1] }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="计量单位" align="center" >
        <template #default="scope">
          <span> {{ scope.row.unitVo?.unitCode || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="批次号" align="left" header-align="center" prop="batchNo" />
      <el-table-column label="入库数量" align="center" prop="quantity" />
      <el-table-column label="单价" align="right" header-align="center" prop="unitPrice" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.unitPrice) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="单体费用" align="right" header-align="center" prop="unitExpense" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.unitExpense) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="单体成本" align="right" header-align="center" prop="unitCost" >
          <template #default="scope">
            <span> {{ formatTwo(scope.row.unitCost) }} €</span>
          </template>
      </el-table-column>
      <el-table-column label="总价" align="right" header-align="center" prop="totalPrice" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.totalPrice) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="总费用" align="right" header-align="center" prop="totalExpense" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.totalExpense) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="总成本" align="right" header-align="center" prop="totalCost" >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.totalCost) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="过期日期" align="center" prop="expireDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expireDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="showOperation">
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
import { useRouter, useRoute } from "vue-router";

const route = useRoute();


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
// 增删改查按钮控制
const showOperation = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    inId: null,
    inNo: null,
    skuId: null,
    skuName: null,
    productCode: null,
    skuCode: null,
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
