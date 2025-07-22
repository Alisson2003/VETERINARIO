import Tratamiento from "../models/Tratamiento.js"
import mongoose from "mongoose"

import { Stripe } from "stripe"
const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`)


const registrarTratamiento = async (req,res)=>{
    const{paciente} = req.body

    if(!mongoose.Types.ObjectId.isValid(paciente)){
        return res.status(400).json({error: "ID de paciente no valido"})
    }
    await Tratamiento.create(req.body)

    res.status(200).json({msg:"Tratamiento registrado correctamente"})
}

const listarTratamientos = async (req,res)=>{
    const tratamientos = await Tratamiento.find()
    res.status(200).json(tratamientos)
}

const eliminarTratamiento = async (req,res)=>{
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: "ID de tratamiento no existe"})
    }

    await Tratamiento.findByIdAndDelete(id)
    res.status(200).json({msg:"Tratmiento eliminado correctamente"})
}

const pagarTratamiento = async (req, res) => {

    const { paymentMethodId, treatmentId, cantidad, motivo } = req.body


    try {

        const tratamiento = await Tratamiento.findById(treatmentId).populate('paciente')
        if (!tratamiento) 
            return res.status(404).json({ message: "Tratamiento no encontrado" })
        if (tratamiento.estadoPago === "Pagado") return res.status(400).json({ message: "Este tratamiento ya fue pagado" })
        if (!paymentMethodId) 
            return res.status(400).json({ message: "paymentMethodId no proporcionado" })

        let [cliente] = (await stripe.customers.list({ email:tratamiento.emailPropietario, limit: 1 })).data || [];
        
        if (!cliente) {
            cliente = await stripe.customers.create({ name:tratamiento.nombrePropietario, email:tratamiento.emailPropietario });
        }
        
        const payment = await stripe.paymentIntents.create({
            amount:cantidad,
            currency: "USD",
            description: motivo,
            payment_method: paymentMethodId,
            confirm: true,
            customer: cliente.id,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never"
            }
        })

        if (payment.status === "succeeded") {
            await Tratamiento.findByIdAndUpdate(treatmentId, { estadoPago: "Pagado" });
            return res.status(200).json({ msg: "El pago se realizó exitosamente" })
        }
        
    } catch (error) {
        res.status(500).json({ msg: "Error al intentar pagar el tratamiento", error });
    }
}


export{
    registrarTratamiento,
    eliminarTratamiento,
    listarTratamientos,
    pagarTratamiento
}
