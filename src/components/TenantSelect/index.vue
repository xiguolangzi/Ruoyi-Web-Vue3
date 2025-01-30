<template>
    <div v-if="show">
        <el-select
            v-model="selectedTenantId"
            filterable
            clearable
            placeholder="请选中租户"
            style="width: 200px"
            @change="handleTenantChange"
        >
            <template #prefix><svg-icon icon-class="admin" class="el-input__icon input-icon" /></template>
            <el-option
            v-for="item in tenantList"
            :key="item.tenantId"
            :label="item.tenantName"
            :value="item.tenantId"
            />
        </el-select>
    </div>
</template>

<script setup name="TenantSelect">
import { selectAll } from "@/api/system/tenant";
import useUserStore from '@/store/modules/user'
import { ref } from 'vue';

// 只有系统用户才展示
const userStore = useUserStore();
const show = ref(false);

const selectedTenantId = ref(null); // 选中的租户ID

// 获取租户列表
const tenantList = ref([]); // 存储租户列表
const fetchTenantList = async () => {
    try {
    const response = await selectAll();
    tenantList.value = response.data;
    } catch (error) {
    console.error('获取租户列表失败:', error);
    }
};

const handleTenantChange = () => {
    // 处理清空选择时的值 undefined
    if(!selectedTenantId.value){
        userStore.tenantId = null;
    }else{
        userStore.tenantId = selectedTenantId.value;
    }
};

// 监听 tenantList 的变化并设置默认值
watch(tenantList, (newVal) => {
    if (newVal.length > 0 && !selectedTenantId.value) {
        selectedTenantId.value = newVal[0].tenantId; // 默认选择第一个租户
        userStore.tenantId = selectedTenantId.value; // 同步到用户状态
    }
});

// 展示才获取租户列表，否则不会显示下拉框
console.log("userStore.userType----", userStore.userType);
if (userStore.userType === "00") {
    show.value = true;
    fetchTenantList()
}

</script>

<style lang="scss" scoped>

</style>