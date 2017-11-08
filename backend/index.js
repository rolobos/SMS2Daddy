var PouchDB = require('pouchdb');
var querystring = require('querystring');
var http = require('http');
var db = new PouchDB('http://admin:hulk7793@127.0.0.1:5984/sms2daddy');
var changes = db.changes({
    since: 'now',
    live: true,
    include_docs: true
}).on('change', event => {
    var doc = event.doc;
    if (doc.tipo === 'mensaje' && !doc.sms) {
        doc.destinatarios.forEach(destinatario => {
            getTel(destinatario.id).then((tel)=>{
                sendSMS("569"+tel,doc.mensaje)
            })
        });
    }
});
function sendSMS(tel, text) {
    var promesa = new Promise((resolve,reject)=>{
        // Se contruye la cadena del post desde un objeto
        var post_data = querystring.stringify({
            'cmd' : 'sendsms',
            'domainId' : 'shankarabusiness',
            'login': 'shankarabusiness@gmail.com',
            'passwd': 'AHB5j8zknw3',
            'dest' : tel,
            'msg' : text
        });
    
        // Un objeto de opciones sobre donde se envia el post
        var post_options = {
            host: 'www.altiria.net',
            port: '80',
            path: '/api/http',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };
    
        // Se efectua la petición
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                //Es necesario procesar la respuesta y los posibles errores
                if(chunk.substring(0,2)==='OK'){
                    resolve
                } else {
                    reject
                }
                console.log('Response: ' + chunk);
            });
        });
    
        // post the data
        post_req.write(post_data);
        post_req.end();   
    });
    return promesa;
}

function getTel(usuario){
    var promesa = new Promise((resolve,reject)=>{
        db.get(usuario).then(data => {
            console.log("tel",data.telefono)
            resolve(data.telefono)
        })
    });
    return promesa;
}