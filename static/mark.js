function markAttendance(){
    let img = document.getElementById("captured_image").value;

    if(!img){
        alert("Capture photo first");
        return;
    }

    document.getElementById("markForm").submit();
}
