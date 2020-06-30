function testStart(){
    // upon clicking start test this function will execute
    document.getElementById("face-range").style.display = "block" // display face distance in range
    document.getElementById("face-approx").style.display = "block" // display approx face distance
    document.getElementById("retest").style.display = "block" // display button for retest
    document.getElementById("test-start-button").disabled = "true" // disable age submit button
    document.getElementById("form-select").disabled = "true" // disable age selection form once test starts
    let select = document.getElementById("form-select")
    let value = select.options[select.selectedIndex].value // value of option selected
    openCvReady(value) // calling openCvReady function to start test
}

function openCvReady(option) {

    let video = document.getElementById("cam_input"); // video is the id of video tag

    // streaming video 
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = stream;
        video.play();    
    })
    .catch(function(err) {
        console.log("An error occurred! " + err);
    });

    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4); // source of video from video tag
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);// destination of processed video to canvas
    let gray = new cv.Mat(); 
    let cap = new cv.VideoCapture(cam_input); // capturing the video
    let faces = new cv.RectVector();
    let classifier = new cv.CascadeClassifier();
    let utils = new Utils('errorMessage');
    let faceCascadeFile = 'haarcascade_frontalface_default.xml'; // path to xml

    utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
        classifier.load(faceCascadeFile); 
    }); //load the xml file to the classifier

        

    function processVideo() {
        // this function detects the face in the frame and measures the distance
        cap.read(src); // read the video frame by frame from the source
        src.copyTo(dst);
        cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0); // convert the frame to gray

        try{
            classifier.detectMultiScale(gray, faces, 1.3, 4, 0); // detecting faces in the frame
        }catch(err){
            console.log(err);
        }

        /* we know 
            distance_of_object = (actual_width_of_object * focal_length) / apparent_width_of_object 
            focal length = between 0.7 * width_of_frame and 1 * width_of_frame 
         */
        let width_of_camera = video.width 
        let min_focal_length = width_of_camera * 0.7 
        let approx_focal_length = width_of_camera * 0.85
        let max_focal_length = width_of_camera * 0.95
        let original_size_of_face = null

        /*Currently option 1, 2 and 3 are disabled as data is not available */
        switch (option) {
            case "1":
                original_size_of_face = 3.94 // dummy face size for 05 to 10 years in inches
                break;

            case "2":
                original_size_of_face = 5.91 // dummy face size for 11 to 15 years in inches
                break;
            
            case "3":
                original_size_of_face = 7.08 // dummy face size for 16 to 20 years in inches
                break;
            
            case "4":
                original_size_of_face = 8.5  // average face size for 21 or more years in inches
                break;

            default:
                original_size_of_face = null
                break;
        }
        // Adding a rectangle bounding box around a detected face
        for (let i = 0; i < faces.size(); ++i) {
            let face = faces.get(i);
            let point1 = new cv.Point(face.x, face.y);
            let point2 = new cv.Point(face.x + face.width, face.y + face.height);
            cv.rectangle(dst, point1, point2, [0, 255, 0, 255]);

            /* 
                min_distance is with focal_length = 0.7 * width_of_frame
                approx_distance is with focal_length = 0.85 * width_of_frame
                max_distance is with focal_length = 0.95 * width_of_frame
            */
            let min_distance = (original_size_of_face * min_focal_length) / face.width 
            let approx_distance = (original_size_of_face * approx_focal_length) / face.width
            let max_distance = (original_size_of_face * max_focal_length) / face.width

            /* displaying range distance and approximate distance in inches */
            document.getElementById("distance").innerHTML = approx_distance.toFixed(2) + ' inch'
            document.getElementById("range").innerHTML = min_distance.toFixed(2) + ' inch and ' + max_distance.toFixed(2) + ' inch'
        }

        cv.imshow("canvas_output", dst); // displaying processed camera frame in a canvas

        
        setTimeout(processVideo); // schedule next time onwards for processing each frame
    }
    
    setTimeout(processVideo); // schedule first time for starting the process.

}