<template>
  <el-select-v2
    :model-value="modelValue"
    filterable
    remote
    clearable
    :options="dataList"
    :remote-method="onSearch"
    :loading="loading"
    :disabled="disabled"
    :multiple="multiple"
    :placeholder="placeholder"
    style="width: 180px"
    :teleported='false' 
    @change="handleChange"
  />
</template>

<script setup>
import { ref, watch } from "vue";
import { listCustomer } from "@/api/order/customer";
import { debounce } from "lodash-es";
import { StatusEnum, DebounceTime, KeywordLength } from './CommonEnum.js'
import { MaxLengthEnum } from '@/api/constants/commonConstants.js'

const props = defineProps({
  modelValue: [String, Number, Array],
  placeholder: { type: String, default: "手机号/邮箱" },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(["update:modelValue"]);

const dataList = ref([]);
const loading = ref(false);
const keyword = ref("");
const pageNum = ref(1);
const pageSize = MaxLengthEnum.maxQuerySize;
const total = ref(0);

/** 搜索函数 */
const fetchCustomers = async (query = "") => {
  console.log("搜索关键词:", query);
  // 打印开始请求的事件 毫秒级别
  console.log("开始请求时间:", new Date().getTime());
  // 输入长度小于指定长度时，清空列表
  if (query.length < KeywordLength) {
    dataList.value = [];
    return;
  }
  // 显示加载中
  loading.value = true;

  try {
    const queryParams = {
      invoicePhone: null,
      contactEmail: null,
      invoiceTax: null,
      pageNum: pageNum.value,
      pageSize
    };

    // 判断query是不是邮箱
    if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(query)) {
      // 邮箱
      queryParams.contactEmail = query;
    } else if (/^\d{6,11}$/.test(query)) {
      // 手机号
      queryParams.invoicePhone = query;
    } else {
      // 其他情况
      queryParams.invoiceTax = query;
    }

    console.log("请求参数:", queryParams);

    // 调用后端接口获取客户列表
    const response = await listCustomer(queryParams);
    dataList.value = response.rows.map(item => ({
      value: item.customerId,
      label: `${item.invoicePhone} - ${item.customerName}`,
      disabled: item.customerStatus == StatusEnum.ENABLE
    }));
    total.value = response.total || 0;
    console.log("结束请求时间:", new Date().getTime());
  } catch (error) {
    console.error("获取客户列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// **防抖搜索**
const handleSearch = debounce(fetchCustomers, DebounceTime);

/** 1 当前输入值发生变化触发的函数 */
const onSearch = (query) => {
  keyword.value = query;
  pageNum.value = 1;
  // 防抖处理
  handleSearch(query);
};

// **确保 v-model 绑定值能正确更新**
const handleChange = (val) => {
  emit("update:modelValue", val);
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) fetchCustomers();
  },
  { immediate: true }
);
</script>
