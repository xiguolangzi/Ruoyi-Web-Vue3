import FingerprintJS from '@fingerprintjs/fingerprintjs';

// 创建一个响应式变量用于存储设备指纹
const deviceFingerprint = ref(null);

/** 生成设备指纹并缓存 */
const generateFingerprint = async () => {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  deviceFingerprint.value = result.visitorId;
  console.log("获取到的设备唯一标识:", deviceFingerprint.value);

  // 可选：将指纹存入 LocalStorage，防止重复计算
  localStorage.setItem('device_fingerprint', result.visitorId);
};

/** 获取设备唯一标识 */
export function getFingerprint() {
  onMounted(async () => {
    // 先尝试从 LocalStorage 获取
    const cachedFingerprint = localStorage.getItem('device_fingerprint');
    if (cachedFingerprint) {
      deviceFingerprint.value = cachedFingerprint;
    } else {
      await generateFingerprint();
    }
  });

  return { deviceFingerprint };
}