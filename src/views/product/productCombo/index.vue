<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="套餐编码:" prop="comboCode">
        <el-input v-model="queryParams.comboCode" placeholder="请输入套餐编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="套餐名称:" prop="comboName">
        <el-input v-model="queryParams.comboName" placeholder="请输入套餐名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="套餐状态:" prop="comboStatus">
        <el-select v-model="queryParams.comboStatus" placeholder="请选择套餐状态" clearable>
          <el-option v-for="dict in sys_tenant_status" :key="dict.value" :label="dict.label" :value="Number(dict.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="套餐税率:" prop="rateId">
        <el-select v-model="queryParams.rateId" placeholder="请选择税率" clearable>
          <el-option v-for="items in rateList" :key="items.rateId" :label="items.rateValue + '%'"
            :value="items.rateId" />
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

    <el-table class="table-container" v-loading="loading" :data="productComboList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="套餐图片" align="center" :width="88" show-overflow-tooltip>
        <template #default="scope">
          <image-preview :src="scope.row.comboImage" :width="60" :height="60" />
        </template>
      </el-table-column>
      <el-table-column label="套餐编码" align="center" prop="comboCode" />
      <el-table-column label="套餐名称" align="left" header-align="center" show-overflow-tooltip >
        <template #default="scope">
          <div>
            <strong> 主名称：</strong>
            <span>{{ scope.row.comboName }}</span>
          </div>
          <div>
            <strong> 辅助名：</strong>
            <span>{{ scope.row.assistName }}</span>
          </div>
        </template>
     </el-table-column>
      <el-table-column label="套餐价格" align="center" prop="comboPrice">
        <template #default="scope">
          <span>{{ formatTwo(scope.row.comboPrice) }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="税率" align="center" prop="productRateVo.rateValue" width="80">
        <template #default="scope">
          <span>{{ scope.row.productRateVo?.rateValue || '--' }} %</span>
        </template>
      </el-table-column>
      <el-table-column label="套餐状态" align="center" prop="comboStatus">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.comboStatus" />
        </template>
      </el-table-column>
      <el-table-column label="创建信息" align="left" header-align="center" show-overflow-tooltip>
        <template #default="scope">
          <div>
            <strong> 创建人：</strong>
            <span>{{ scope.row.createBy }}</span>
          </div>
          <div> 
             <strong> 时间：</strong>
             <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="修改信息" align="left" header-align="center" show-overflow-tooltip>
        <template #default="scope">
          <div> 
            <strong> 修改人：</strong>
            <span>{{ scope.row.updateBy }}</span>
          </div>
          <div> 
            <strong> 时间：</strong>
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="left" header-align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" :width="130" fixed="right">
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
    <el-dialog :title="title" v-model="open" width="900px" append-to-body :close-on-click-modal="false">
      <el-tabs v-model="activeTab" type="border-card" :before-leave="beforeLeave">
        <!-- 基础信息 -->
        <el-tab-pane label="基础信息" name="basic">
          <el-form ref="productComboRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="套餐编码:" prop="comboCode">
              <el-input v-model="form.comboCode" placeholder="请输入套餐编码" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="套餐名称:" prop="comboName">
                  <el-input v-model="form.comboName" placeholder="请输入套餐名称" type="textarea" maxlength="50"
                    show-word-limit :rows="1" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="辅助名称:" prop="assistName">
                  <el-input v-model="form.assistName" placeholder="请输入辅助名称" type="textarea" maxlength="50"
                    show-word-limit :rows="1" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 套餐价格数据 -->
            <el-row>
              <el-form-item v-for="(item, index) in inputFields" :key="item.prop" :label="item.label" :prop="item.prop">
                <el-input-number 
                  v-model="form[item.prop]" 
                  :placeholder="item.placeholder" 
                  :max="99999" 
                  :min="0" 
                  :precision="2"
                  :controls="false"
                  ref="inputRefs"
                  @focus="handleFocus2(index)"
                >
                  <template #suffix>
                    <span>€</span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-row>

            <el-row>
              <el-form-item label="套餐税率:" prop="rateId">
                <el-select v-model="form.rateId" placeholder="请选择套餐税率" clearable>
                  <el-option v-for="items in rateList" :key="items.rateId" :label="items.rateValue + '%'"
                    :value="items.rateId" :disabled="items.rateStatus != RateStatusEnum.ENABLE" />
                </el-select>
              </el-form-item>
              <el-form-item label="套餐状态:" prop="comboStatus">
                <el-radio-group v-model="form.comboStatus">
                  <el-radio v-for="dict in sys_tenant_status" :key="dict.value" :label="dict.value" :value="Number(dict.value)">{{
                    dict.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-row>

            <el-form-item label="商品主图:" prop="comboImage">
              <image-upload v-model="form.comboImage" />
            </el-form-item>

            <el-form-item label="备注描述:" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" maxlength="50"
                show-word-limit />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 套餐项 -->
        <el-tab-pane label="添加套餐项" name="items">
          <el-card v-for="(item, index) in form.productComboItemList" :key="index" class="mb-4" shadow="always"
            style="margin-bottom: 10px;">
            <el-form-item label="套餐项名称:">
              <el-input v-model="item.itemName" placeholder="请输入套餐项名称" type="textarea" :maxlength="50" show-word-limit
                :rows="1" />
            </el-form-item>
            <el-row>
              <el-form-item label="是否可选项:" style="margin-right: 20px;">
                <el-radio-group v-model="item.isOptional" disabled>
                  <el-radio v-for="dict in erp_product_combo_optional" :key="dict.value" :label="dict.value"
                    :value="Number(dict.value)">{{ dict.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="可选数量:" style="margin-right: 20px;" v-if="item.isOptional && item.isOptional != '1'">
                <el-input-number v-model="item.isOptionalQuantity" :min="0" />
              </el-form-item>
            </el-row>

            <!-- SKU 详情 -->
            <el-divider content-position="left">
              <span>SKU 详情</span>
            </el-divider>
            <el-table :data="item.productComboItemDetailList" border style="width: 100%"
              ref="productComboItemDetailList" :summary-method="getSummaryRow" show-summary>
              <el-table-column label="SKU 条码" prop="skuId" align="center" min-width="120px">
                <template #default="scope">
                  <el-select-v2 v-model="scope.row.skuId" filterable :options="formattedSkuList"
                    placeholder="请输入 SKU Code" style="width: 100%" @change="handleSkuChange(scope.row)"
                    :fit-input-width="false" />
                </template>
              </el-table-column>
              <el-table-column label="SKU 名称" align="center" show-overflow-tooltip>
                <template #default="scope">
                  <span>{{ scope.row.productSkuVo?.skuName }}</span>
                </template>
              </el-table-column>
              <el-table-column label="SKU 规格" align="center" show-overflow-tooltip>
                <template #default="scope">
                  <div v-for="(item, index) in getSkuValue(scope.row.productSkuVo?.skuValue)" :key="index">
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
              <el-table-column label="单价" prop="detailPrice" align="center" min-width="70px" show-overflow-tooltip>
                <template #default="scope">
                  <span>{{ formatTwo(scope.row.detailPrice) }} € </span>
                </template>
              </el-table-column>
              <el-table-column label="数量" prop="quantity" align="center">
                <template #default="scope">
                  <el-input-number :ref="(el) => setInputRef(el, index, scope.$index, 'quantity')"
                    v-model="scope.row.quantity" placeholder="发生额" :max='99999999' :min='0' :controls="false"
                    style="width: 100%;" @focus="handleFocus(index, scope.$index, 'quantity')"
                    @click="handleFocus(index, scope.$index, 'quantity')" @change="calculateDetailAmount(scope.row)" />

                </template>
              </el-table-column>
              <el-table-column label="金额" prop="detailAmount" align="center">
                <template #default="scope">
                  <span>{{ formatTwo(scope.row.detailAmount) }} € </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60" align="center">
                <template #default="scope">
                  <el-button type="danger" size="small" @click="removeSkuDetail(index, scope.$index)"
                    style="width: 100%;">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-button type="primary" @click="addSkuDetail(index)"
              v-if="item.productComboItemDetailList && item.productComboItemDetailList.length < 10">添加 SKU</el-button>
            <el-button type="danger" @click="removeComboItem(index)"
              v-if="item.isOptional && item.isOptional != '1'">删除套餐项</el-button>
          </el-card>

          <el-button type="primary" @click="addComboItem" style=" width: 50%; margin-top: 20px;"
            v-if="form.productComboItemList && form.productComboItemList.length < 5">新增可选套餐项</el-button>
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
import { computed } from "vue";
import { listSkuByAddOrder, selectStockBySkuId } from "@/api/product/sku"
import { listProductRate } from "@/api/product/productRate";
import { RateStatusEnum} from "./productComboEnum.js"

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
const rateList = ref([]);

const data = reactive({
  form: {
    productComboItemList: []
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    comboCode: null,
    comboName: null,
    comboStatus: null,
    rateId: null,
    tenantId: null,
  },
  rules: {
    comboCode: [{ required: true, message: '套餐编码不能为空', trigger: 'blur' }],
    comboName: [{ required: true, message: '套餐名称不能为空', trigger: 'blur' }],
    rateId: [{ required: true, message: '税率不能为空', trigger: 'blur' }],
    comboStatus: [{ required: true, message: '套餐状态不能为空', trigger: 'blur' }],
    comboPrice: [{ required: true, message: '套餐价格不能为空', trigger: 'blur' }],
  }
});

const { queryParams, form, rules } = toRefs(data);

// 定义输入框列表，方便扩展
const inputFields = [
  { label: "套餐单价:", prop: "comboPrice", placeholder: "套餐单价" },
  { label: "单价2:", prop: "comboPrice2", placeholder: "单价2" },
  { label: "单价3:", prop: "comboPrice3", placeholder: "单价3" },
  { label: "单价4:", prop: "comboPrice4", placeholder: "单价4" },
  { label: "单价5:", prop: "comboPrice5", placeholder: "单价5" },
  { label: "单价6:", prop: "comboPrice6", placeholder: "单价6" },
];

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
// 统一的 focus 事件
const handleFocus2 = (index) => {
  const input = inputRefs.value[index]?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};

// ---------------------- 1 表单 输入框聚焦选中 end ------------------

// ********************** 2 基础数据 start **************************
const addComboItem = () => {
  form.value.productComboItemList.push({
    itemId: null,
    comboId: null,
    itemName: null,
    isOptional: '2',
    isOptionalQuantity: 1,
    productComboItemDetailList: [{
      detailId: null,
      itemId: null,
      skuId: null,
      detailPrice: 0.00,
      quantity: 0,
      detailAmount: 0.00,
    },]
  });
};

const removeComboItem = (index) => {
  form.value.productComboItemList.splice(index, 1);
};

const addSkuDetail = (itemIndex) => {
  form.value.productComboItemList[itemIndex].productComboItemDetailList.push({
    detailId: null,
    itemId: null,
    skuId: null,
    detailPrice: 0.00,
    quantity: 0,
    detailAmount: 0.00,
  });
};

const removeSkuDetail = (itemIndex, detailIndex) => {
  form.value.productComboItemList[itemIndex].productComboItemDetailList.splice(detailIndex, 1);
};

/** taps 界面切换之前的校验 newValue当前标签名、oldValue将要前往的标签名 */
const beforeLeave = async (oldValue, newValue) => {
  // 如果是从第一个标签切换到第二个标签
  if (newValue === "basic" && oldValue === "items") {
    try {
      // 验证表单
      await proxy.$refs["productComboRef"].validate();
      console.log("验证通过");
      // 验证通过，允许切换
      return true;
    } catch (error) {
      // 验证失败，阻止切换并显示错误消息
      ElMessage.error("请先完成必填项");
      console.log("验证不通过");
      // 从新赋值，解决 goToSecond() 重复调用的BUG
      activeName.value = "first";
      return false;
    }
  } else {
    // 其他情况下允许自由切换
    return true;
  }
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
      sums[index] = column.property === 'skuPrice' ? '合计 :' : ''
    }
  })

  return sums
}

// -----3.1表格 输入框聚焦选中 start -------
const inputRefs = ref({}); // 使用对象存储各列引用
// 动态管理每列引用
const setInputRef = (el, cardIndex, rowIndex, column) => {
  if (!inputRefs.value[cardIndex]) {
    inputRefs.value[cardIndex] = {};
  }
  if (!inputRefs.value[cardIndex][rowIndex]) {
    inputRefs.value[cardIndex][rowIndex] = {};
  }
  inputRefs.value[cardIndex][rowIndex][column] = el;
};

// 聚焦时选中内容
const handleFocus = (cardIndex, rowIndex, column) => {
  const inputEl = inputRefs.value[cardIndex]?.[rowIndex]?.[column]?.$el.querySelector('input');
  if (inputEl) {
    inputEl.select(); // 选中输入框内容
  }
};

// -----3.1表格 输入框聚焦选中 end -------
// ---------------------- 3 弹窗 表格样式 end ----------

// ********************* 4 弹窗 计算合计金额 start ***************************
const calculateDetailAmount = (row) => {
  row.detailAmount = row.quantity * row.detailPrice;
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

/** 获取税率下拉数据 */
function getRateList(){
  listProductRate().then(response => {
    rateList.value = response.rows;
  }).catch(error => {
    console.error("获取税率列表失败：", error);
  })
}

getRateList()

// 格式化 SKU 列表，用于 el-select-v2 的 options
const formattedSkuList = computed(() => {
  return skuList.value.map((sku) => ({
    value: sku.skuId, // SKU ID
    label: `${sku.skuCode} - ${sku.skuName} - ${sku.skuValue}`, // 显示 SKU Code 和 Name
  }));
});

// 处理 SKU 选择事件
const handleSkuChange = (row) => {
  const selectedSku = skuList.value.find((sku) => sku.skuId === row.skuId);
  if (selectedSku) {
    // 确保 row.productSkuVo 已初始化
    if (!row.productSkuVo) {
      row.productSkuVo = {};
    }
    row.detailPrice = selectedSku.skuPrice; // 自动填充 SKU 价格
    row.productSkuVo.skuName = selectedSku.skuName;
    row.productSkuVo.skuValue = selectedSku.skuValue;
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
    rateId: null,
    comboCode: null,
    comboName: null,
    assistName: null,
    comboPrice: 0.00,
    comboStatus: '0',
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    remark: null,
    tenantId: null,
    delFlag: null,
    productComboItemList: [{
      itemId: null,
      comboId: null,
      itemName: null,
      isOptional: '1',
      isOptionalQuantity: null,
      productComboItemDetailList: [{
        detailId: null,
        itemId: null,
        skuId: null,
        detailPrice: 0.0,
        quantity: 0,
        detailAmount: 0.0
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

/** 获取商品套餐名称列表 */
function getComboNamesByIds(comboIds) {
  // 统一将 comboIds 转换为数组
  const ids = Array.isArray(comboIds) ? comboIds : [comboIds];
  const comboNames = [];

  // 检查 productComboList 是否已加载
  if (!productComboList.value || productComboList.value.length === 0) {
    console.warn('商品套餐列表未加载或为空');
    return '';
  }

  // 遍历 productComboList，获取套餐名称
  productComboList.value.forEach(item => {
    if (ids.includes(item.comboId)) {
      comboNames.push(item.comboName);
    }
  });

  // 如果 comboNames 为空，返回默认提示
  return comboNames.length > 0 ? comboNames.join(', ') : '无匹配套餐';
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _comboIds = row.comboId || ids.value;
  // 获取要删除的套餐名称
  const comboNames = getComboNamesByIds(_comboIds);
  proxy.$modal.confirm('是否确认删除商品套餐名称为"' + comboNames + '"的数据项？').then(function() {
    return delProductCombo(_comboIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch((error) => {
    console.error('删除失败:', error);
  });
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
