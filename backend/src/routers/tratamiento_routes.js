import { Router } from "express";
import { eliminarTratamiento, listarTratamientos, registrarTratamiento,
    pagarTratamiento } from "../controllers/tratamiento_controller.js";
import { verificarTokenJWT } from '../middlewares/JWT.js'

const router = Router()

router.post('/tratamiento/registro', verificarTokenJWT,registrarTratamiento)

router.get('/tratamientos', listarTratamientos)

router.delete('/tratamiento/:id', verificarTokenJWT, eliminarTratamiento)

router.post('/tratamiento/pago',verificarTokenJWT,pagarTratamiento)


export default router;