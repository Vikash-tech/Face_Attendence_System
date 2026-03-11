function saveEmployee(){
    let img = document.getElementById("captured_image").value;
    let name = document.getElementById("emp_name").value;

    if(!name){
        alert("Enter employee name");
        return;
    }

    if(img.length < 100){
        alert("Capture photo first");
        return;
    }

    document.getElementById("regForm").submit();
}
