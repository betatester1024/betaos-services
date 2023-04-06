const argon2 = require('argon2');
// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
import {K} from './consts';

export async function userRequest(token:string) {
  let tokenData:{associatedUser:string, expiry:number} = await K.authDB.findOne({fieldName:"Token", token:token});
  if (!tokenData) {
    return {status:"ERROR", data:{error:"Your session could not be found!"}, token:""}
  }
  let userData:{permLevel:number, alias:string} = await K.authDB.findOne({fieldName:"UserData", user:tokenData.associatedUser});
  if (Date.now() > tokenData.expiry) {
    return {status:"ERROR", data:{error:"Your session has expired!"}, token:""};
  }
  return {status:"SUCCESS", data: {user: tokenData.associatedUser, alias:userData.alias??userData.user, perms:userData.permLevel, expiry: tokenData.expiry}, token:token};
}
