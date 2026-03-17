// LOGIN
function login(){
    let u = document.getElementById("user").value;
    let p = document.getElementById("pass").value;

    if(u && p){
        document.getElementById("loginPage").style.display="none";
        document.getElementById("mainPage").style.display="block";
        document.body.classList.remove("login-bg");
    }else{
        alert("Please enter login details");
    }
}

// LOGOUT
function logout(){
    location.reload();
}

// IMAGE PREVIEW
function previewFile(){
    let fileInput = document.getElementById("file");
    let preview = document.getElementById("preview");

    if(fileInput.files.length > 0){
        let file = fileInput.files[0];
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
    }
}

// ================= OCR ANALYSIS =================
function analyze(){

    let fileInput = document.getElementById("file");
    let result = document.getElementById("result");

    // check file
    if(fileInput.files.length === 0){
        result.innerHTML = "⚠️ Please upload certificate!";
        result.style.color = "yellow";
        return;
    }

    let file = fileInput.files[0];

    result.innerHTML = "⏳ Scanning certificate...";
    result.style.color = "white";

    Tesseract.recognize(file, 'eng')
    .then(({ data: { text } }) => {

        console.log("OCR TEXT:", text);

        let lower = text.toLowerCase();
        let score = 0;
        let issues = [];

        // flexible checks
        if(lower.includes("board") || lower.includes("education")){
            score++;
        } else {
            issues.push("Board name unclear");
        }

        if(lower.includes("certificate")){
            score++;
        } else {
            issues.push("Certificate keyword missing");
        }

        if(text.match(/\d{6,12}/)){
            score++;
        } else {
            issues.push("Roll number not found");
        }

        if(text.match(/\d{2}\/\d{2}\/\d{4}/)){
            score++;
        } else {
            issues.push("Date not detected");
        }

        // final result
        if(score >= 2){
            result.innerHTML = "✅ LIKELY ORIGINAL CERTIFICATE";
            result.style.color = "#00ffcc";
        } else {
            result.innerHTML = "❌ SUSPICIOUS CERTIFICATE<br><br>🔍 Issues:<br>- " + issues.join("<br>- ");
            result.style.color = "#ff4d4d";
        }

    })
    .catch(err => {
        console.error(err);
        result.innerHTML = "❌ Error reading certificate!";
        result.style.color = "red";
    });
}


// ================= QR SCANNER =================
let qrScanner;

function startQR(){

    let result = document.getElementById("result");
    let reader = document.getElementById("reader");

    result.innerHTML = "📷 Starting camera...";
    reader.innerHTML = "";

    qrScanner = new Html5Qrcode("reader");

    Html5Qrcode.getCameras()
    .then(devices => {

        if(devices.length > 0){

            let cameraId = devices[0].id;

            qrScanner.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: 250
                },
                (decodedText) => {

                    result.innerHTML = "✅ QR VERIFIED<br><br>Data: " + decodedText;
                    result.style.color = "#00ffcc";

                    qrScanner.stop().catch(()=>{});
                },
                (error) => {
                    // ignore scan errors
                }
            );

        } else {
            result.innerHTML = "❌ No camera found!";
        }

    })
    .catch(err => {
        console.error(err);
        result.innerHTML = "❌ Camera permission denied!";
        result.style.color = "red";
    });
}
