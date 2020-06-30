function Utils(errorOutputId) {
    let self = this;
    this.errorOutput = document.getElementById(errorOutputId); // display if any error occured

    this.createFileFromUrl = function(path, url, callback) {
        // this function loads xml file 
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function(ev) {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    let data = new Uint8Array(request.response);
                    cv.FS_createDataFile('/', path, data, true, false, false);
                    callback();
                } else {
                    self.printError('Failed to load ' + url + ' status: ' + request.status);
                }
            }
        };
        request.send();
    };
};
