var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');




// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next)=> {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos de coleccion 
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if(tiposValidos.indexOf(tipo)<0){
        return res.status(400).json({
            ok : false,
            mensaje: 'Tipo inválido',
            errors: {message:'Tipo inválido. Válidos: '+ tiposValidos.join(', ')}
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok : false,
            mensaje: 'Error subiendo archivos',
            errors: {message:'Debe seleccionar una imagen'}
        });
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    var file = req.files.imagen;
    var nombreCortado = file.name.split('.');
    var extension = nombreCortado[nombreCortado.length -1];

    //Solo aceptamos estas extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if(extensionesValidas.indexOf(extension) <0){
        return res.status(400).json({
            ok : false,
            mensaje: 'Extensión inválida',
            errors: {message:'Extensión inválida. Válidas: '+ extensionesValidas.join(', ')}
        });
    }

    //Nombre de archivo personalizado
    var nombreFile = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    //Mover el archivo a un path especifico
    var path = `./uploads/${ tipo }/${ nombreFile }`;

    file.mv(path, err =>{
        if(err){
            return res.status(500).json({
                ok : false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreFile, res)

    });
});

function subirPorTipo(tipo, id, nombreArchivo, res){

    if(tipo === "usuarios"){
        Usuario.findById(id, (err, usuario)=>{
            if(!usuario){
                return res.status(404).json({
                    ok : false,
                    mensaje: 'No existe id',
                    errors: err
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            // SI existe, elimina la imagen anterior
           
            if(fs.existsSync(pathViejo)){ 
                fs.unlinkSync(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado)=>{               
                return res.status(200).json({
                    ok : true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if(tipo === "medicos"){
        Medico.findById(id, (err, medico)=>{
            if(!medico){
                return res.status(404).json({
                    ok : false,
                    mensaje: 'No existe id',
                    errors: err
                });
            }
            var pathViejo = './uploads/medico/' + medico.img;
            // SI existe, elimina la imagen anterior
           
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado)=>{               
                return res.status(200).json({
                    ok : true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });

        });
    }

    if(tipo === "hospitales"){
        Hospital.findById(id, (err, hospital)=>{
            if(!hospital){
                return res.status(404).json({
                    ok : false,
                    mensaje: 'No existe id',
                    errors: err
                });
            }
            var pathViejo = './uploads/hospital/' + hospital.img;
            // SI existe, elimina la imagen anterior
           
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado)=>{               
                return res.status(200).json({
                    ok : true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }  
}

module.exports = app;