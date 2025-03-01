<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动编码:" prop="promotionCode">
        <el-input
          v-model="queryParams.promotionCode"
          placeholder="请输入促销活动编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动名称:" prop="promotionName">
        <el-input
          v-model="queryParams.promotionName"
          placeholder="请输入促销活动名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="促销类型" prop="promotionType">
        <el-select v-model="queryParams.promotionType" placeholder="请选择促销类型" clearable>
          <el-option
            v-for="dict in erp_sales_promotion_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="活动状态" prop="promotionStatus">
        <el-select v-model="queryParams.promotionStatus" placeholder="请选择活动状态" clearable>
          <el-option
            v-for="dict in sys_tenant_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仅对会员" prop="isMemberOnly">
        <el-select v-model="queryParams.isMemberOnly" placeholder="请选择是否仅对会员" clearable>
          <el-option
            v-for="dict in sys_yes_or_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['sales:salesPromotion:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sales:salesPromotion:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sales:salesPromotion:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sales:salesPromotion:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="salesPromotionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="活动编码" align="center" prop="promotionCode" />
      <el-table-column label="活动名称" align="center" prop="promotionName" />
      <el-table-column label="活动类型" align="center" prop="promotionType">
        <template #default="scope">
          <dict-tag :options="erp_sales_promotion_type" :value="scope.row.promotionType"/>
        </template>
      </el-table-column>
      <el-table-column label="活动开始时间" align="center" prop="startTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动结束时间" align="center" prop="endTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动状态" align="center" prop="promotionStatus">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.promotionStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="仅对会员" align="center" prop="isMemberOnly">
        <template #default="scope">
          <dict-tag :options="sys_yes_or_no" :value="scope.row.isMemberOnly"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sales:salesPromotion:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sales:salesPromotion:remove']">删除</el-button>
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

    <!-- 添加或修改促销活动对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-tabs type="border-card" v-model="activeTab" :before-leave="beforeLeave">
        <el-tab-pane label="基础信息" name="basic">
          <el-form ref="salesPromotionRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="活动编码:" prop="promotionCode">
              <el-input v-model="form.promotionCode" placeholder="请输入促销活动编码" type="textarea" :maxlength="50" show-word-limit :rows="1" :disabled="form.promotionId ? true : false"/>
            </el-form-item>
            <el-form-item label="活动名称:" prop="promotionName">
              <el-input v-model="form.promotionName" placeholder="请输入促销活动名称" type="textarea" :maxlength="50" show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="活动类型:" prop="promotionType">
              <el-radio-group v-model="form.promotionType" @change="changePromotionType">
                <el-radio-button
                  v-for="dict in erp_sales_promotion_type"
                  :key="dict.value"
                  :label="dict.value"
                  :value="dict.value"
                >{{dict.label}}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="活动时间:" prop="timeRange">
              <el-date-picker
                v-model="form.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                :default-time="defaultTime2"
                @change="handleDateChange"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="活动状态:" prop="promotionStatus">
              <el-radio-group v-model="form.promotionStatus">
                <el-radio
                  v-for="dict in sys_tenant_status"
                  :key="dict.value"
                  :label="dict.value"
                  :value="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="仅对会员:" prop="isMemberOnly">
              <el-radio-group v-model="form.isMemberOnly">
                <el-radio
                  v-for="dict in sys_yes_or_no"
                  :key="dict.value"
                  :label="dict.value"
                  :value="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="备注：" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入促销名称" type="textarea" :maxlength="50" show-word-limit :rows="2"/>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="配置活动规则" name="items">

          <!-- RuleFullReduce 满减-->
          <template v-if="form.promotionType == PromotionTypeEnum.FULL_REDUCE">
            
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="促销活动类型:">
                  <dict-tag :options="erp_sales_promotion_type" :value="form.promotionType"/>
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="满额条件:" >
                  <el-input-number v-model="form.salesPromotionRuleFullReduce.fullAmount" placeholder="满额条件" 
                    :max='99999' :min='0' :precision='2'
                    :controls="false" ref="inputNumber1" 
                    @focus="handleFocus1"
                    style="width: 100%;"
                  >
                    <template #suffix>
                      <span>€</span>
                    </template>
                  </el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="减免额度:" >
                  <el-input-number v-model="form.salesPromotionRuleFullReduce.reduceAmount" placeholder="减免额度" 
                    :max='99999' :min='0' :precision='2'
                    :controls="false" ref="inputNumber2" 
                    @focus="handleFocus2"
                    style="width: 100%;"
                  >
                    <template #suffix>
                      <span>€</span>
                    </template>
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 活动适用范围模板 -->
            <salesPromotionScope
              :promotionScopeType="form.salesPromotionRuleFullReduce.promotionScopeType"
              :salesPromotionScopeList="form.salesPromotionScopeList"
              :formattedSkuList="formattedSkuList"
              :categoryList="categoryList"
              :ScopeTypeEnum="ScopeTypeEnum"
              :StatusEnum="StatusEnum"
              @addPromotionScopeDetail="addSalesPromotionScopeDetail"
              @removePromotionScopeDetail = "removeSalesPromotionScopeDetail"
              @handleSkuChange="handleSkuChange"
            >
              <template #promotion-scope-label>
                <el-form-item label="活动适用范围:" >
                  <el-radio-group v-model="form.salesPromotionRuleFullReduce.promotionScopeType" @change="handlePromotionScopeTypeChanged(form.salesPromotionRuleFullReduce.promotionScopeType)">
                    <el-radio-button
                      v-for="dict in erp_sales_promotion_scope"
                      :key="dict.value"
                      :label="dict.value"
                      :value="dict.value"
                    >{{dict.label}}</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </template>
            </salesPromotionScope>
            
          </template>

          <!-- RuleFullGift 满赠 -->
          <template v-if="form.promotionType == PromotionTypeEnum.FULL_GIFT">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="促销活动类型:">
                  <dict-tag :options="erp_sales_promotion_type" :value="form.promotionType"/>
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="满额条件:" >
                  <el-input-number v-model="form.salesPromotionRuleFullGift.fullAmount" placeholder="满额条件" 
                    :max='99999' :min='0' :precision='2'
                    :controls="false" ref="inputNumber1" 
                    @focus="handleFocus1"
                    style="width: 100%;"
                  >
                    <template #suffix>
                      <span>€</span>
                    </template>
                  </el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="赠送数量:" >
                  <el-input-number v-model="form.salesPromotionRuleFullGift.giftMaxQuantity" placeholder="赠送数量" 
                    :max='99999' :min='0' 
                    :controls="false" ref="inputNumber2" 
                    @focus="handleFocus2"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 活动范围模板 -->
            <salesPromotionScope
              :promotionScopeType="form.salesPromotionRuleFullGift.promotionScopeType"
              :salesPromotionScopeList="form.salesPromotionScopeList"
              :formattedSkuList="formattedSkuList"
              :categoryList="categoryList"
              :ScopeTypeEnum="ScopeTypeEnum"
              :StatusEnum="StatusEnum"
              @addPromotionScopeDetail="addSalesPromotionScopeDetail"
              @removePromotionScopeDetail = "removeSalesPromotionScopeDetail"
              @handleSkuChange="handleSkuChange"
            >
              <template #promotion-scope-label>
                <el-form-item label="活动适用范围:" >
                  <el-radio-group v-model="form.salesPromotionRuleFullGift.promotionScopeType" @change="handlePromotionScopeTypeChanged(form.salesPromotionRuleFullGift.promotionScopeType)">
                    <el-radio-button
                      v-for="dict in erp_sales_promotion_scope"
                      :key="dict.value"
                      :label="dict.value"
                      :value="dict.value"
                    >{{dict.label}}</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </template>
            </salesPromotionScope>

            <!-- 赠送范围模板  -->
            <salesPromotionScopeGift
              :giftScopeType="form.salesPromotionRuleFullGift.giftScopeType"
              :salesPromotionScopeGiftList="form.salesPromotionScopeGiftList"
              :formattedSkuList="formattedSkuList"
              :categoryList="categoryList"
              :ScopeTypeEnum="ScopeTypeEnum"
              :StatusEnum="StatusEnum"
              @addPromotionScopeGiftDetail="addSalesPromotionScopeGiftDetail"
              @removePromotionScopeGiftDetail = "removeSalesPromotionScopeGiftDetail"
              @handleSkuChange="handleSkuChange"
            >
              <template #gift-scope-label>
                <el-row>
                  <el-col :span="16">
                    <el-form-item label="赠品适用范围:" >
                      <el-radio-group v-model="form.salesPromotionRuleFullGift.giftScopeType" @change="handleGiftScopeTypeChanged(form.salesPromotionRuleFullGift.giftScopeType)">
                        <el-radio-button
                          v-for="dict in erp_sales_promotion_scope"
                          :key="dict.value"
                          :label="dict.value"
                          :value="dict.value"
                        >{{dict.label}}</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-button type="primary" plain @click="handleSynchronizeData()">
                      <template #icon>
                        <svg-icon icon-class="synchronizeData" />
                      </template>
                      同步 活动适用范围
                    </el-button>
                  </el-col>
                </el-row>
              </template>
            </salesPromotionScopeGift>


          </template>

          <!-- RuleQuantity 买x送y -->
          <template v-if="form.promotionType == PromotionTypeEnum.QUANTITY">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="促销活动类型:">
                  <dict-tag :options="erp_sales_promotion_type" :value="form.promotionType"/>
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="达标数量:" >
                  <el-input-number v-model="form.salesPromotionRuleQuantity.fullAmount" placeholder="达标数量" 
                    :max='99999' :min='0' 
                    :controls="false" ref="inputNumber1" 
                    @focus="handleFocus1"
                    style="width: 100%;"
                  >
                  </el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="赠送数量:" >
                  <el-input-number v-model="form.salesPromotionRuleQuantity.giftMaxQuantity" placeholder="赠送数量" 
                    :max='99999' :min='0' 
                    :controls="false" ref="inputNumber2" 
                    @focus="handleFocus2"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 活动范围模板 -->
            <salesPromotionScope
              :promotionScopeType="form.salesPromotionRuleQuantity.promotionScopeType"
              :salesPromotionScopeList="form.salesPromotionScopeList"
              :formattedSkuList="formattedSkuList"
              :categoryList="categoryList"
              :ScopeTypeEnum="ScopeTypeEnum"
              :StatusEnum="StatusEnum"
              @addPromotionScopeDetail="addSalesPromotionScopeDetail"
              @removePromotionScopeDetail = "removeSalesPromotionScopeDetail"
              @handleSkuChange="handleSkuChange"
            >
              <template #promotion-scope-label>
                <el-form-item label="活动适用范围:" >
                  <el-radio-group v-model="form.salesPromotionRuleQuantity.promotionScopeType" @change="handlePromotionScopeTypeChanged(form.salesPromotionRuleQuantity.promotionScopeType)">
                    <el-radio-button
                      v-for="dict in erp_sales_promotion_scope"
                      :key="dict.value"
                      :label="dict.value"
                      :value="dict.value"
                    >{{dict.label}}</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </template>
            </salesPromotionScope>

            <!-- 赠品适用范围模板  -->
            <salesPromotionScopeGift
              :giftScopeType="form.salesPromotionRuleQuantity.giftScopeType"
              :salesPromotionScopeGiftList="form.salesPromotionScopeGiftList"
              :formattedSkuList="formattedSkuList"
              :categoryList="categoryList"
              :ScopeTypeEnum="ScopeTypeEnum"
              :StatusEnum="StatusEnum"
              @addPromotionScopeGiftDetail="addSalesPromotionScopeGiftDetail"
              @removePromotionScopeGiftDetail = "removeSalesPromotionScopeGiftDetail"
              @handleSkuChange="handleSkuChange"
            >
              <template #gift-scope-label>
                <el-row>
                  <el-col :span="16">
                    <el-form-item label="赠品适用范围:" >
                      <el-radio-group v-model="form.salesPromotionRuleQuantity.giftScopeType" @change="handleGiftScopeTypeChanged(form.salesPromotionRuleQuantity.giftScopeType)">
                        <el-radio-button
                          v-for="dict in erp_sales_promotion_scope"
                          :key="dict.value"
                          :label="dict.value"
                          :value="dict.value"
                        >{{dict.label}}</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-button type="primary" plain @click="handleSynchronizeData()">
                      <template #icon>
                        <svg-icon icon-class="synchronizeData" />
                      </template>
                      同步 活动适用范围
                    </el-button>
                  </el-col>
                </el-row>
              </template>
            </salesPromotionScopeGift>

          </template>

          <!-- RuleDiscount 折扣 -->
          <template v-if="form.promotionType == PromotionTypeEnum.DISCOUNT">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="促销活动类型:">
                  <dict-tag :options="erp_sales_promotion_type" :value="form.promotionType"/>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="活动折扣:" >
                  <el-input-number v-model="form.salesPromotionRuleDiscount.fullAmount" placeholder="达标数量" 
                    :max='99999' :min='0' :precision='2'
                    :controls="false" ref="inputNumber1" 
                    @focus="handleFocus1"
                    style="width: auto;"
                  >
                   <template #suffix>
                      <span>%</span>
                    </template>
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 活动适用范围模板 -->
            <salesPromotionScope
              :promotionScopeType="form.salesPromotionRuleDiscount.promotionScopeType"
              :salesPromotionScopeList="form.salesPromotionScopeList"
              :formattedSkuList="formattedSkuList"
              :categoryList="categoryList"
              :ScopeTypeEnum="ScopeTypeEnum"
              :StatusEnum="StatusEnum"
              @addPromotionScopeDetail="addSalesPromotionScopeDetail"
              @removePromotionScopeDetail = "removeSalesPromotionScopeDetail"
              @handleSkuChange="handleSkuChange"
            >
              <template #promotion-scope-label>
                <el-form-item label="活动适用范围:" >
                  <el-radio-group v-model="form.salesPromotionRuleFullReduce.promotionScopeType" @change="handlePromotionScopeTypeChanged(form.salesPromotionRuleFullReduce.promotionScopeType)">
                    <el-radio-button
                      v-for="dict in erp_sales_promotion_scope"
                      :key="dict.value"
                      :label="dict.value"
                      :value="dict.value"
                    >{{dict.label}}</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </template>
            </salesPromotionScope>

          </template>

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

<script setup name="SalesPromotion">
import { listSalesPromotion, getSalesPromotion, delSalesPromotion, addSalesPromotion, updateSalesPromotion } from "@/api/sales/salesPromotion";
import useUserStore from "@/store/modules/user";
import { ElMessage } from "element-plus";
import { listSkuByAddOrder, selectStockBySkuId } from "@/api/product/sku"
import { listCategory } from "@/api/product/category";
import salesPromotionScope from "./salesPromotionScope.vue";
import salesPromotionScopeGift from "./salesPromotionScopeGift.vue";
import {StatusEnum, IsMemberOnlyEnum, PromotionTypeEnum, ScopeTypeEnum, IsAllProductEnum} from "./enum.js";
import { cloneDeep } from "lodash";

const { proxy } = getCurrentInstance();
const { erp_sales_promotion_type, erp_sales_promotion_scope, sys_tenant_status, sys_yes_or_no } = proxy.useDict('erp_sales_promotion_type', 'erp_sales_promotion_scope', 'sys_tenant_status', 'sys_yes_or_no');

// 租户ID字段过滤使用
const userStore = useUserStore();

const salesPromotionList = ref([]);
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
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    promotionName: null,
    promotionType: null,
    promotionStatus: null,
    isMemberOnly: null,
    tenantId: null,
  },
  rules: {
    promotionCode: [
      { required: true, message: "促销编码不能为空", trigger: "blur" }
    ],
    promotionName: [
      { required: true, message: "促销名称不能为空", trigger: "blur" }
    ],
    promotionType: [
      { required: true, message: "促销类型不能为空", trigger: "change" }
    ],
    promotionStatus: [
      { required: true, message: "促销状态不能为空", trigger: "change" }
    ],
    isMemberOnly: [
      { required: true, message: "是否会员专享不能为空", trigger: "change" }
    ],
    timeRange: [
      { required: true, message: "活动时间不能为空", trigger: "blur" }
    ],

  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询促销活动列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSalesPromotion(queryParams.value).then(response => {
    salesPromotionList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// ---------------- 2 时间区域选择 start ----------------
// const timeRange = ref([])
const defaultTime2 = [
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 2, 1, 23, 59, 59),
] 
// 处理日期选择变化
const handleDateChange = (value) => {
  if (value && value.length === 2) {
    form.value.startTime = value[0];
    form.value.endTime = value[1];
  } else {
    form.value.startTime = '';
    form.value.endTime = '';
  }
};
// ---------------- 2 时间区域选择 end   ----------------

// ---------------- 3 切换tap校验数据 start --------------
// taps 界面切换之前的校验 newValue当前标签名、oldValue将要前往的标签名
const beforeLeave = async (oldValue, newValue) => {
  // 如果是从第一个标签切换到第二个标签
  if (newValue === "basic" && oldValue === "items") {
    try {
      // 验证表单
      await proxy.$refs["salesPromotionRef"].validate();
      // 验证通过，允许切换
      return true;
    } catch (error) {
      // 验证失败，阻止切换并显示错误消息
      ElMessage.error("请先完成基础信息的必填项!");
      // 从新赋值，解决 goToSecond() 重复调用的BUG
      activeName.value = "basic";
      return false;
    }
  } else {
    // 其他情况下允许自由切换
    return true;
  }
};

// --------------- 3 切换tap校验数据 end   --------------

// --------------- 4 切换促销类型 start   -----------------
// 满减
const initSalesPromotionRuleFullReduce = () => ({
  ruleId: null,
  promotionId: null,
  promotionScopeType: ScopeTypeEnum.SKU,
  fullAmount: null,
  reduceAmount: null,
});
// 满送y
const initSalesPromotionRuleFullGift = () => ({
  ruleId: null,
  promotionId: null,
  promotionScopeType: ScopeTypeEnum.SKU,
  fullAmount: null,
  giftScopeType: ScopeTypeEnum.SKU,
  giftMaxQuantity: null,
});
// 买x送y
const initSalesPromotionRuleQuantity = () => ({
  ruleId: null,
  promotionId: null,
  promotionScopeType: ScopeTypeEnum.SKU,
  fullQuantity: null,
  giftScopeType: ScopeTypeEnum.SKU,
  giftQuantity: null,
});
// 折扣
const initSalesPromotionRuleDiscount = () => ({
  ruleId: null,
  promotionId: null,
  promotionScopeType: ScopeTypeEnum.SKU,
  discountRate: null,
});
// 重置规则
const restAllRules = () => {
  form.value.salesPromotionRuleFullReduce = initSalesPromotionRuleFullReduce();
  form.value.salesPromotionRuleFullGift = initSalesPromotionRuleFullGift();
  form.value.salesPromotionRuleQuantity = initSalesPromotionRuleQuantity();
  form.value.salesPromotionRuleDiscount = initSalesPromotionRuleDiscount();
  form.value.salesPromotionScopeList = [];
  form.value.salesPromotionScopeGiftList = [];
}
/** 修改促销类型 - 切换折扣规则 */
const  changePromotionType = () => {
  switch (form.value.promotionType) {
    case PromotionTypeEnum.FULL_REDUCE:
      restAllRules()
      form.value.salesPromotionRuleFullReduce = initSalesPromotionRuleFullReduce();
      break;
    case PromotionTypeEnum.FULL_GIFT:
      restAllRules()
      form.value.salesPromotionRuleFullGift = initSalesPromotionRuleFullGift();
      break;
    case PromotionTypeEnum.QUANTITY:
      restAllRules()
      form.value.salesPromotionRuleQuantity = initSalesPromotionRuleQuantity();
      break;
    case PromotionTypeEnum.DISCOUNT:
      restAllRules()
      form.value.salesPromotionRuleDiscount = initSalesPromotionRuleDiscount();
      break;
    default:
      restAllRules()
      console.error('未知的促销类型:', form.value.promotionType);
      break;
  }
}

// --------------- 4 切换促销类型 end   -----------------

// --------------- 5 输入框聚焦选中 start ---------------
const inputNumber1 = ref({}); // 使用对象存储各列引用
const inputNumber2 = ref({});
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

// --------------- 5 输入框聚焦选中 end   ---------------

// --------------- 6 变更 活动/赠品 范围类型 start   -----------------
/** 切换 活动适用范围类型 */
const handlePromotionScopeTypeChanged = (promotionScopeType) => {
  // 清空活动范围数据
  form.value.salesPromotionScopeList = [];
  form.value.salesPromotionScopeList.push(initSalesPromotionScope());
  // 全场处理
  if (promotionScopeType === ScopeTypeEnum.ALL) {
    form.value.salesPromotionScopeList[0].isAllProduct = IsAllProductEnum.YES;
  }
}
/** 切换 赠品适用范围类型 */ 
const handleGiftScopeTypeChanged = (giftScopeType) => {
  // 清空活动范围数据
  form.value.salesPromotionScopeGiftList = [];
  form.value.salesPromotionScopeGiftList.push(initSalesPromotionScope());
  // 全场处理
  if (giftScopeType === ScopeTypeEnum.ALL) {
    form.value.salesPromotionScopeGiftList[0].isAllProduct = IsAllProductEnum.YES;
  }
}

// --------------- 6 变更 活动/赠品 范围类型 end   -----------------

// -------------- 7 促销活动范围数据 - 指定商品 start   -----------------
/** 初始化 活动/赠品 范围数据 */
const initSalesPromotionScope = () => ({
  promotionScopeId: null,
  promotionScopeGiftId: null,
  promotionId: null,
  isAllProduct: IsAllProductEnum.NO,
  categoryId: null,
  skuId: null,
  productSkuVo: {
    skuId:null,
    skuCode: null,
    productName: null,
    skuValue: null,
    skuPrice1: null,
    skuPrice2: null,
    skuPrice3: null,
  }
})

// ---- 活动适用范围 新增删除 数据
const addSalesPromotionScopeDetail = () => {
  form.value.salesPromotionScopeList.push(initSalesPromotionScope());
}
const removeSalesPromotionScopeDetail = (index) => {
  form.value.salesPromotionScopeList.splice(index, 1);
}
// ---- 赠品适用范围 新增删除 数据
const addSalesPromotionScopeGiftDetail = () => {
  form.value.salesPromotionScopeGiftList.push(initSalesPromotionScope());
}
const removeSalesPromotionScopeGiftDetail = (index) => {
  form.value.salesPromotionScopeGiftList.splice(index, 1);
}
// ---- 赠品适用范围 同步 活动适用范围 数据
const handleSynchronizeData = () => {
  // 同步活动范围类型
  form.value.salesPromotionRuleFullGift.giftScopeType = cloneDeep(form.value.salesPromotionRuleFullGift.promotionScopeType);
  form.value.salesPromotionRuleQuantity.giftScopeType = cloneDeep(form.value.salesPromotionRuleQuantity.promotionScopeType);

  // 同步活动适用范围数据
  form.value.salesPromotionScopeGiftList = cloneDeep(form.value.salesPromotionScope);
}

// 初始化SKU列表
const skuList = ref([])
/** 获取 SKU 列表 */
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
  if (row.skuId) {
    // 如果有 skuId，则根据 skuId 查找对应的 sku
    const selectedSku = skuList.value.find((sku) => sku.skuId === row.skuId);
    if (selectedSku) {
      row.productSkuVo.skuId = selectedSku.skuId;
      row.productSkuVo.skuCode = selectedSku.skuCode;
      row.productSkuVo.productName = selectedSku.productName;
      row.productSkuVo.skuValue = selectedSku.skuValue;
      row.productSkuVo.skuPrice1 = selectedSku.skuPrice1;
      row.productSkuVo.skuPrice2 = selectedSku.skuPrice2;
      row.productSkuVo.skuPrice3 = selectedSku.skuPrice3;
    }
  } else {
    // 如果没有 skuId，则将 productSkuVo 设置为 null
  }
}

// -------------- 7 促销活动范围 - 指定商品 end   -----------------

// -------------- 8 促销活动范围 - 指定商品分类 end   -----------------
const categoryList = ref([]);
/** 获取商品分类下拉框数据 */
function getCategoryList() {
  listCategory()
    .then((response) => {
      categoryList.value = proxy.handleTree(
        response.data,
        "categoryId",
        "parentId"
      );
    })
    .catch((error) => {
      ElMessage.error("获取分类列表时出错:", error);
    });
}

getCategoryList();

// --------------- 8 促销活动范围 - 指定商品分类 end   -----------------


// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    promotionId: null,
    promotionName: null,
    promotionCode: null,
    promotionType: null,
    timeRange: [],
    startTime: null,
    endTime: null,
    promotionStatus: StatusEnum.NORMAL,
    isMemberOnly: IsMemberOnlyEnum.NO,
    tenantId: null,
    delFlag: null,
    salesPromotionRuleFullReduce: initSalesPromotionRuleFullReduce(),
    salesPromotionRuleFullGift: initSalesPromotionRuleFullGift(),
    salesPromotionRuleQuantity: initSalesPromotionRuleQuantity(),
    salesPromotionRuleDiscount: initSalesPromotionRuleDiscount(),
    salesPromotionScopeList: [],
    salesPromotionScopeGiftList: [],
  };
  proxy.resetForm("salesPromotionRef");
  activeTab.value = 'basic';
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
  ids.value = selection.map(item => item.promotionId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加促销活动";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _promotionId = row.promotionId || ids.value
  getSalesPromotion(_promotionId).then(response => {
    form.value = response.data;
    form.value.timeRange = [form.value.startTime, form.value.endTime];
    open.value = true;
    title.value = "修改促销活动";
  });
}

/** 范围数据 过滤空数据 */
const filterEmptyScopeData = () => {
  form.value.salesPromotionScopeList = form.value.salesPromotionScopeList.filter(item => !(
        (item.skuId == null && item.categoryId == null) && // skuId 和 categoryId 同时不存在
        item.isAllProduct === IsAllProductEnum.NO // isAllProduct 等于 NO
    ));
  form.value.salesPromotionScopeGiftList = form.value.salesPromotionScopeGiftList.filter(item => !(
      (item.skuId == null && item.categoryId == null) && // skuId 和 categoryId 同时不存在
      item.isAllProduct === IsAllProductEnum.NO // isAllProduct 等于 NO
  ));
}

/** 范围数据 重复数据校验 */
const checkDuplicateScopeData = (list) => {
  // 用于存储已见过的项
  const seen = new Set();
  // 用于存储重复项
  const duplicates = [];

  list.forEach(item => {
      // 生成唯一标识符（基于 skuId 和 categoryId）
      const identifier = `${item.categoryId}-${item.skuId}`;

      if (seen.has(identifier)) {
          // 如果已经见过，说明是重复项
          duplicates.push(item);
      } else {
          // 否则，添加到已见过的集合中
          seen.add(identifier);
      }
  });
  if (duplicates.length > 0) {
    console.log("发现重复项：", duplicates);
    return true; // 存在重复项
  } else {
    return false; // 没有重复项
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["salesPromotionRef"].validate(valid => {
    // 1 范围数据 过滤空数据
    filterEmptyScopeData()
    // 2 范围数据 重复数据校验
    const hasDuplicateScope = checkDuplicateScopeData(form.value.salesPromotionScopeList)
    const hasDuplicateGift = checkDuplicateScopeData(form.value.salesPromotionScopeGiftList)
    // 如果存在重复项，直接返回，阻止后续操作
    if (hasDuplicateScope || hasDuplicateGift) {
      ElMessage.error("所选范围存在重复项，请检查！");
      return;
    }

    // 3 处理新增/修改
    if (valid) {
      if (form.value.promotionId != null) {
        updateSalesPromotion(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSalesPromotion(form.value).then(response => {
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
  const _promotionIds = row.promotionId || ids.value;
  proxy.$modal.confirm('是否确认删除促销活动编号为"' + _promotionIds + '"的数据项？').then(function() {
    return delSalesPromotion(_promotionIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sales/salesPromotion/export', {
    ...queryParams.value
  }, `salesPromotion_${new Date().getTime()}.xlsx`)
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

