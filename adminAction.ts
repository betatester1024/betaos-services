import {uDB} from './consts';

export async function adminAction(action:string, options:any, token:string) 
{
  let usrInfo = await userRequest(token);
  if (usrInfo.status != "SUCCESS") return usrInfo;
  if (usrInfo.data.perms < 2) 
    return {status:"ERROR", data:{error:"No admin permissions"}, token};
  switch(action) 
  {
    case "suspendPage":
      await uDB.updateOne({fieldName:"suspendedPages", page:options.page},
                          {$set:{suspended:options.suspendedQ}}, 
                          {upsert:true});
      return {status:"SUCCESS", data:null, token:token};
  }
}