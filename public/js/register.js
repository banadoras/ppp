const userImage = document.getElementById("user-image");
const inputFile = document.getElementById("input-file");
inputFile.addEventListener("change", event => {
    const images = event.target.files;
    userImage.src = URL.createObjectURL(images[0]);
     userImage.onload = () => {
        URL.revokeObjectURL(this.src);
    }
})