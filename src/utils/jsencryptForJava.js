import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair
// 一定要更换密钥对

const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuEBVkUu4gQWrir5LGHzY\n' +
  't/BV1WcAFaUkGLFX4mBXfS9KKUOT69POUap5gyoAncqTS0+wStSWXoN54Wj9etBC\n' +
  'uZbe+vbutsy88hSinIUo5/7e+GxHpWRIjbSpV3pC6ejPWbuyeoODWeI4c8Em7xdd\n' +
  'V98WpqCIYyab56sITR9O2OikNw5C48SM49l24YX4UDjTHUK3eXfMxE1PJgaoQyrj\n' +
  '/GysS6qIzY3KmnJPzgAHCD/0eaL6xGSV4l1NzPmOoTvAtyCNAkR94prbvQcLNt7p\n' +
  '7+2Yjos3mbR3SbArscy3yQ95upg/ZT2WV7EwWN7fTrW5islmWjT9yJKbZ3GB/nwD\n' +
  'eQIDAQAB';


// 传递后端加密
export function encryptForJava(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}


