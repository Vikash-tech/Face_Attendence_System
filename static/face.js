// ------- LOAD MODELS FIRST ------
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/static/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/static/models')
]).then(startCamera);


// ------- CAMERA ON ------
let video = null;

function startCamera(){
    video = document.getElementById("videoElement");

    navigator.mediaDevices.getUserMedia({ video:true })
        .then(stream =>{
            video.srcObject = stream;
        })
        .catch(err =>{
            console.log("Camera issue:", err);
            alert("Camera access blocked!");
        });
}


// -------- CAPTURE BUTTON -------
function capturePhoto(){
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    let imageData = canvas.toDataURL("image/jpeg");

    document.getElementById("captured_image").value = imageData;

    alert("Image Captured ✔ Now click Save!");
}
