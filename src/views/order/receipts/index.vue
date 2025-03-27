<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="入库单号:" prop="receiptsNo">
        <el-input
          v-model="queryParams.receiptsNo"
          placeholder="请输入入库单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="供应商：" prop="supplierId">
        <el-select
          v-model="queryParams.supplierId"
          filterable
          clearable
          placeholder="请选中供应商"
        >
          <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
          <el-option
          v-for="item in supplierList"
          :key="item.supplierId"
          :label="item.supplierName"
          :value="item.supplierId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="receiptsStatus">
        <el-select v-model="queryParams.receiptsStatus" placeholder="请选择订单状态" clearable>
          <el-option
            v-for="dict in erp_receipts_status"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="配送方式" prop="deliveryType">
        <el-select v-model="queryParams.deliveryType" placeholder="请选择配送方式" clearable>
          <el-option
            v-for="dict in erp_delivery_type"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发票号" prop="invoiceNo">
        <el-input
          v-model="queryParams.invoiceNo"
          placeholder="请输入发票号"
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
      <el-form-item label="物流公司" prop="deliveryCompanyId">
        <el-select
          v-model="queryParams.deliveryCompanyId"
          filterable
          clearable
          placeholder="请选中物流公司"
          style="width: 200px"
        >
          <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
          <el-option
          v-for="item in logisticsCompanyList"
          :key="item.companyId"
          :label="item.companyName"
          :value="item.companyId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="物流单号" prop="deliveryNo">
        <el-input
          v-model="queryParams.deliveryNo"
          placeholder="请输入物流单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="货柜编号" prop="containerId">
        <el-select
          v-model="queryParams.containerId"
          filterable
          clearable
          placeholder="请选中货柜"
          style="width: 200px"
        >
          <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
          <el-option
          v-for="item in containerList"
          :key="item.containerId"
          :label="item.containerCode"
          :value="item.containerId"
          />
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 20px;">
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
          v-hasPermi="['order:receipts:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['order:receipts:edit']"
        >编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order:receipts:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:receipts:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>


    <el-table class="table-container" v-loading="loading" :data="receiptsList" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="55"  align="center"/>
      <el-table-column label="入库单号" align="center" prop="receiptsNo" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">
            {{ scope.row.receiptsNo }}
        </span>
        </template>
      </el-table-column>
      <el-table-column label="发票号" align="left" header-align="center" prop="invoiceNo" min-width="120" show-overflow-tooltip />
      <el-table-column label="供应商ID" align="left" header-align="center" prop="supplierId" min-width="120" show-overflow-tooltip>
        <template v-slot="scope">
          {{ getSuppliersName(scope.row.supplierId)}}
        </template>
      </el-table-column>
      <el-table-column label="总条目数" align="right" header-align="center" prop="totalQuantity" min-width="80" show-overflow-tooltip />
      <el-table-column label="订单总金额" align="right" header-align="center" prop="totalPurchaseAmount" min-width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.totalPurchaseAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="折扣总金额" align="right" header-align="center" prop="totalDiscountAmount" min-width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.totalDiscountAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="税金总金额" align="right" header-align="center" prop="totalTaxAmount" min-width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.totalTaxAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="实际总金额" align="right" header-align="center" prop="totalNetAmount" min-width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <span> {{ formatTwo(scope.row.totalNetAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="仓库名称" align="left" header-align="center" prop="warehouseName" min-width="100" show-overflow-tooltip />
      <el-table-column label="订单状态" align="center" prop="receiptsStatus">
        <template #default="scope">
          <dict-tag :options="erp_receipts_status" :value="scope.row.receiptsStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="配送方式" align="center" prop="deliveryType">
        <template #default="scope">
          <dict-tag :options="erp_delivery_type" :value="scope.row.deliveryType"/>
        </template>
      </el-table-column>
      <el-table-column label="物流公司" align="center" prop="deliveryCompanyId" >
        <template #default="scope">
          {{getLogisticsCompanyName(scope.row.deliveryCompanyId)}}
        </template>
      </el-table-column>
      <el-table-column label="物流单号" align="center" prop="deliveryNo" show-overflow-tooltip/>
      <el-table-column label="发货时间" align="center" prop="deliveryTime"  min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.deliveryTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货柜编号" align="center" prop="containerId" show-overflow-tooltip>
        <template #default="scope">
          {{ getContainerCode(scope.row.containerId) }}
        </template>
      </el-table-column>
      <el-table-column label="运费金额" align="right" header-align="center" prop="deliveryAmount" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span> {{ formatTwo(scope.row.deliveryAmount) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="清关费用" align="right" header-align="center" prop="clearanceFee" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span> {{ formatTwo(scope.row.clearanceFee) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="进项税" align="right" header-align="center" prop="vatInput" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span> {{ formatTwo(scope.row.vatInput) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="总成本" align="right" header-align="center" prop="totalAmountCost" min-width="100" show-overflow-tooltip >
        <template #default="scope">
          <span> {{ formatTwo(scope.row.totalAmountCost) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="备注：" align="center" prop="remark" show-overflow-tooltip/>
      <el-table-column label="创建者" align="center" prop="createBy" show-overflow-tooltip/>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" show-overflow-tooltip/>
      <el-table-column label="更新时间" align="center" prop="updateTime" min-width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
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

    <!-- 添加或修改采购入库单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="receiptsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="入库单号" prop="receiptsNo">
          <el-input v-model="form.receiptsNo" placeholder="请输入入库单号" />
        </el-form-item>
        <el-form-item label="供应商ID" prop="supplierId">
          <el-input v-model="form.supplierId" placeholder="请输入供应商ID" />
        </el-form-item>
        <el-form-item label="订单状态" prop="receiptsStatus">
          <el-select v-model="form.receiptsStatus" placeholder="请选择订单状态">
            <el-option
              v-for="dict in erp_receipts_status"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="配送方式" prop="deliveryType">
          <el-select v-model="form.deliveryType" placeholder="请选择配送方式">
            <el-option
              v-for="dict in erp_delivery_type"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物流公司ID" prop="deliveryCompanyId">
          <el-input v-model="form.deliveryCompanyId" placeholder="请输入物流公司ID" />
        </el-form-item>
        <el-form-item label="物流单号" prop="deliveryNo">
          <el-input v-model="form.deliveryNo" placeholder="请输入物流单号" />
        </el-form-item>
        <el-form-item label="发货时间" prop="deliveryTime">
          <el-date-picker clearable
            v-model="form.deliveryTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择发货时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="货柜编号" prop="containerNo">
          <el-input v-model="form.containerNo" placeholder="请输入货柜编号" />
        </el-form-item>
        <el-form-item label="运费金额" prop="deliveryAmount">
          <el-input v-model="form.deliveryAmount" placeholder="请输入运费金额" />
        </el-form-item>
        <el-form-item label="清关费用" prop="clearanceFee">
          <el-input v-model="form.clearanceFee" placeholder="请输入清关费用" />
        </el-form-item>
        <el-form-item label="进项税" prop="vatInput">
          <el-input v-model="form.vatInput" placeholder="请输入进项税" />
        </el-form-item>
        <el-form-item label="订单成本总金额" prop="totalAmountCost">
          <el-input v-model="form.totalAmountCost" placeholder="请输入订单成本总金额" />
        </el-form-item>
        <el-divider content-position="center">采购入库明细信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddErpGoodsReceiptsDetails">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteErpGoodsReceiptsDetails">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="erpGoodsReceiptsDetailsList" :row-class-name="rowErpGoodsReceiptsDetailsIndex" @selection-change="handleErpGoodsReceiptsDetailsSelectionChange" ref="erpGoodsReceiptsDetails">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50"/>
          <el-table-column label="入库单编号" prop="receiptsNo" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.receiptsNo" placeholder="请输入入库单编号" />
            </template>
          </el-table-column>
          <el-table-column label="商品skuID" prop="skuId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.skuId" placeholder="请输入商品skuID" />
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="productName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.productName" placeholder="请输入商品名称" />
            </template>
          </el-table-column>
          <el-table-column label="商品编码" prop="productCode" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.productCode" placeholder="请输入商品编码" />
            </template>
          </el-table-column>
          <el-table-column label="商品sku编码" prop="skuCode" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.skuCode" placeholder="请输入商品sku编码" />
            </template>
          </el-table-column>
          <el-table-column label="sku值" prop="skuValue" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.skuValue" placeholder="请输入sku值" />
            </template>
          </el-table-column>
          <el-table-column label="计量单位ID" prop="skuUnit" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.skuUnit" placeholder="请输入计量单位ID" />
            </template>
          </el-table-column>
          <el-table-column label="采购单价" prop="unitPrice" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.unitPrice" placeholder="请输入采购单价" />
            </template>
          </el-table-column>
          <el-table-column label="采购数量" prop="quantity" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.quantity" placeholder="请输入采购数量" />
            </template>
          </el-table-column>
          <el-table-column label="采购金额" prop="purchaseAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.purchaseAmount" placeholder="请输入采购金额" />
            </template>
          </el-table-column>
          <el-table-column label="折扣率" prop="discountRate" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.discountRate" placeholder="请输入折扣率" />
            </template>
          </el-table-column>
          <el-table-column label="折扣金额" prop="discountAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.discountAmount" placeholder="请输入折扣金额" />
            </template>
          </el-table-column>
          <el-table-column label="税率" prop="taxRate" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.taxRate" placeholder="请输入税率" />
            </template>
          </el-table-column>
          <el-table-column label="税金金额" prop="taxAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.taxAmount" placeholder="请输入税金金额" />
            </template>
          </el-table-column>
          <el-table-column label="实际采购金额" prop="netAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.netAmount" placeholder="请输入实际采购金额" />
            </template>
          </el-table-column>
          <el-table-column label="租户id" prop="tenantId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.tenantId" placeholder="请输入租户id" />
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

<script setup name="Receipts">
import { listReceipts, getReceipts, delReceipts, addReceipts, updateReceipts } from "@/api/order/receipts";
import useUserStore from "@/store/modules/user";
import { useRouter, useRoute } from "vue-router";
import { listContainers } from "@/api/transportation/containers";
import { listLogisticsCompanies} from "@/api/order/logisticsCompanies";
import { listSupplier } from "@/api/order/supplier"
import { ref } from "vue";

// ****************************** 供应商 数据获取 start ******************************
// 供应商 - 初始化列表
const supplierList = ref([])
/** 供应商 - 获取列表 */
const getSuppliers = async () => {
    listSupplier()
      .then(response => {
        supplierList.value = response.rows || []
      })
      .catch(error => {
        ElMessage.error("获取供应商列表时出错:",error)
      })
};

/** 获取供应商名称 */
const getSuppliersName = (id) => {
  return supplierList.value.find(supplier => supplier.supplierId === id)?.supplierName || '--'
 }
 
getSuppliers()

// ****************************** 供应商 数据获取 end ******************************

/** 保留2位小数 */
const formatTwo = (value) => {
  if (value) {
    return value.toFixed(2);
  } else {
    return 0;
  }
};

// ****************************** 货柜 数据获取 start ******************************
const containerList = ref([])
/** 货柜 - 获取列表 */
const getContainerList = async () => {
    listContainers()
      .then(response => {
        containerList.value = response.rows || []
      })
      .catch(error => {
        ElMessage.error("获取货柜列表时出错:",error)
      })
};

/** 获取货柜编码 */
const getContainerCode = (id) => {
  return containerList.value.find(container => container.containerId === id)?.containerCode || '--'
 }
 
getContainerList()

// ****************************** 货柜 数据获取 end ******************************
// ****************************** 物流公司 数据获取 start *****************************
const logisticsCompanyList = ref([]);
// 获取列表
const fetchLogisticsCompany = () => {
    listLogisticsCompanies()
      .then(response => {
        logisticsCompanyList.value = response.rows || [];
      })
      .catch (error => {
        ElMessage.error("获取物流公司列表时出错:",error)
      })
};

/** 获取货柜编码 */
const getLogisticsCompanyName = (id) => {
  return logisticsCompanyList.value.find(company => company.companyId === id)?.companyName || '--'
}

 
fetchLogisticsCompany()

// ****************************** 物流公司 数据获取 end ******************************

// 租户ID字段过滤使用
const userStore = useUserStore();
const router = useRouter();

const { proxy } = getCurrentInstance();
const { erp_delivery_type, erp_receipts_status } = proxy.useDict('erp_delivery_type', 'erp_receipts_status');

const receiptsList = ref([]);
const erpGoodsReceiptsDetailsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const nos = ref([]);
const checkedErpGoodsReceiptsDetails = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    receiptsNo: null,
    supplierId: null,
    receiptsStatus: null,
    deliveryType: null,
    deliveryCompanyId: null,
    deliveryNo: null,
    containerNo: null,
    invoiceNo: null,
    warehouseName: null,
    tenantId: null,
  },
  rules: {
    supplierId: [
      { required: true, message: "供应商ID不能为空", trigger: "blur" }
    ],
    deliveryType: [
      { required: true, message: "配送方式不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询采购入库单列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listReceipts(queryParams.value).then(response => {
    receiptsList.value = response.rows;
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
    receiptsId: null,
    receiptsNo: null,
    supplierId: null,
    totalPurchaseAmount: null,
    totalDiscountAmount: null,
    totalTaxAmount: null,
    totalNetAmount: null,
    receiptsStatus: null,
    receivedTime: null,
    deliveryType: null,
    deliveryCompanyId: null,
    deliveryNo: null,
    deliveryTime: null,
    containerNo: null,
    deliveryAmount: null,
    clearanceFee: null,
    vatInput: null,
    totalAmountCost: null,
    delFlag: null,
    tenantId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  erpGoodsReceiptsDetailsList.value = [];
  proxy.resetForm("receiptsRef");
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
  ids.value = selection.map(item => item.receiptsId);
  nos.value = selection.map(item => item.receiptsNo);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  const obj = {path: "/order/receipts/edit", name:"editReceipts"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/order/receipts/edit" })
    } 
  )
  
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const _receiptsId = row.receiptsId || ids.value
  const obj = {path: "/order/receipts/edit", name:"editReceipts"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/order/receipts/edit", query: { receiptsId: _receiptsId } });
    } 
  )
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["receiptsRef"].validate(valid => {
    if (valid) {
      form.value.erpGoodsReceiptsDetailsList = erpGoodsReceiptsDetailsList.value;
      if (form.value.receiptsId != null) {
        updateReceipts(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addReceipts(form.value).then(response => {
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
  const _receiptsIds = row.receiptsId || ids.value;
  const _receiptsNos = row.receiptsNo || nos.value;
  proxy.$modal.confirm('是否确认删除采购入库单编号为"' + _receiptsNos + '"的数据项？').then(function() {
    return delReceipts(_receiptsIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 采购入库明细序号 */
function rowErpGoodsReceiptsDetailsIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 采购入库明细添加按钮操作 */
function handleAddErpGoodsReceiptsDetails() {
  let obj = {};
  obj.receiptsNo = "";
  obj.skuId = "";
  obj.productName = "";
  obj.productCode = "";
  obj.skuCode = "";
  obj.skuValue = "";
  obj.skuUnit = "";
  obj.unitPrice = "";
  obj.quantity = "";
  obj.purchaseAmount = "";
  obj.discountRate = "";
  obj.discountAmount = "";
  obj.taxRate = "";
  obj.taxAmount = "";
  obj.netAmount = "";
  obj.tenantId = "";
  erpGoodsReceiptsDetailsList.value.push(obj);
}

/** 采购入库明细删除按钮操作 */
function handleDeleteErpGoodsReceiptsDetails() {
  if (checkedErpGoodsReceiptsDetails.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的采购入库明细数据");
  } else {
    const erpGoodsReceiptsDetailss = erpGoodsReceiptsDetailsList.value;
    const checkedErpGoodsReceiptsDetailss = checkedErpGoodsReceiptsDetails.value;
    erpGoodsReceiptsDetailsList.value = erpGoodsReceiptsDetailss.filter(function(item) {
      return checkedErpGoodsReceiptsDetailss.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleErpGoodsReceiptsDetailsSelectionChange(selection) {
  checkedErpGoodsReceiptsDetails.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/receipts/export', {
    ...queryParams.value
  }, `receipts_${new Date().getTime()}.xlsx`)
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
