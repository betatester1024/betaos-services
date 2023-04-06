import { database } from "./database";
const argon2 = require('argon2');
export const K = {
  rootDir: '/home/runner/v2/',
  frontendDir: '/home/runner/v2/frontend/',
  jsDir:'/home/runner/v2/.build/frontend/',
  port: 3000,
  userRegex: /^[0-9a-zA-Z_\\-]{1,20}$/,
  roomRegex: "[0-9a-zA-Z_\\-]{1,20}",
  pwdMaxLength: 9e99,
  userMaxLength: 9e99,
  authDB:database.collection("SystemAUTH_V2"),
  msgDB:database.collection("SupportMessaging"),
  uDB:database.collection("BetaUtilities"),
  hashingOptions: {
    type: argon2.argon2d,
    memoryCost: 12288,
    timeCost: 3,
    parallelism: 1,
    hashLength: 50
  },
  // time in ms until accounts expire (indexed according to access-level. 
  // access-level 0 shouldn't exist.)
  expiry: [9e99, 1000*60, 1000*60*60*24*30, 1000*60*60],
}