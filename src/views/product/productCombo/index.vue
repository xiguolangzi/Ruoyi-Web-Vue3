<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="套餐编码" prop="comboCode">
        <el-input v-model="queryParams.comboCode" placeholder="请输入套餐编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="套餐名称1" prop="name1">
        <el-input v-model="queryParams.name1" placeholder="请输入套餐名称1" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="套餐状态" prop="comboStatus">
        <el-select v-model="queryParams.comboStatus" placeholder="请选择套餐状态" clearable>
          <el-option v-for="dict in sys_tenant_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['product:productCombo:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['product:productCombo:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['product:productCombo:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['product:productCombo:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productComboList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" width="50" />
      <el-table-column label="套餐编码" align="center" prop="comboCode" />
      <el-table-column label="套餐名称1" align="center" prop="name1" show-overflow-tooltip />
      <el-table-column label="套餐名称2" align="center" prop="name2" show-overflow-tooltip />
      <el-table-column label="套餐名称3" align="center" prop="name3" show-overflow-tooltip />
      <el-table-column label="套餐价格" align="center" prop="comboPrice" />
      <el-table-column label="套餐折扣" align="center" prop="comboDiscountRate" />
      <el-table-column label="套餐状态" align="center" prop="comboStatus">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.comboStatus" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="修改时间" align="center" prop="updateTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改人" align="center" prop="updateBy" />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['product:productCombo:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['product:productCombo:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改商品套餐对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-tabs v-model="activeTab">
        <!-- 基础信息 -->
        <el-tab-pane label="基础信息" name="basic">
          <el-form ref="productComboRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="套餐编码:" prop="comboCode">
              <el-input v-model="form.comboCode" placeholder="请输入套餐编码" />
            </el-form-item>
            <el-form-item label="套餐名称1:" prop="name1">
              <el-input v-model="form.name1" placeholder="请输入套餐名称1" type="textarea" maxlength="50" show-word-limit
                :rows="1" />
            </el-form-item>
            <el-row>
              <el-col :span="12">
                <el-form-item label="套餐名称2:" prop="name2">
                  <el-input v-model="form.name2" placeholder="请输入套餐名称2" type="textarea" maxlength="50" show-word-limit
                    :rows="1" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="套餐名称3:" prop="name3">
                  <el-input v-model="form.name3" placeholder="请输入套餐名称3" type="textarea" maxlength="50" show-word-limit
                    :rows="1" />
                </el-form-item>
              </el-col>


            </el-row>

            <el-row>
              <el-form-item label="套餐价格1:" prop="comboPrice1">
                <el-input-number v-model="form.comboPrice1" placeholder="套餐价格" :max='99999' :min='0' :precision='2'
                  :controls="false" ref="inputNumber1" @focus="handleFocus1">
                  <template #suffix>
                    <span>€</span>
                  </template>
                </el-input-number>
              </el-form-item>
              <el-form-item label="套餐价格2:" prop="comboPrice2">
                <el-input-number v-model="form.comboPrice2" placeholder="套餐价格" :max='99999' :min='0' :precision='2'
                  :controls="false" ref="inputNumber2" @focus="handleFocus2">
                  <template #suffix>
                    <span>€</span>
                  </template>
                </el-input-number>
              </el-form-item>
              <el-form-item label="套餐价格3:" prop="comboPrice3">
                <el-input-number v-model="form.comboPrice3" placeholder="套餐价格" :max='99999' :min='0' :precision='2'
                  :controls="false" ref="inputNumber3" @focus="handleFocus3">
                  <template #suffix>
                    <span>€</span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-row>
            <el-form-item label="套餐状态:" prop="comboStatus">
              <el-radio-group v-model="form.comboStatus">
                <el-radio v-for="dict in sys_tenant_status" :key="dict.value" :label="dict.value" :value="dict.value">{{
                  dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="备注描述:" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" maxlength="50"
                show-word-limit />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 套餐项 -->
        <el-tab-pane label="套餐项" name="items">
          <el-card v-for="(item, index) in form.comboItem" :key="index" class="mb-4">
            <el-row>
              <el-form-item label="名称1:">
                <el-input v-model="item.name1" placeholder="请输入名称1" />
              </el-form-item>
              <el-form-item label="名称2:" style="margin-left: 10px;">
                <el-input v-model="item.name2" placeholder="请输入名称2" />
              </el-form-item>
              <el-form-item label="名称3:" style="margin-left: 10px;">
                <el-input v-model="item.name3" placeholder="请输入名称3" />
              </el-form-item>
            </el-row>

            <el-row>
              <el-form-item label="是否可选项:" style="margin-right: 20px;">
                <el-radio-group v-model="item.isOptional" disabled>
                  <el-radio v-for="dict in erp_product_combo_optional" :key="dict.value" :label="dict.value"
                    :value="dict.value">{{ dict.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="可选数量:" style="margin-right: 20px;" v-if="item.isOptional != '1'">
                <el-input-number v-model="item.isOptionalQuantity" :min="0" />
              </el-form-item>
            </el-row>



            <!-- SKU 详情 -->
            <el-divider content-position="left">
              <span>SKU 详情</span>
            </el-divider>
            <el-table :data="item.itemDetail" border style="width: 100%" ref="itemDetail"
              :summary-method="getSummaryRow" show-summary>
              <el-table-column label="SKU 条码" prop="skuId" align="center" min-width="120px">
                <template #default="scope">
                  <el-select-v2 v-model="scope.row.skuId" filterable :options="formattedSkuList"
                    placeholder="请输入 SKU Code" style="width: 100%" @change="handleSkuChange(scope.row)"
                    :fit-input-width="false" />
                </template>
              </el-table-column>
              <el-table-column label="SKU 名称" prop="productName" align="center" show-overflow-tooltip />
              <el-table-column label="SKU 规格" align="center" prop="skuValue" show-overflow-tooltip>
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
              <el-table-column label="单价" prop="skuPrice1" align="center" min-width="50px">
                <template #default="scope">
                  <span>{{ formatTwo(scope.row.skuPrice1) }} € </span>
                </template>
              </el-table-column>
              <el-table-column label="数量" prop="quantity" align="center" min-width="50px">
                <template #default="scope">
                  <el-input-number :ref="(el) => setInputRef(el, scope.$index, 'quantity')" v-model="scope.row.quantity"
                    placeholder="发生额" :max='99999999' :min='0' :controls="false" style="width: 100%;"
                    @focus="handleFocus(scope.$index, 'quantity')" @click="handleFocus(scope.$index, 'quantity')"
                    @change="calculateDetailAmount(scope.row)" />

                </template>
              </el-table-column>
              <el-table-column label="金额" prop="detailAmount" align="center">
                <template #default="scope">
                  <span>{{ formatTwo(scope.row.detailAmount) }} € </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button type="danger" size="small" @click="removeSkuDetail(index, scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-button type="primary" @click="addSkuDetail(index)" v-if="item.itemDetail.length < 10">添加 SKU</el-button>
            <el-button type="danger" @click="removeComboItem(index)">删除套餐项</el-button>
          </el-card>

          <el-button type="primary" @click="addComboItem" style="margin-top: 10px;"
            v-if="form.comboItem.length < 5">新增套餐项</el-button>
        </el-tab-pane>
      </el-tabs>


      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ProductCombo">
import { listProductCombo, getProductCombo, delProductCombo, addProductCombo, updateProductCombo } from "@/api/product/productCombo";
import useUserStore from "@/store/modules/user";
import AddItem from '@/components/AddItem';
import { computed } from "vue";
import { listSkuByAddOrder, selectStockBySkuId } from "@/api/product/sku"

const { proxy } = getCurrentInstance();
const { sys_tenant_status, erp_product_combo_optional } = proxy.useDict('sys_tenant_status', 'erp_product_combo_optional');

// 租户ID字段过滤使用
const userStore = useUserStore();

const productComboList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const activeTab = ref('basic'); // 当前激活的标签页

const data = reactive({
  form: {
    comboItem: []
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    comboCode: null,
    name1: null,
    comboStatus: null,
    tenantId: null,
  },
  rules: {
    comboCode: [{ required: true, message: '套餐编码不能为空', trigger: 'blur' }],
    name1: [{ required: true, message: '套餐名称1不能为空', trigger: 'blur' }],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询商品套餐列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listProductCombo(queryParams.value).then(response => {
    productComboList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// --------------------- 1 表单 输入框聚焦选中 start ---------------
const inputNumber1 = ref({}); // 使用对象存储各列引用
const inputNumber2 = ref({});
const inputNumber3 = ref({});
// 聚焦时选中内容
const handleFocus1 = () => {
  const input = inputNumber1.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};
const handleFocus2 = () => {
  const input = inputNumber2.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};

const handleFocus3 = () => {
  const input = inputNumber3.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};

// ---------------------- 1 表单 输入框聚焦选中 end ------------------

// ********************** 2 基础数据 start **************************
const addComboItem = () => {
  form.value.comboItem.push({
    itemId: null,
    comboId: null,
    name1: null,
    name2: null,
    name3: null,
    isOptional: '2',
    isOptionalQuantity: 1,
    itemDetail: [{
      detailId: null,
      itemId: null,
      skuId: null,
      skuCode: null,
      productName: null,
      skuValue: null,
      skuPrice1: 0.00,
      quantity: 0,
      detailAmount: 0.00
    },]
  });
};

const removeComboItem = (index) => {
  form.value.comboItem.splice(index, 1);
};

const addSkuDetail = (itemIndex) => {
  form.value.comboItem[itemIndex].itemDetail.push({
    detailId: null,
    itemId: null,
    skuId: null,
    skuCode: null,
    productName: null,
    skuValue: null,
    skuPrice1: 0.00,
    quantity: 0,
    detailAmount: 0.00
  });
};

const removeSkuDetail = (itemIndex, detailIndex) => {
  form.value.comboItem[itemIndex].itemDetail.splice(detailIndex, 1);
};


// *********************** 2 基础数据 end ***************************

// ---------------------- 3 弹窗 表格样式 start ----------------------------
/** 合计行 */
const getSummaryRow = (param) => {
  const { columns, data } = param
  const sums = []

  columns.forEach((column, index) => {
    // 只计算特定列
    if (column.property === 'quantity') {
      // 计算借方总金额
      const quantity = data.reduce((sum, item) => {
        const value = Number(item.quantity)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${quantity} `
    } else if (column.property === 'detailAmount') {
      // 计算借方总金额
      const detailAmount = data.reduce((sum, item) => {
        const value = Number(item.detailAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${detailAmount.toFixed(2) }` + ' € '
    } else {
      // 其他列显示"合计"或留空
      sums[index] = column.property === 'skuPrice1' ? '合计 :' : ''
    }
  })

  return sums
}

// -----3.1表格 输入框聚焦选中 start -------
const inputRefs = ref({}); // 使用对象存储各列引用
// 动态管理每列引用
const setInputRef = (el, rowIndex, column) => {
  if (!inputRefs.value[column]) {
    inputRefs.value[column] = [];
  }
  inputRefs.value[column][rowIndex] = el;
};

// 聚焦时选中内容
const handleFocus = (rowIndex, column) => {
  const inputEl = inputRefs.value[column]?.[rowIndex]?.$el.querySelector('input');
  if (inputEl) {
    inputEl.select(); // 选中输入框内容
  }
};

// -----3.1表格 输入框聚焦选中 end -------
// ---------------------- 3 弹窗 表格样式 end ----------

// ********************* 4 弹窗 计算合计金额 start ***************************
const calculateDetailAmount = (row) => {
  row.detailAmount = row.quantity * row.skuPrice1;
};



// ********************* 4 弹窗 计算合计金额 end ***************************

// ---------------------- 5 获取SKU start ----------------------------
// 商品 - 初始化商品列表
const skuList = ref([])
/** 商品 - 获取列表 */
const getSkuList = () => {
  listSkuByAddOrder().then(response => {
    skuList.value = response.rows || []
  }).catch(error => {
    console.error("获取SKU列表失败：", error);
  })
}

getSkuList()

// 格式化 SKU 列表，用于 el-select-v2 的 options
const formattedSkuList = computed(() => {
  return skuList.value.map((sku) => ({
    value: sku.skuId, // SKU ID
    label: `${sku.skuCode} - ${sku.productName} - ${sku.skuValue}`, // 显示 SKU Code 和 Name
  }));
});

// 处理 SKU 选择事件
const handleSkuChange = (row) => {
  const selectedSku = skuList.value.find((sku) => sku.skuId === row.skuId);
  if (selectedSku) {
    row.skuPrice1 = selectedSku.skuPrice1; // 自动填充 SKU 价格
    row.productName = selectedSku.productName;
    row.skuValue = selectedSku.skuValue;
    row.quantity = 0;
    row.detailAmount = 0;
  }
};


// ---------------------- 5 获取SKU end ----------------------------

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    comboId: null,
    comboCode: null,
    name1: null,
    name2: null,
    name3: null,
    comboPrice1: 0.00,
    comboPrice2: 0.00,
    comboPrice3: 0.00,
    comboStatus: '0',
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    remark: null,
    tenantId: null,
    delFlag: null,
    comboItem: [{
      itemId: null,
      comboId: null,
      name1: null,
      name2: null,
      name3: null,
      isOptional: '1',
      isOptionalQuantity: null,
      itemDetail: [{
        detailId: null,
        itemId: null,
        skuId: null,
        skuCode: null,
        productName: null,
        skuValue: null,
        skuPrice1: 0.0,
        quantity: 0
      },]
    }]
  };
  proxy.resetForm("productComboRef");
  activeTab.value = 'basic'
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
  ids.value = selection.map(item => item.comboId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加商品套餐";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _comboId = row.comboId || ids.value
  getProductCombo(_comboId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改商品套餐";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productComboRef"].validate(valid => {
    if (valid) {
      if (form.value.comboId != null) {
        updateProductCombo(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProductCombo(form.value).then(response => {
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
  const _comboIds = row.comboId || ids.value;
  proxy.$modal.confirm('是否确认删除商品套餐编号为"' + _comboIds + '"的数据项？').then(function() {
    return delProductCombo(_comboIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('product/productCombo/export', {
    ...queryParams.value
  }, `productCombo_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style lang="scss" scoped>

</style>
