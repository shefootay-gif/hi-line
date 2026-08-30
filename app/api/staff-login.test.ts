import { beforeEach, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { getTableName } from "drizzle-orm";
import { appRouter } from "./router";
import { authenticateRequest } from "./lib/auth";
import { signSessionToken, verifySessionToken } from "./lib/session";

const state = vi.hoisted(()=>({ active:true, hash:"" }));
const makeUser = () => ({id:22,unionId:"local:staff:7",name:"Test staff",email:"staff@example.test",role:"admin",passwordHash:state.hash});
vi.mock("./queries/connection",()=>({getDb:()=>({select:()=>({from:(table:Parameters<typeof getTableName>[0])=>{const query={where:()=>query,limit:async()=>getTableName(table)==="users"?[makeUser()]:[{id:7,isActive:state.active,role:"inventory",permissions:["products","inventory"]}]};return query;}})})}));
vi.mock("./queries/users",()=>({findUserByUnionId:async()=>makeUser(),findUserById:async()=>makeUser()}));
vi.mock("./lib/session",()=>({signSessionToken:vi.fn().mockResolvedValue("signed-test"),verifySessionToken:vi.fn()}));
beforeEach(()=>{state.active=true;state.hash=bcrypt.hashSync("TestStaff!Pass123",4);vi.clearAllMocks();});
it("logs staff in with normalized email and a hashed password",async()=>{
  const headers=new Headers(); const caller=appRouter.createCaller({req:new Request("https://localhost"),resHeaders:headers});
  await expect(caller.auth.localAdminLogin({username:" STAFF@EXAMPLE.TEST ",password:"TestStaff!Pass123"})).resolves.toEqual({success:true});
  expect(signSessionToken).toHaveBeenCalledWith({unionId:"local:staff:7",clientId:"local-staff"});
  expect(headers.has("set-cookie")).toBe(true);
});
it("rejects disabled staff and wrong passwords",async()=>{
  const caller=appRouter.createCaller({req:new Request("https://localhost"),resHeaders:new Headers()});
  await expect(caller.auth.localAdminLogin({username:"staff@example.test",password:"wrong"})).rejects.toThrow();
  state.active=false;
  await expect(caller.auth.localAdminLogin({username:"staff@example.test",password:"TestStaff!Pass123"})).rejects.toThrow();
});
it("reloads permissions and disables an existing staff session without returning its password hash",async()=>{
  vi.mocked(verifySessionToken).mockResolvedValue({unionId:"local:staff:7",clientId:"local-staff"});
  const headers=new Headers({cookie:"hi_line_sid=signed-test"});
  const user=await authenticateRequest(headers);
  expect(user.adminAccess).toEqual({role:"inventory",permissions:["products","inventory"]});
  expect(user).not.toHaveProperty("passwordHash");
  state.active=false; await expect(authenticateRequest(headers)).rejects.toThrow("disabled");
});
