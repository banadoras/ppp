const fs = require("fs")

var extract = function extractImageList(files){
    var finalList = [];
    if(Array.isArray(files)){
        files.forEach(file=>{
            fs.readFile(file.path,(error,data)=>{
                if(!error){
                    const src = "data:" + file.type + ";base64," + Buffer.from(data).toString("base64");
                    finalList.push({name:file.name,type:file.type,path:file.path,size:file.size,src:src})
                }else{
                    console.log("Error in reading file")
                }
            })
        })
        console.log("Muliptle files extracted")
      
    }else{
            fs.readFile(files.path,(error,data)=>{
                if(!error){
                    const src = "data:" + files.type + ";base64," + Buffer.from(data).toString("base64");
                    finalList.push({name:files.name,type:files.type,path:files.path,size:files.size,src:src})
                }else{
                    console.log("Error in reading file")
                }
                
            })
            console.log("Single file extracted")
            
    }

    return finalList;
}

module.exports = extract;