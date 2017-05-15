var db=require('./myStorage'),
    DB=new myDB('./data'),
    util=require('util')//para la salida por pantalla de objetos complejos

db.warmupEmmitter.once("warmup",() => {

       DB.getLastObjects('cotorras',3,function(data){console.log(data);})
       DB.createDataset('motos',{'creator':'yo','about':'vehiculos'})
       DB.createDataset('coches',{'creator':'yo','about':'vehiculos'})
       DB.createDataset('camiones',{'creator':'yo','about':'vehiculos'})

       DB.insertObject('coches',{body:',mi primer coche',creator:'yo'})

       DB.insertObject('coches',{body:',mi segundo coche',creator:'yo'})

       DB.insertObject('camiones',{body:',mi primer camion',creator:'yo'})

       DB.insertObject('motos',{body:',mi primera moto',creator:'yo'})
       DB.insertObject('motos',{body:',mi segunda moto',creator:'yo'})
       DB.insertObject('motos',{body:',mi tercera moto',creator:'yo'})
       DB.getLastObjects('motos',2,function(data){console.log(data);})

      console.log(DB.count);
      console.log(util.inspect(DB));
});
