import { NestFactory } from "@nestjs/core";
import { Module, Controller, Get, Post, Body, Param } from "@nestjs/common";

const db:any = {
  families:[{id:"f1",name:"Baño de crema",status:"active"}],
  productBases:[{id:"pb1",code:"PB-1",name:"Baño de crema Cherry",status:"active"}],
  skus:[{id:"s1",code:"SKU-1",name:"Baño de crema Cherry 250ML",stock:120,status:"active"}],
  formulas:[{id:"fm1",name:"Matriz Baño de crema",status:"approved",warnings:[]}],
  productionOrders:[], salesOrders:[], aliases:[{id:"a1",alias:"ORO CREMA",canonical:"TRAT. ORO EN CREMA",status:"active"}],
};

@Controller("auth") class AuthController {
  @Post("login") login(@Body() body:any){ return {token:"demo-token",user:{email:body.email,role:"admin"}}; }
  @Post("refresh") refresh(){ return {token:"demo-token-refresh"}; }
  @Post("logout") logout(){ return {ok:true}; }
  @Get("me") me(){ return {email:"admin@demo.local",roles:["admin"]}; }
}

@Controller("catalog") class CatalogController {
  @Get("families") families(){ return db.families; }
  @Get("product-bases") productBases(){ return db.productBases; }
  @Post("product-bases") createPB(@Body() body:any){ const n={id:`pb${Date.now()}`,...body,status:"active"}; db.productBases.push(n); return n; }
  @Get("skus") skus(){ return db.skus; }
  @Get("aliases") aliases(){ return db.aliases; }
}

@Controller("formulas") class FormulaController {
  @Get() list(){ return db.formulas; }
  @Get(":id") detail(@Param("id") id:string){ return db.formulas.find((f:any)=>f.id===id); }
  @Post() create(@Body() body:any){ const n={id:`fm${Date.now()}`,status:"draft",warnings:[],...body}; db.formulas.push(n); return n; }
  @Post(":id/approve") approve(@Param("id") id:string){ const f=db.formulas.find((x:any)=>x.id===id); if(f) f.status="approved"; return {event:"formula.approved",formula:f}; }
}

@Controller("production") class ProductionController {
  @Get("production-orders") list(){ return db.productionOrders; }
  @Post("production-orders") create(@Body() b:any){ const po={id:`po${Date.now()}`,status:"planned",...b}; db.productionOrders.push(po); return po; }
  @Post(":id/start-batch") start(@Param("id") id:string){ return {event:"production.order.started",id}; }
  @Post(":id/close-batch") close(@Param("id") id:string,@Body() b:any){ if(!b.responsible) throw new Error("responsible required"); return {event:"production.batch.closed",id}; }
}

@Controller("sales") class SalesController {
  @Get("sales-orders") list(){ return db.salesOrders; }
  @Post("sales-orders") create(@Body() b:any){ if(!b.customerId) throw new Error("customer required"); if(!b.items?.length) throw new Error("sku required"); const so={id:`so${Date.now()}`,status:"confirmed",...b}; db.salesOrders.push(so); return {event:"sales.order.confirmed",order:so}; }
}

@Controller("reporting") class ReportingController {
  @Get("dashboard") dash(){ return {kpis:[{label:"Ventas",value:1450000},{label:"Margen",value:"41%"},{label:"Lotes abiertos",value:3}]}; }
  @Get("data-quality") dq(){ return {pendingAliases:4,skusWithoutPrice:2,formulasWarnings:1}; }
}

@Module({controllers:[AuthController,CatalogController,FormulaController,ProductionController,SalesController,ReportingController]}) class AppModule {}

async function bootstrap(){
  const app=await NestFactory.create(AppModule);
  app.enableCors({origin:true,credentials:true});
  await app.listen(3001);
}
bootstrap();
