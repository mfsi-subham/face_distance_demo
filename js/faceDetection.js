function openCvReady(option) {
        
        let video = document.getElementById("cam_input"); // video is the id of video tag

        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();    
        })
        .catch(function(err) {
            console.log("An error occurred! " + err);
        });

        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let gray = new cv.Mat();
        let cap = new cv.VideoCapture(cam_input);            
        let faces = new cv.RectVector();
        let classifier = new cv.CascadeClassifier();
        let utils = new Utils('errorMessage');
        let faceCascadeFile = 'haarcascade_frontalface_default.xml'; // path to xml

        utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
            classifier.load(faceCascadeFile); // in the callback, load the cascade from file 
        });
        let x = 1
        function processVideo() {
            x = x + 1
            console.log(x)
            let select = document.getElementById("inlineFormCustomSelectPref")
            let value = select.options[select.selectedIndex].value
            console.log("current value = " + value)
            console.log("function called on " + option)
            
            cap.read(src);
            src.copyTo(dst);

            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);

            try{
                classifier.detectMultiScale(gray, faces, 1.3, 4, 0);
            }catch(err){
                console.log(err);
                //setTimeout(processVideo);
            }
            let width_of_camera = video.width
            let approx_focal_length = width_of_camera * 0.85
            let min_focal_length = width_of_camera * 0.7
            let max_focal_length = width_of_camera * 0.95
            let original_size_of_face = 21.59

            for (let i = 0; i < faces.size(); ++i) {
                let face = faces.get(i);
                let point1 = new cv.Point(face.x, face.y);
                let point2 = new cv.Point(face.x + face.width, face.y + face.height);
                cv.rectangle(dst, point1, point2, [0, 255, 0, 255]);
                let approx_distance = (original_size_of_face * approx_focal_length) / face.width
                let min_distance = (original_size_of_face * min_focal_length) / face.width
                let max_distance = (original_size_of_face * max_focal_length) / face.width
                document.getElementById("distance").innerHTML = approx_distance.toFixed(2) + ' cm'
                document.getElementById("range").innerHTML = min_distance.toFixed(2) + ' cm and ' + max_distance.toFixed(2)
            }

            cv.imshow("canvas_output", dst);
            // schedule next one
            if (option === value){
                setTimeout(processVideo);
            }
            
        }
        // schedule first one.
        setTimeout(processVideo);

}