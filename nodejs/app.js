﻿// vars
var gbolDebug = true;
var aryClients = [];
var fs = require('fs');
var intHBTimeout = 20000;
var bolAllowDuplicateLogin = true;

var base64 = require('base-64');
var utf8 = require('utf8');

// RB Code
var rbCode = "bj0000";

// Robot
var Robot = require('./robot');
var rb = new Robot();
rb.funInit();

// Printer
var PDFDocument = require("pdfkit");
var printer = require('printer');


// Other vars

// Vars for move RB
var bolRBAutoMove = false;

// Vars for print stt
var timStartWaitCanPrint = Date.now();
var intWaitPrintTime = 3000;
var aryPrintSTT = [];
var intSendPrintTime = 10000;

// Vars for auto print
var timLastPrint = Date.now();
var intMustPrintOnceTime = 540000;





Date.prototype.Format = function (fmt) { //author: meizz
    let o = {
        "M+": this.getMonth() + 1, // Month
        "d+": this.getDate(), // Day
        "h+": this.getHours(), // Hour
        "m+": this.getMinutes(), // Minute
        "s+": this.getSeconds(), // Seconds
        "q+": Math.floor((this.getMonth() + 3) / 3), // Quarter
        "S": this.getMilliseconds() // Milliseconds
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


// Console Related
function funUpdateConsole(msg, bolDebugOnly) {
    let bolShouldShow = false;
    try {
        if (bolDebugOnly) {
            if (gbolDebug) {
                bolShouldShow = true;
            }
        } else {
            bolShouldShow = true;
        }
        if (bolShouldShow) {
            let strTempDate = new Date().Format("yyyy-MM-dd hh:mm:ss");
            console.log(strTempDate + " : " + msg);
        }
    } catch (err) {
        console.log(err.message);
    }
}






// Socket.IO Server for Server Monitor to connect
var appServer = require('express')();
var httpServer = require('http').Server(appServer);
var ioServer = require('socket.io')(httpServer);

appServer.get('/', function (req, res) {
    res.sendFile(__dirname + '/server.html');
});

ioServer.on('connection', function (socket) {
    funUpdateConsole('bjproj WebServer Monitor Initialized', false);
    socket.on('disconnect', function () {
        funUpdateConsole('bjproj WebServer Monitor Disconnected', false);
    });
});

httpServer.listen(10542, function () {
    funUpdateConsole('bjproj WebServer Monitor listening on *:10542', false);
});

function funUpdateServerMonitor(strMsg, bolDebugOnly) {
    let bolShouldShow = false;
    try {
        if (bolDebugOnly) {
            if (gbolDebug) {
                bolShouldShow = true;
            }
        } else {
            bolShouldShow = true;
        }
        if (bolShouldShow) {
            let strTempDate = new Date().Format("yyyy-MM-dd hh:mm:ss");
            ioServer.emit('chat message', strTempDate + " : " + strMsg);
        }
    } catch (err) {
        //
    }
}




// Socket.IO Server for Client to connect
var ioClient = require('socket.io');
var httpClient = require('http');

var serverClient = httpClient.createServer(function (req, res) {
    let headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    //    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    res.writeHead(200, headers);
    res.end();
});
serverClient.listen(10541, '');

// var serverRBClient = httpClient.createServer(function (req, res) {
//     let headers = {};
//     headers["Access-Control-Allow-Origin"] = "*";
//     headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
//     //    headers["Access-Control-Allow-Credentials"] = true;
//     headers["Access-Control-Max-Age"] = '86400'; // 24 hours
//     headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
//     res.writeHead(200, headers);
//     res.end();
// });
// serverRBClient.listen(10543, '');


funUpdateConsole('BJ Project Server running at port 10541', false);

//funUpdateConsole('RB Socket.IO Server running at port 10543', false);






// Core Programs



// Show Clients' List every 10 seconds
function funShowClients() {
    for (let i = 0; i < aryClients.length; i++) {
        try {
            funUpdateServerMonitor("Connection Code: " + aryClients[i].connectionCode + "&nbsp;&nbsp;&nbsp;User ID: " + aryClients[i].userId, true);
        } catch (err) {
            //
        }
    }
    // let dtTemp = Date.now();
    setTimeout(funShowClients, 10000);
}
funShowClients();



// Listen to socket
var socketAll = new ioClient();
socketAll.attach(serverClient);

// var socketAll = ioClient.listen(serverClient);
socketAll.on('connection', function (socket) {
    funUpdateServerMonitor("Client Connected, Socket ID: " + socket.id, false);
    // socket.emit("UpdateYourSocketID", socket.id);

    // Add Connection to Array with Empty User ID
    aryClients.push({ connectionCode: socket.id, userId: '', lastHB: Date.now(), socket: socket});


    socket.on('removeClientUserId', function (userid) {
        for (let i = 0; i < aryClients.length; i++) {
            if (aryClients[i].connectionCode === socket.id) {
                aryClients[i].userId = "";
                funUpdateConsole("Remove User ID: " + userid + " from Socket ID: " + socket.id, true);
            }
        }
        // socketAll.emit("ServerUpdateUserList", aryClients);
    });


    socket.on('disconnect', function () {
        funUpdateServerMonitor("Client Disconnected, Socket ID: " + socket.id, false);
        for (let i = 0; i < aryClients.length; i++) {
            if (aryClients[i].connectionCode === socket.id) {
                aryClients.splice(i, 1);
            }
        }
        // socketAll.emit("ServerUpdateUserList", aryClients);
    });


    socket.on('HB', function (strUserID) {
        funUpdateServerMonitor("Heart Beat from Socket ID: " + socket.id, true);
        for (let i = 0; i < aryClients.length; i++) {
            if (aryClients[i].connectionCode === socket.id) {
                aryClients[i].lastHB = Date.now();
                aryClients[i].userId = strUserID;
            }
        }

        // HB Return
        socketAll.emit('HBReturn');
    });

    socket.on('RBPrintSTT', function (RBcode, aryListText) {
        funRBPrintSTT(RBcode, aryListText);
    });

    socket.on('RBMoveRobot', function (RBcode, aryRBMoveRobot) {
        funRBMoveRobot(RBcode,aryRBMoveRobot);
    });

    socket.on('CtlChangeSettings', function (RBCode, intMaxWords, intWaitTime, intAutoPrintTime, bolAutoMove) {
        funCtlChangeSettings(RBCode, socket.id, intMaxWords, intWaitTime, intAutoPrintTime, bolAutoMove);
    });



    // Catch any unexpected error, to avoid system hangs
    socket.on('error', function () { });
});



// Disconnect clients without HB
function funCheckHB() {
    try {

        // Check for auto print
        if (Date.now() - timLastPrint > intMustPrintOnceTime) {
            console.log('auto print to keep printer on');
            funPrint(['你好']);
        }

        // Disconnect client if client has no HB for a long time
        for (let i = 0; i < aryClients.length; i++) {
            if (Date.now() > aryClients[i].lastHB + intHBTimeout) {
                funUpdateServerMonitor("No HB Disconnect: " + aryClients[i].connectionCode, true);
                aryClients[i].socket.disconnect();
            }
        }
    } catch (err) {
        // If someone disconnect, there will be an error because aryClients.length changes
        // funUpdateServerMonitor("No HB Disconnect Error: " + err, true);
    }

    // let dtTemp = Date.now();
    setTimeout(funCheckHB, intHBTimeout);
}
funCheckHB();









function funRBPrintSTT(RBcode, aryListText) {
    funUpdateServerMonitor("Got RB Need Print STT to rb code: " + RBcode, true);
    console.log('Got print stt from server');

    // We need to have a time (short) to decide whether can print or not
    // As the socket will send the same thing three times to RB
    // Check if can print
    if (Date.now() - timStartWaitCanPrint > intWaitPrintTime) {
        // can print
        // reset timer
        timStartWaitCanPrint = Date.now();

        aryPrintSTT = aryListText;

        // print
        for (let i = 0; i < aryPrintSTT.length; i++) {
            console.log('item ' + i.toString() + ' : ' + aryPrintSTT[i]);
        }

        funPrint(aryPrintSTT);
    } else {
        // cannot print
    }
}





function funRBMoveRobot(RBcode,aryRBMoveRobot) {
    funUpdateServerMonitor("RBMoveRobot, rbCode: " + RBcode, false);
    
    // check move mode is manual
    if (bolRBAutoMove == false) {
        // can move
        console.log('moveRobot: ' + aryRBMoveRobot[1].toString() + ' , ' + aryRBMoveRobot[2].toString());
        rb.funMoveRobot(aryRBMoveRobot[0], aryRBMoveRobot[1], aryRBMoveRobot[2], aryRBMoveRobot[3]);
    } else {
        // cannot move
    }
}



function funCtlChangeSettings(RBcode, socID, intMaxWords, intWaitTime, intAutoPrintTime, bolAutoMove) {
    funUpdateServerMonitor("maxWords: " + intMaxWords.toString(), false);
    funUpdateServerMonitor("waitTime: " + intWaitTime.toString(), false);
    funUpdateServerMonitor("autoPrintTime: " + intAutoPrintTime.toString(), false);
    funUpdateServerMonitor("bolAutoMove: " + bolAutoMove.toString(), false);

    // For phone in robot
    for (let i = 0; i < aryClients.length; i++) {
        if (aryClients[i].userId == RBcode && aryClients[i].connectionCode != socID) {
            funUpdateServerMonitor("Sending intMaxWords & intWaitTime to phone in robot: " + aryClients[i].connectionCode, false);
            socketAll.to(`${aryClients[i].connectionCode}`).emit('sttSettings', [intMaxWords, intWaitTime]);
            break;
        }
    }

    // For RB
    console.log('Got change settings from server');
    console.log('intMustPrintOnceTime: ' + intAutoPrintTime.toString());
    intMustPrintOnceTime = intAutoPrintTime;
    bolRBAutoMove = bolAutoMove;
    funUpdateServerMonitor("RB changed printOnceTime And bolAutoMove", false);

    if (bolRBAutoMove == true) {
        // start auto move

        // first stop all motors
        rb.funStopRobot();
    }
}


function funPrint(aryPrint) {
    try {
        timLastPrint = Date.now();

        let doc = new PDFDocument;

        console.log('doc start.');

        doc.pipe(fs.createWriteStream('output.pdf'));
        doc.font('/usr/local/share/fonts/Deng.ttf');
        doc.fontSize(15);

        console.log('set font success');

        let y = 20;
        let x = 50;
        for (let i = 0; i < aryPrint.length; i++) {
            console.log('TextingItem: ' + i.toString());
            doc.text(aryPrint[i], x, y);
            y += 20;
        }

        doc.end();
        console.log('doc end.');

        setTimeout(sendPrint, intSendPrintTime);
    } catch (Err) {
        console.log('funPrint Error: ' + Err.message);
    }
}


function sendPrint() {
    console.log('send print start.');
    printer.printDirect({
        data: fs.readFileSync('./output.pdf'),
        printer: 'hp100_raspbian',
        type: 'PDF',
        success: function (jobID) {
            console.log("Print ID: " + jobID);
        },
        error: function(err){
            console.log('print module err: ' + err);
        }
    });
}







// No need server for RB
// As there will be no RB clients

// // For raspberry clients
// var aryRBClients = [];

// var socketRB = new ioClient();
// socketRB.attach(serverRBClient);

// socketRB.on('connection', function (socket) {
//     funUpdateServerMonitor("RB Client Connected, Socket ID: " + socket.id, false);
//     // socket.emit("UpdateYourSocketID", socket.id);

//     // Add Connection to Array with Empty User ID
//     aryRBClients.push({ connectionCode: socket.id, rbCode: '', socket: socket});

//     socketRB.emit('serverNeedRBCode');

//     funUpdateServerMonitor("Server required rbCode, Socket ID: " + socket.id, false);

//     socket.on('updateRBCode', function (RBcode) {
//         funUpdateServerMonitor("update rb code: " + RBcode, false);
//         for (let i = 0; i < aryRBClients.length; i++) {
//             if (aryRBClients[i].connectionCode === socket.id) {
//                 aryRBClients[i].rbCode = RBcode;
//                 //funUpdateServerMonitor("updated rb code: " + aryRBClients[i].rbCode, false);
//                 // Test
//                 //funRBMoveRobot(RBcode, ['S', 1, 1, 1]);
//                 break;
//             }
//         }
//     });

//     socket.on('disconnect', function () {
//         funUpdateServerMonitor("Client Disconnected, Socket ID: " + socket.id, false);
//         for (let i = 0; i < aryRBClients.length; i++) {
//             if (aryRBClients[i].connectionCode === socket.id) {
//                 aryRBClients.splice(i, 1);
//             }
//         }
//         // socketAll.emit("ServerUpdateUserList", aryClients);
//     });

//     // Catch any unexpected error, to avoid system hangs
//     socket.on('error', function () { });
// });


















// Support Functions


function funGenRandomNumber(intLength) {
    let strTemp = "";
    let codeChars = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9, 0);
    for (let i = 0; i < intLength; i++) {
        let charNum = Math.floor(Math.random() * 10);
        strTemp += codeChars[charNum];
    }
    return strTemp;
}
function funGenRandomString(intLength) {
    let strTemp = "";
    let codeChars = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9,
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'); //所有候选组成验证码的字符，当然也可以用中文的
    for (let i = 0; i < intLength; i++) {
        let charNum = Math.floor(Math.random() * 51);
        strTemp += codeChars[charNum];
    }
    return strTemp;
}



// Encode String to UTF-8
function utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < string.length; n++) {
        let c = string.charCodeAt(n);
        if (c < 128) {
            utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }
    return utftext;
}







// Decode String From UTF-8
function utf8Decode(utftext) {
    let string = "";
    let i = 0;
    let c = c1 = c2 = 0;
    while (i < utftext.length) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return string;
}

function json_decode(str_json) {
    let json = JSON;
    if (typeof json === 'object' && typeof json.parse === 'function') {
        return json.parse(str_json);
    }

    let cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    let j;
    let text = str_json;

    // Parsing happens in four stages. In the first stage, we replace certain
    // Unicode characters with escape sequences. JavaScript handles many characters
    // incorrectly, either silently deleting them, or treating them as line endings.
    cx.lastIndex = 0;
    if (cx.test(text)) {
        text = text.replace(cx, function (a) {
            return '\\u' +
                ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
    }

    // In the second stage, we run the text against regular expressions that look
    // for non-JSON patterns. We are especially concerned with '()' and 'new'
    // because they can cause invocation, and '=' because it can cause mutation.
    // But just to be safe, we want to reject all unexpected forms.

    // We split the second stage into 4 regexp operations in order to work around
    // crippling inefficiencies in IE's and Safari's regexp engines. First we
    // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
    // replace all simple value tokens with ']' characters. Third, we delete all
    // open brackets that follow a colon or comma or that begin the text. Finally,
    // we look to see that the remaining characters are only whitespace or ']' or
    // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
    if (/^[\],:{}\s]*$/.
        test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.

        j = eval('(' + text + ')');

        return j;
    }

    // If the text is not JSON parseable, then a SyntaxError is thrown.
    throw new SyntaxError('json_decode');
}

function json_encode(mixed_val) {
    let json = JSON;
    if (typeof json === 'object' && typeof json.stringify === 'function') {
        return json.stringify(mixed_val);
    }

    let value = mixed_val;

    let quote = function (string) {
        let escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        let meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                let c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    };

    let str = function (key, holder) {
        let gap = '';
        let indent = '    ';
        let i = 0;          // The loop counter.
        let k = '';          // The member key.
        let v = '';          // The member value.
        let length = 0;
        let mind = gap;
        let partial = [];
        let value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.
        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // What happens next depends on the value's type.
        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':
                // JSON numbers must be finite. Encode non-finite numbers as null.
                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':
                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

            case 'object':
                // If the type is 'object', we might be dealing with an object or an array or
                // null.
                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.
                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.
                gap += indent;
                partial = [];

                // Is the value an array?
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.
                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                            mind + ']' :
                            '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // Iterate through all of the keys in the object.
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.
                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    };

    // Make a fake root object containing our value under the key of ''.
    // Return the result of stringifying the value.
    return str('', {
        '': value
    });
}