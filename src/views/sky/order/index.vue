<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="联系名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入联系名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="userType">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="Select" style="width: 240px" clearable>
          <el-option
            v-for="item in orderStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
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
          v-hasPermi="['sky:order:add']"
          v-if="false"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sky:order:edit']"
        >查看订单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sky:order:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sky:order:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单号" align="center" prop="orderNo" />
      <el-table-column label="联系名称" align="center" prop="userName" />
      <el-table-column label="联系方式" align="center" prop="userType" />
      <el-table-column label="备注信息" align="center" prop="userAdress"  show-overflow-tooltip/>
      <el-table-column label="订单总金额" align="center" prop="totalAmount" >
        <template #default="scope">
          <span>{{ scope.row.totalAmount }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="订单总数量" align="center" prop="totalNumber" >
        <template #default="scope">
          <span>{{ scope.row.totalNumber }} </span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus" >
        <template #default="scope">
          <span>{{ orderStatusFormat(scope.row.orderStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" prop="orderTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sky:order:edit']">查看订单</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sky:order:remove']">删除</el-button>
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

    <!-- 添加或修改购物车对话框 -->
    <el-dialog :title="title" v-model="open" width="61.8%" append-to-body>
      <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-form-item label="联系名称" prop="userName">
            <el-input v-model="form.userName" placeholder="请输入联系名称" />
          </el-form-item>
          <el-form-item label="手机号" prop="userType">
            <el-input v-model="form.userType" placeholder="请输入手机号" />
          </el-form-item>
        </el-row>
        <el-form-item label="订单备注" prop="userAdress">
            <el-input v-model="form.userAdress" placeholder="请输入订单备注" style="width: 100%;"/>
          </el-form-item>
        <el-row :gutter="20">
          <el-form-item label="订单号" prop="orderNo">
            <el-input v-model="form.orderNo" placeholder="请输入订单号" />
          </el-form-item>
          <el-form-item label="下单时间" prop="orderTime">
            <el-date-picker clearable
              v-model="form.orderTime"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择下单时间">
            </el-date-picker>
          </el-form-item>
        </el-row>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-radio-group v-model="form.orderStatus">
            <el-radio-button v-for="item in orderStatusOptions" :key="item.value" :label="item.value" >{{ item.label }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        
        <el-divider content-position="center">订单详细信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddTbDishOrderDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteTbDishOrderDetail">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="tbDishOrderDetailList" :row-class-name="rowTbDishOrderDetailIndex" @selection-change="handleTbDishOrderDetailSelectionChange" ref="tbDishOrderDetail">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="产品图片" align="center" prop="dish.image" min-width="80px" fixed="left" >
            <template #default="scope">
              <image-preview :src="scope.row.dish?.image ? scope.row.dish.image : null" :width="50" :height="50" />
            </template>
          </el-table-column>
          <el-table-column label="产品名称" align="center" prop="dish.name" min-width="150px" />
          <el-table-column label="产品编码" align="center" prop="dishId" min-width="80px" >
            <template #default="scope">
              <el-input-number v-model="scope.row.dishId" placeholder="请输入产品编码"  style="width: 100%;" />
            </template>
          </el-table-column>
          <el-table-column label="参考价格" align="center" prop="dish.price" min-width="80px">
            <template #default="scope">
              <span>{{ scope.row.dish?.price }} €</span>
            </template>
          </el-table-column>
          <el-table-column label="单价" align="center" prop="dishPrice" width="150">
            <template #default="scope">
              <el-input-number v-model="scope.row.dishPrice" placeholder="请输入单价" style="width: 100%;" @change="calculateAmount(scope.$index)" />
            </template>
          </el-table-column>
          <el-table-column label="数量" align="center" prop="dishNo" width="130">
            <template #default="scope">
              <el-input-number v-model="scope.row.dishNo" placeholder="请输入数量"  style="width: 100%;" @change="calculateAmount(scope.$index)"/>
            </template>
          </el-table-column>
          <el-table-column label="金额" align="center" prop="amount" width="80">
            <template #default="scope">
              <span>{{ scope.row.amount }} €</span>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <strong>
            <span style="color: #999;">合计金额：</span>
            <span style="color: #f56c6c;">{{ form.totalAmount }} €</span>
          </strong>
          <strong style="margin-left: 20px; margin-right: 20px;">
            <span style="color: #999;">合计数量：</span>
            <span style="color: #f56c6c;">{{ form.totalNumber }} </span>
          </strong>
          <el-button type="primary" @click="submitForm" style="margin-left: 30px;">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, delOrder, addOrder, updateOrder } from "@/api/sky/order";
import { id } from "element-plus/es/locales.mjs";

/** 订单状态 */
const orderStatusOptions = [
  {
    value: 0,
    label: '未发货',
  },
  {
    value: 1,
    label: '已发货',
  },
  {
    value: 2,
    label: '未付款',
  },
  {
    value: 3,
    label: '已付款',
  },
]

const orderStatusFormat = (val) => {
  return orderStatusOptions.find(item => item.value == val)?.label || '--';
}

/** 计算金额 */
const calculateAmount = (index) => {
  const detail = tbDishOrderDetailList.value[index];
  detail.amount = detail.dishPrice * detail.dishNo;
  calculateTotalAmount()
}
/** 计算总金额 */
const calculateTotalAmount = () => {
  form.value.totalAmount = tbDishOrderDetailList.value.reduce((sum, detail) => sum + detail.amount, 0);
  form.value.totalNumber = tbDishOrderDetailList.value.reduce((sum, detail) => sum + detail.dishNo, 0);
}

const { proxy } = getCurrentInstance();

const orderList = ref([]);
const tbDishOrderDetailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedTbDishOrderDetail = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 50,
    userName: null,
    userType: null,
    userAdress: null,
    orderNo: null,
    orderTime: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询购物车列表 */
function getList() {
  loading.value = true;
  listOrder(queryParams.value).then(response => {
    orderList.value = response.rows;
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
    orderId: null,
    userName: null,
    userType: null,
    userAdress: null,
    orderNo: null,
    orderTime: null,
    totalAmount: null,
    totalNumber: null,
    orderStatus:0
  };
  tbDishOrderDetailList.value = [];
  proxy.resetForm("orderRef");
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
  ids.value = selection.map(item => item.orderId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加购物车";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _orderId = row.orderId || ids.value
  getOrder(_orderId).then(response => {
    form.value = response.data;
    tbDishOrderDetailList.value = response.data.tbDishOrderDetailList;
    open.value = true;
    title.value = "修改购物车";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderRef"].validate(valid => {
    if (valid) {
      form.value.tbDishOrderDetailList = tbDishOrderDetailList.value;
      calculateTotalAmount()
      if (form.value.orderId != null) {
        updateOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOrder(form.value).then(response => {
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
  const _orderIds = row.orderId || ids.value;
  proxy.$modal.confirm('是否确认删除购物车编号为"' + _orderIds + '"的数据项？').then(function() {
    return delOrder(_orderIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** ${subTable.functionName}序号 */
function rowTbDishOrderDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** ${subTable.functionName}添加按钮操作 */
function handleAddTbDishOrderDetail() {
  let obj = {};
  obj.detailId = "";
  obj.dishId = "";
  obj.dishPrice = "";
  obj.dishNo = "";
  obj.amount = "";
  obj.dish = {}
  tbDishOrderDetailList.value.push(obj);
  calculateTotalAmount()
}

/** ${subTable.functionName}删除按钮操作 */
function handleDeleteTbDishOrderDetail() {
  if (checkedTbDishOrderDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的${subTable.functionName}数据");
  } else {
    const tbDishOrderDetails = tbDishOrderDetailList.value;
    const checkedTbDishOrderDetails = checkedTbDishOrderDetail.value;
    tbDishOrderDetailList.value = tbDishOrderDetails.filter(function(item) {
      return checkedTbDishOrderDetails.indexOf(item.index) == -1
    });
    calculateTotalAmount()
  
  }
}

/** 复选框选中数据 */
function handleTbDishOrderDetailSelectionChange(selection) {
  checkedTbDishOrderDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sky/order/export', {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

getList();
</script>
