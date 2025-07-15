import { Router } from "express";
import { eliminarTratamiento, listarTratamientos, registrarTratamiento } from "../controllers/tratamiento_controller.js";

const router = Router()

router.post('/tratamiento/registro', registrarTratamiento)

router.get('/tratamientos', listarTratamientos)

router.delete('/tratamiento/:id', eliminarTratamiento)



export default router;