<template>
  <div class="container mx-auto p-4 space-y-4">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>凭证录入</span>
        </div>
      </template>
      <el-form :model="voucherForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="凭证类型">
              <el-select v-model="voucherForm.voucherType" placeholder="选择凭证类型">
                <el-option 
                  v-for="type in voucherTypes" 
                  :key="type" 
                  :label="type" 
                  :value="type" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="凭证日期">
              <el-date-picker 
                v-model="voucherForm.voucherDate" 
                type="date" 
                placeholder="选择日期" 
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="摘要">
          <el-input v-model="voucherForm.abstract" placeholder="输入摘要" />
        </el-form-item>

        <div 
          v-for="(entry, index) in voucherForm.entries" 
          :key="index" 
          class="mb-4 flex items-center space-x-2"
        >
          <el-input 
            v-model="entry.subject" 
            placeholder="会计科目" 
            class="w-1/3" 
          />
          <el-input-number 
            v-model="entry.debit" 
            :precision="2" 
            :controls="false" 
            placeholder="借方金额" 
            class="w-1/4" 
          />
          <el-input-number 
            v-model="entry.credit" 
            :precision="2" 
            :controls="false" 
            placeholder="贷方金额" 
            class="w-1/4" 
          />
          <el-button 
            v-if="voucherForm.entries.length > 1" 
            type="danger" 
            @click="removeVoucherEntry(index)"
          >
            删除
          </el-button>
        </div>

        <div class="flex justify-between mt-4">
          <el-button @click="addVoucherEntry">添加分录</el-button>
          <el-button type="primary" @click="submitVoucher">保存凭证</el-button>
        </div>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>凭证列表</span>
        </div>
      </template>
      <el-table :data="voucherList" stripe>
        <el-table-column prop="voucherType" label="凭证类型" />
        <el-table-column prop="voucherDate" label="凭证日期" />
        <el-table-column prop="abstract" label="摘要" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button @click="viewVoucherDetails(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog 
      v-model="dialogVisible" 
      title="凭证详情" 
      width="50%"
    >
      <template v-if="currentVoucher">
        <p>凭证类型：{{ currentVoucher.voucherType }}</p>
        <p>凭证日期：{{ currentVoucher.voucherDate }}</p>
        <p>摘要：{{ currentVoucher.abstract }}</p>
        <el-table :data="currentVoucher.entries">
          <el-table-column prop="subject" label="会计科目" />
          <el-table-column prop="debit" label="借方金额" />
          <el-table-column prop="credit" label="贷方金额" />
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 凭证类型
const voucherTypes = ['收入凭证', '支出凭证', '转账凭证']

// 凭证表单初始状态
const voucherForm = reactive({
  voucherType: '',
  voucherDate: '',
  abstract: '',
  entries: [{ subject: '', debit: 0, credit: 0 }]
})

// 凭证列表
const voucherList = ref([])

// 对话框控制
const dialogVisible = ref(false)
const currentVoucher = ref(null)

// 添加分录
const addVoucherEntry = () => {
  voucherForm.entries.push({ subject: '', debit: 0, credit: 0 })
}

// 删除分录
const removeVoucherEntry = (index) => {
  if (voucherForm.entries.length > 1) {
    voucherForm.entries.splice(index, 1)
  }
}

// 提交凭证
const submitVoucher = () => {
  // 校验借贷平衡
  const totalDebit = voucherForm.entries.reduce((sum, entry) => sum + entry.debit, 0)
  const totalCredit = voucherForm.entries.reduce((sum, entry) => sum + entry.credit, 0)

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    ElMessage.error('借贷不平衡，请检查!')
    return
  }

  // 保存凭证
  const newVoucher = {
    ...voucherForm,
    id: Date.now(),
    entries: [...voucherForm.entries]
  }
  
  voucherList.value.push(newVoucher)
  resetForm()
}

// 重置表单
const resetForm = () => {
  voucherForm.voucherType = ''
  voucherForm.voucherDate = ''
  voucherForm.abstract = ''
  voucherForm.entries = [{ subject: '', debit: 0, credit: 0 }]
}

// 查看凭证详情
const viewVoucherDetails = (voucher) => {
  currentVoucher.value = voucher
  dialogVisible.value = true
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>