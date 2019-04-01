var express = require('express');

var middleware = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');


//Obtener todos los medicos
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // si existe param, es un num, si no, es un 0
    desde = Number(desde);

    Medico.find({  })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos)=> {
                if(err) {
                    return res.status(500).json({
                        ok : false,
                        mensaje: 'Error cargando médico',
                        errors: err
                    });
                }
                Medico. countDocuments({}, (err, conteo)=>{
                    res.status(200).json({
                        ok : true,
                        medicos: medicos,
                        total: conteo
                    });
                })
                
    });

    
});

//Obtener medico
app.get('/:id', (req, res)=>{
    var id = req.params.id;

    Medico.findById(id, (err, medico)=>{
       
        if(err) {
            return res.status(500).json({
                ok : false,
                mensaje: 'Error buscando médico',
                errors: err
            });
        }

        if(!medico){
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id '+id+" no existe",
                errors: {message: 'No existe un médico con ese id'}
            });
        }
       
        res.status(200).json({
            ok : true,
            medico: medico
        });
        
    });
});

//Verificar token




//Actualizar medico
app.put("/:id", middleware.verificaToken, (req, res)=>{

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico)=>{
       
        if(err) {
            return res.status(500).json({
                ok : false,
                mensaje: 'Error actualizando médico',
                errors: err
            });
        }

        if(!medico){
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id '+id+" no existe",
                errors: {message: 'No existe un médico con ese id'}
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario;


        medico.save((err, medicoGuardado)=>{
            if(err) {
                return res.status(400).json({
                    ok : false,
                    mensaje: 'Error actualizando médico',
                    errors: err
                });
            }

            res.status(200).json({
                ok : true,
                medico: medicoGuardado
            });
        });
    });

});


//Crear un nuevo medico
app.post('/',middleware.verificaToken, (req, res)=> {

    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img:body.img,
        usuario: req.usuario,
        hospital: body.hospital
    });

    medico.save(( err, medicoGuardado ) => {
        if(err) {
            return res.status(400).json({
                ok : false,
                mensaje: 'Error insertando medico',
                errors: err
            });
        }

        res.status(201).json({
            ok : true,
            medico: medicoGuardado
        });

    });

    
});


// Borrar un medico por id
app.delete('/:id', middleware.verificaToken, (req, res)=>{
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado)=>{
        if(err) {
            return res.status(500).json({
                ok : false,
                mensaje: 'Error borrando medico',
                errors: err
            });
        }

        if(!medicoBorrado) {
            return res.status(400).json({
                ok : false,
                mensaje: 'No existe medico con ese id',
                errors: {message: 'No existe un medico con ese id'}
            });
        }

        res.status(200).json({
            ok : true,
            medico: medicoBorrado
        });
    });
});



module.exports = app;