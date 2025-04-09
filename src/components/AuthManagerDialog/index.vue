<template>
  <el-dialog v-model="visible" title="店长认证:" width="400" :close-on-click-modal="false" :close-on-press-escape="false"
    :show-close="false">
    <el-form :model="form" ref="formRef">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="form.userName" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import { authStoreManager } from "@/api/system/user.js"

const props = defineProps({
  notificationContainer: {
    type: [String, Object],
    default: 'body'
  }
})

const emit = defineEmits(['success', 'failed', 'cancel'])

const visible = ref(false)
const form = ref({
  userName: '',
  password: ''
})
const formRef = ref(null)
let pendingAction = null

// 打开对话框并注册认证后的回调
const requestAuth = (actionCallback, ...args) => {
  pendingAction = { actionCallback, args }
  visible.value = true
}

// 认证成功处理
const handleConfirm = async () => {
  try {
    await authStoreManager(form.value)
    if (pendingAction) {
      pendingAction.actionCallback(...pendingAction.args)
    }
    emit('success')
    resetAndClose()
  } catch (e) {
    emit('failed', e)
    showErrorNotification()
    resetForm()
  }
}

// 取消认证
const handleCancel = () => {
  emit('cancel')
  resetAndClose()
}

// 显示错误通知
const showErrorNotification = () => {
  ElNotification({
    title: 'error',
    message: '没有店长权限，禁止操作！',
    type: 'error',
    position: 'bottom-right',
    appendTo: props.notificationContainer
  })
}

// 重置表单并关闭对话框
const resetAndClose = () => {
  resetForm()
  visible.value = false
  pendingAction = null
}

// 重置表单
const resetForm = () => {
  form.value = { userName: '', password: '' }
}

// 暴露方法给父组件
defineExpose({ requestAuth })
</script>