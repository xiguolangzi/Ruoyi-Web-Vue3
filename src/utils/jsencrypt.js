import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair
// 一定要更换密钥对

const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtQ93kKVA3qM9pzHtZrwy\n'+
'/jt6i55atNIVyf1Q88aQTGSQp6VhmuIEFWlCx9imyzdx2C9tcmEXU+EZ8vuXghy8\n'+
'RVFNthvdyfWD7y284+dT9pabDrYaJPuaTSrNMG8znmDbCJ4grWHtOfywKjPkdEIf\n'+
'4FcuDWqrefZKlT1QykK5FZEmquRiiRcGo4EF6ueSFyUgmq18okGqQO03zgd4WY2h\n'+
'HXEdbD9poYkfZJ8CHatE+uTNZRWiDWNVHMuFX6YDZKGs/sXPiEamM1tXIdP5y/li\n'+
'KO9xmpFP0e/6jyBb2NmazLopLWsPw/FcryJmPIrxSjk3fd2GYI31n+K3qs04x7cw\n'+
'nwIDAQAB'


const privateKey = 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1D3eQpUDeoz2n\n'+
'Me1mvDL+O3qLnlq00hXJ/VDzxpBMZJCnpWGa4gQVaULH2KbLN3HYL21yYRdT4Rny\n'+
'+5eCHLxFUU22G93J9YPvLbzj51P2lpsOthok+5pNKs0wbzOeYNsIniCtYe05/LAq\n'+
'M+R0Qh/gVy4Naqt59kqVPVDKQrkVkSaq5GKJFwajgQXq55IXJSCarXyiQapA7TfO\n'+
'B3hZjaEdcR1sP2mhiR9knwIdq0T65M1lFaINY1Ucy4VfpgNkoaz+xc+IRqYzW1ch\n'+
'0/nL+WIo73GakU/R7/qPIFvY2ZrMuiktaw/D8VyvImY8ivFKOTd93YZgjfWf4req\n'+
'zTjHtzCfAgMBAAECggEAW7pURrGR5bkp2PSQY0XhR692bBlztrvgUg7F3lqwbCNe\n'+
'rbA5fLAYhYhoTrrR9Y5HXNDaT+IkYVhfPxx7K23HbA6+og4IFPMPPjMbyRI/FWRD\n'+
'dfaH1EiraYDPp0QPEKPdE8aYo35DIueDkD3t9YAyigNgz2dFLGq8alNABNg80FF3\n'+
'4EYfuS8pHEPMv+KfA1v+dZTQKFcThkQsqcs1zc9jxr6KerDUcT2ylLV702NgFFvt\n'+
'tvvqFLh01E9g6sYnZKRgCWK1ElKhCnUvRA3h4YA5ARAAqT/nLrlPFIwFit5Cnlnr\n'+
'Sflr56AHLzid6PN6tcEivw0hcYqoWweymdpf+X0kEQKBgQDttHMIUKTL6L13xHXU\n'+
'5ZfQyqc1/hrcT/HJIZpLCOW3K5EZLFNZF6cCYK0GQOni2MFiO0+k0jU1M9YcWmEP\n'+
'2qY80f6xg8XkPOlTjQxZ40tPy/2GpAn5w8UIEDDzgJAiguqzlLU7x7U2FU21IwSE\n'+
'9eKr4/m/ZJ4QxDOPHEGPlPWbUwKBgQDC/vCK+IkoZhDp1DnFKo8Ca0lL6/Ds5VeA\n'+
'o5NwYzKoWAj+270haIrhJh39lS2sCBupUTUGnhWznpkfelHvLyfcMvyT1vPNKknI\n'+
'inw7qc8JlCixyeGXLCBissllDarfEB4AA5n6pwkp3EfImrGuVhD+bDLxkjI4Lcyh\n'+
'XdLn+is4BQKBgAKBm5Dj4MjxnEXOAXwMK6yc5mRwWHIoOaFoREs0Pc/PmskMKZjP\n'+
'4gfpYwmk15J3vJo/i9huCveTo1dLMKjNImGTyT6v5/8/ESq7Wvz7o4ik2vh3dE94\n'+
'2/P4z7tRiLOEc9sO31ZRBb0bPmWBiAOq4Af18GUvN2dv2idRIfPUmz5XAoGAUtJt\n'+
'4NkHiL0xWd/mWbRl4aUoELM6NaSDsgPIT+gSUCZ0S6uRfWsl8dN60YZXS8Z12UjA\n'+
'uPrUROKMLy6JNopU59ZQKYsXKoFXrXIEqmLJqUvgrQMOamM3rjQ6Dk3r0arK0z60\n'+
'XB4uajVB2Ba8eUvdE/No/+oUon/xdmifeCBt0vECgYEA5BAj6qbo8yqMpZZ1OGHo\n'+
'JLpNb6+Qx6W7bxvFsFjSS7R0dGQWfAxoKR1Mn3ybu2K1D6bRobFEGIYbPQnXjZbj\n'+
'h2ckh0XYrq1Pumgvo6ljM5I9Kdw3XHJIQHjfa7MXpxPkKxUsgAOZ6XNBvAwlUosl\n'+
'oXOJmzQfQX4E61cEFoV4vho='

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}

