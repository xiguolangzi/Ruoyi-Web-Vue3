<template>
  <el-card v-if="promotionScopeType" style="margin-bottom: 10px;" shadow="hover">
    <!-- 添加 slot，让父组件能够传递 el-form-item 进来 -->
    <slot name="promotion-scope-label"></slot>

    <el-divider content-position="left">
      <span>
        {{
          isSkuScope ? "促销活动范围 SKU" :
          isCategoryScope ? "促销活动范围 商品分类" :
          "促销活动范围 全场所有商品"
        }}
      </span>
    </el-divider>

    <!-- 全场所有商品 -->
    <template v-if="isAllScope">
      <p style="text-align: center; padding: 20px; font-weight: bold;">
        该促销活动适用于所有商品，无需额外选择 SKU 或分类。
      </p>
    </template>

    <!-- SKU 绑定 -->
    <template v-if="isSkuScope">
      <el-table :data="salesPromotionScopeList" border style="width: 100%" ref="salesPromotionScopeList">
        <el-table-column label="SKU 条码" prop="skuId" align="center" min-width="120px">
          <template #default="scope">
            <el-select-v2 v-model="scope.row.skuId" filterable :options="formattedSkuList"
              placeholder="请输入 SKU Code" style="width: 100%" @change="handleSkuChange(scope.row)"
              :fit-input-width="false" />
          </template>
        </el-table-column>
        <el-table-column label="SKU 名称" align="left" header-align="center" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.productSkuVo?.skuName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="SKU 规格" align="left" header-align="center" show-overflow-tooltip>
          <template #default="scope">
            <div v-if="getSkuValue(scope.row.productSkuVo?.skuValue) == 'default'">
              --  <!-- 直接显示默认 SKU -->
            </div>
            <div v-else v-for="(item, index) in getSkuValue(scope.row.productSkuVo?.skuValue)" :key="index">
              <strong>{{ item[0] }}:</strong>
              <span>{{ item[1] }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" prop="detailPrice" align="right" header-align="center" min-width="60px" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ formatTwo(scope.row.productSkuVo?.skuPrice) }} € </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="75" align="center">
          <template #default="scope">
            <el-button type="danger" size="small" plain @click="removeDetail(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-button type="primary" plain @click="addDetail" v-if="salesPromotionScopeList.length < 10" style="margin-top: 10px;">
        添加 SKU
      </el-button>
    </template>

    <!-- 分类绑定 -->
    <template v-if="isCategoryScope">
      <el-table :data="salesPromotionScopeList" border style="width: 100%" ref="salesPromotionScopeList">
        <el-table-column label="商品分类" prop="categoryId" align="center" min-width="120px">
          <template #default="scope">
            <el-tree-select v-model="scope.row.categoryId" :data="categoryList" 
              :props="{
                value: 'categoryId',
                label: 'categoryName',
                children: 'children',
                disabled: (data) => data.status != StatusEnum.NORMAL
              }" 
              value-key="categoryId" placeholder="请选择商品分类" 
              style="width: 195px" clearable 
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="75" align="center">
          <template #default="scope">
            <el-button type="danger" size="small" plain @click="removeDetail(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-button type="primary" plain @click="addDetail" v-if="salesPromotionScopeList.length < 10" style="margin-top: 10px;">
        添加 商品分类
      </el-button>
    </template>
  </el-card>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';

const props = defineProps({
  promotionScopeType: [String,Number],
  salesPromotionScopeList: Array,
  formattedSkuList: Array,
  categoryList: Array,
  ScopeTypeEnum: Object,
  StatusEnum: Object
});

const isSkuScope = computed(() => props.promotionScopeType == props.ScopeTypeEnum.SKU);
const isCategoryScope = computed(() => props.promotionScopeType == props.ScopeTypeEnum.CATEGORY);
const isAllScope = computed(() => props.promotionScopeType == props.ScopeTypeEnum.ALL);

const emit = defineEmits(['handleSkuChange', 'removePromotionScopeDetail', 'addPromotionScopeDetail']);

const handleSkuChange = (row) => emit('handleSkuChange', row);
const removeDetail = (index) => emit('removePromotionScopeDetail', index);
const addDetail = () => emit('addPromotionScopeDetail');

</script>
