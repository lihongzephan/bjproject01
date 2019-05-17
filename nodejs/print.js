var fs = require('fs');

// const escpos = require('escpos');

// // Select the adapter based on your printer type
// const device  = new escpos.USB();
// // const device  = new escpos.Network('localhost');
// // const device  = new escpos.Serial('/dev/usb/lp0');

// const options = { encoding: "GB18030" /* default */ }
// // encoding is optional

// const printer = new escpos.Printer(device, options);

// Printer
// var PDFDocument = require("pdfkit");
var printer = require('printer');
var tmpData = '';

function sendPrint2() {
    console.log('send print start.');
    tmpData = fs.readFileSync('./output.pdf');
    // setTimeout(sendPrint2, 2000);
    sendPrint2();
}

//sendPrint();
function sendPrint() {
    // let tmpData2 = tmpData;
    console.log(printer.getSupportedPrintFormats());
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

var path = './test.txt';
var bolShouldCheck = true;

function funLoop() {
    try {
        if(bolShouldCheck) {
            // Check file exist
            if (fs.existsSync(path)) {
                bolShouldCheck = false;

                // Can print
                sendPrint();

                // Delete file
                fs.unlinkSync(path);

                setTimeout(function() {
                    bolShouldCheck = true;
                }, 5000);
            }
            setTimeout(funLoop, 5000);
        }
    } catch (err) {
        // Nothing to do
    }
}

//funLoop();
// setInterval(funLoop, 5000);
// sendPrint();

console.log(printer.getSupportedPrintFormats());
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

// device.open(function(){
//   printer
//   .font('a')
//   .align('ct')
//   .style('bu')
//   .size(1, 1)
//   .text('The quick brown fox jumps over the lazy dog')
//   .text('敏捷的棕色狐狸跳过懒狗')
//   .barcode('1234567', 'EAN8')
//   .qrimage('https://github.com/song940/node-escpos', function(err){
//     this.cut();
//     this.close();
//   });
// });