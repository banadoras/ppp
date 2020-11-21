const inputImage = document.getElementById("inputImage");
const imagesPanel = document.getElementById("imagesPanel");
inputImage.addEventListener("change",event=>{
    const images = event.target.files;
    for (let index = 0; index < images.length; index++) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(images[index]);
        img.height = 100;
        img.className="rounded"
        img.style.margin = "5px"
        imagesPanel.appendChild(img);
        img.onload = ()=>{
            URL.revokeObjectURL(this.src);
        }
        
        
    }
})