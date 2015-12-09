// -------------------------------------------------
// ------------------ Utils ------------------------
// -------------------------------------------------

function GetMilliseconds() {
    return (new Date()).getTime();
}

// big endian to little endian and vice versa
function Swap32(val) {
    return ((val & 0xFF) << 24) | ((val & 0xFF00) << 8) | ((val >>> 8) & 0xFF00) | ((val >>> 24) & 0xFF);
}

function Swap16(val) {
    return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
}

// cast an integer to a signed integer
function int32(val) {
    return (val >> 0);
}

// cast an integer to a unsigned integer
function uint32(val) {
    return (val >>> 0);
}

function ToHex(x) {
    var val = uint32(x);
    return ("0x" + ("00000000" + val.toString(16)).substr(-8).toUpperCase());
}

function ToBin(x) {
    var val = uint32(x);
    var s = ("00000000000000000000000000000000" + val.toString(2)).substr(-32) + "b";
    return s.replace(/./g, function (v, i) {return ((i&3)==3)?v + " ": v;});
}

function CopyBinary(to, from, size, buffersrc, bufferdest) {
    var i = 0;
    for (i = 0; i < size; i++) {
        bufferdest[to + i] = buffersrc[from + i];
    }
}

function fillFromJSONObjArr(to, from) {
	for (var i = 0; i < from.len; i++) {
		to[i] = from[i];
	}
	/*
	if (from.len < 10000) {
		console.log("jsonobj to arr --");
		console.log("from : " + JSON.stringify(from));
		console.log("to : " + JSON.stringify(to));
	}
	*/
}

function LoadBinaryResource(url, OnSuccess, OnError) {
    var req = new XMLHttpRequest();
    // open might fail, when we try to open an unsecure address, when the main page is secure
    try {
        req.open('GET', url, true);
    } catch(err) {
        OnError(err);
        return;
    }
    req.responseType = "arraybuffer";
    req.onreadystatechange = function () {
        if (req.readyState != 4) {
            return;
        }
        if ((req.status != 200) && (req.status != 0)) {
            OnError("Error: Could not load file " + url);
            return;
        }
        var arrayBuffer = req.response;
        if (arrayBuffer) {
            OnSuccess(arrayBuffer);
        } else {
            OnError("Error: No data received from: " + url);
        }
    };
    req.send(null);
}

function LoadBinaryResourceII(url, OnSuccess, NonBlocking, OnError) {
    var req = new XMLHttpRequest();
    // open might fail, when we try to open an unsecure address, when the main page is secure
    try {
        req.open('GET', url, NonBlocking);
    } catch(err) {
        OnError(err);
        return;
    }
    req.responseType = "arraybuffer";
    req.onreadystatechange = function () {
        if (req.readyState != 4) {
            return;
        }
        if ((req.status != 200) && (req.status != 0)) {
            OnError("Error: Could not load file " + url);
            return;
        }
        var arrayBuffer = req.response;
        if (arrayBuffer) {
            OnSuccess(arrayBuffer);
        } else {
            OnError("Error: No data received from: " + url);
        }
    };
    req.send(null);
}

function LoadTextResource(url, OnSuccess, OnError) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    //req.overrideMimeType('text/xml');
    req.onreadystatechange = function () {
        if (req.readyState != 4) {
            return;
        }
        if ((req.status != 200) && (req.status != 0)) {
            OnError("Error: Could not load text file " + url);
            return;
        }
        OnSuccess(req.responseText);
    };
    req.send(null);
}

function DownloadAllAsync(urls, OnSuccess, OnError) {
    var pending = urls.length;
    var result = [];
    if (pending === 0) {
        setTimeout(onsuccess.bind(null, result), 0);
        return;
    }
    urls.forEach(function(url, i)  {
        LoadBinaryResource(
            url, 
            function(buffer) {
                if (result) {
                    result[i] = buffer;
                    pending--;
                    if (pending === 0) {
                        OnSuccess(result);
                    }
                }
            }, 
            function(error) {
                if (result) {
                    result = null;
                    OnError(error);
                }
            }
        );
    });
}

// temp version that works
function UploadBinaryResource(url, filename, data, OnSuccess, OnError) {
    var xhr = new XMLHttpRequest();
	
	xhr.open("POST", url, true);
	xhr.setRequestHeader('content-type', 'application/octet-stream');
	xhr.send(data);
}

function UploadTextResource(url, filename, data, OnSuccess, OnError) {
	var xhr = new XMLHttpRequest();

	xhr.open("POST", url, true);
	xhr.setRequestHeader('content-type', 'text/plain');
	xhr.send(data);
}

/*
function UploadBinaryResource(url, filename, data, OnSuccess, OnError) {
	
	var string = new TextDecoder().decode(new Uint8Array(data));

    var boundary = "xxxxxxxxx";

    var xhr = new XMLHttpRequest();
    xhr.open('post', url, true);
    xhr.setRequestHeader("Content-Type", boundary=" + boundary);
    //xhr.setRequestHeader("Content-Length", 100);
	//console.log(100);
	xhr.onreadystatechange = function (req) {
        if (req.readyState != 4) {
            return;
        }
        if ((req.status != 200) && (xhr.status != 0)) {
            OnError("Error: Could not upload file " + filename);
            return;
        }
        OnSuccess(this.responseText);
    };

	
    var bodyheader = "--" + boundary + "\r\n";
    bodyheader += 'Content-Disposition: form-data; name="uploaded"; filename="' + filename + '"\r\n';
    bodyheader += "Content-Type: application/octet-stream\r\n\r\n";

    var bodyfooter = "\r\n";
    bodyfooter += "--" + boundary + "--";

    var newdata = new Uint8Array(string.length + bodyheader.length + bodyfooter.length);
    var offset = 0;
    for(var i=0; i<bodyheader.length; i++)
        newdata[offset++] = bodyheader.charCodeAt(i);

    for(var i=0; i<string.length; i++)
        newdata[offset++] = string[i];


    for(var i=0; i<bodyfooter.length; i++)
        newdata[offset++] = bodyfooter.charCodeAt(i);

    xhr.send(newdata.buffer);
	
	//xhr.send(data);
}
*/


/*
function LoadBZIP2Resource(url, OnSuccess, OnError)
{
    var worker = new Worker('bzip2.js');
    worker.onmessage = function(e) {
        OnSuccess(e.data);
    }    
    worker.onerror = function(e) {
        OnError("Error at " + e.filename + ":" + e.lineno + ": " + e.message);
    }
    worker.postMessage(url);    
}
*/


module.exports.GetMilliseconds = GetMilliseconds;
module.exports.Swap32 = Swap32;
module.exports.Swap16 = Swap16;
module.exports.int32 = int32;
module.exports.uint32 = uint32;
module.exports.ToHex = ToHex;
module.exports.ToBin = ToBin;
module.exports.UploadBinaryResource = UploadBinaryResource;
module.exports.fillFromJSONObjArr = fillFromJSONObjArr;
module.exports.UploadTextResource = UploadTextResource;
module.exports.LoadBinaryResource = LoadBinaryResource;
module.exports.LoadBinaryResourceII = LoadBinaryResourceII;
module.exports.LoadTextResource = LoadTextResource;

