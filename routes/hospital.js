var express = require('express');

var middleware = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');


//Obtener todos los hospitales
app.get('/', (req, res, next) => {

    Hospital.find({  }, 'nombre img usuario')
        .exec(
            (err, hospitales)=> {
                if(err) {
                    return res.status(500).json({
                        ok : false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok : true,
                    hospitales: hospitales
                });
    });

    
});


//Verificar token




//Actualizar hospital
app.put("/:id", middleware.verificaToken, (req, res)=>{

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital)=>{
       
        if(err) {
            return res.status(500).json({
                ok : false,
                mensaje: 'Error actualizando hospital',
                errors: err
            });
        }

        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id '+id+" no existe",
                errors: {message: 'No existe un hospital con ese id'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = body.usuario;

        hospital.save((err, hospitalGuardado)=>{
            if(err) {
                return res.status(400).json({
                    ok : false,
                    mensaje: 'Error actualizando hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok : true,
                hospital: hospitalGuardado
            });
        });
    });

});


//Crear un nuevo hospital
app.post('/',middleware.verificaToken, (req, res)=> {

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img:body.img,
        usuario: req.usuario
    });

    hospital.save(( err, hospitalGuardado ) => {
        if(err) {
            return res.status(400).json({
                ok : false,
                mensaje: 'Error insertando hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok : true,
            hospital: hospitalGuardado
        });

    });

    
});


// Borrar un hospital por id
app.delete('/:id', middleware.verificaToken, (req, res)=>{
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado)=>{
        if(err) {
            return res.status(500).json({
                ok : false,
                mensaje: 'Error borrando hospital',
                errors: err
            });
        }

        if(!hospitalBorrado) {
            return res.status(400).json({
                ok : false,
                mensaje: 'No existe hospital con ese id',
                errors: {message: 'No existe un hospital con ese id'}
            });
        }

        res.status(200).json({
            ok : true,
            hospital: hospitalBorrado
        });
    });
});



module.exports = app;