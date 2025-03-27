class SnowflakeID {
  constructor({ objectId = 0, dataCenterId = 0 } = {}) {
    // 雪花算法的位数分配
    this.epoch = 1609459200000n; // 使用 BigInt
    this.machineIdBits = 5n;
    this.dataCenterIdBits = 5n;
    this.sequenceBits = 12n;

    // 最大值计算
    this.maxMachineId = -1n ^ (-1n << this.machineIdBits);
    this.maxDataCenterId = -1n ^ (-1n << this.dataCenterIdBits);
    this.maxSequence = -1n ^ (-1n << this.sequenceBits);

    // 移位偏移量
    this.machineIdShift = this.sequenceBits;
    this.dataCenterIdShift = this.sequenceBits + this.machineIdBits;
    this.timestampShift = this.sequenceBits + this.machineIdBits + this.dataCenterIdBits;

    // 将 objectId 映射为有效的 machineId
    this.machineId = BigInt(objectId) % (this.maxMachineId + 1n);
    this.dataCenterId = BigInt(dataCenterId);
    this.sequence = 0n;
    this.lastTimestamp = -1n;

    // 校验机器ID和数据中心ID
    if (this.machineId > this.maxMachineId || this.machineId < 0n) {
      throw new Error(`Machine ID must be between 0 and ${this.maxMachineId}`);
    }
    if (this.dataCenterId > this.maxDataCenterId || this.dataCenterId < 0n) {
      throw new Error(`Data Center ID must be between 0 and ${this.maxDataCenterId}`);
    }
  }

  // 生成下一个ID
  nextId() {
    let timestamp = this.currentTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error("Clock moved backwards. Refusing to generate id");
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & this.maxSequence;
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - this.epoch) << this.timestampShift) |
      (this.dataCenterId << this.dataCenterIdShift) |
      (this.machineId << this.machineIdShift) |
      this.sequence;

    // **转换成 Number**
    return Number(id);
  }


  // 获取当前时间戳
  currentTimestamp() {
    return BigInt(Date.now());
  }

  // 等待下一毫秒
  waitNextMillis(lastTimestamp) {
    let timestamp = this.currentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp();
    }
    return timestamp;
  }
}

// 导出 SnowflakeID 类
export default SnowflakeID;