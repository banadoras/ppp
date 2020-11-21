const firstDisplayedImage = document.querySelector(".displayed-image");
const clickedImage = document.getElementById("clicked-image");
const displayedImages = document.getElementsByClassName("displayed-image")
clickedImage.src = firstDisplayedImage.src;
clickedImage.height = 500
for (let index = 0; index < displayedImages.length; index++) {
    const image = displayedImages[index];
    image.addEventListener("click",(event)=>{
        clickedImage.src = image.src;
        console.log(this)
    })
}
console.log("Something")