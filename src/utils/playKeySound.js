// **播放按键音效**
export const playKeySound = () => {
  const audioContext = new (window.AudioContext || window.AudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sawtooth'; // 音色类型：square、sine、triangle、sawtooth
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 频率 (Hz)
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // 音量

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1); // 播放时长 (秒)
};

export const playKeyErrorSound = () => {
  const audioContext = new (window.AudioContext || window.AudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // 设置音色和频率
  oscillator.type = 'square'; // 使用方波音色，更适合警报声
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 初始频率 800Hz

  // 设置音量
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // 音量 50%

  // 连接节点
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // 快速交替频率，模拟警报声
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz
  oscillator.frequency.setValueAtTime(3000, audioContext.currentTime + 0.1); // 0.1秒后切换到1200Hz
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2); // 0.2秒后切换回800Hz
  oscillator.frequency.setValueAtTime(3000, audioContext.currentTime + 0.3); // 0.3秒后切换到1200Hz

  // 开始播放
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.4); // 总播放时长 0.4秒
};

export const playKeySuccessSound = () => {
  const audioContext = new (window.AudioContext || window.AudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // 设置音色和频率
  oscillator.type = 'square'; // 使用正弦波音色，声音更柔和
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 初始频率 800Hz

  // 设置音量
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // 音量 30%

  // 快速交替频率，模拟提示音
  oscillator.frequency.setValueAtTime(3000, audioContext.currentTime); // 800Hz
  oscillator.frequency.setValueAtTime(2000, audioContext.currentTime + 0.1); // 0.1秒后切换到1000Hz
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2); // 0.2秒后切换回800Hz
  oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.3); // 0.3秒后切换到1000Hz

  // 音量淡出效果
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4); // 0.4秒内音量逐渐减小

  // 连接节点
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // 开始播放
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.4); // 播放时长 0.4秒
};

export const playKeyHappySound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // 创建振荡器和音量控制
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // 设置音色
  oscillator1.type = 'triangle'; // 明亮的音色
  oscillator2.type = 'triangle'; // 让两个音一致

  // 设定两个振荡器的频率（和弦效果）
  oscillator1.frequency.setValueAtTime(1200, audioContext.currentTime); // 1200Hz
  oscillator2.frequency.setValueAtTime(1500, audioContext.currentTime); // 1500Hz

  // 让频率快速变化，制造轻快的"叮叮"音
  oscillator1.frequency.linearRampToValueAtTime(1800, audioContext.currentTime + 0.1);
  oscillator2.frequency.linearRampToValueAtTime(2000, audioContext.currentTime + 0.1);

  oscillator1.frequency.linearRampToValueAtTime(1500, audioContext.currentTime + 0.2);
  oscillator2.frequency.linearRampToValueAtTime(1700, audioContext.currentTime + 0.2);

  // 设置音量，初始 40%，然后快速衰减
  gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  // 连接节点
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // 播放
  oscillator1.start();
  oscillator2.start();
  oscillator1.stop(audioContext.currentTime + 0.3);
  oscillator2.stop(audioContext.currentTime + 0.3);
};
