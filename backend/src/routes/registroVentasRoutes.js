const router=require("express").Router();
const {crear,listar}=require("../controllers/registroVentasController");
router.get("/",listar);
router.post("/",crear);
module.exports=router;
