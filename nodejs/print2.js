var printer = require('printer');
var Canvas = require('canvas')
var Image = Canvas.Image
var canvas = new Canvas(2100, 2970)
var ctx = canvas.getContext('2d');
var fs = require('fs');
var out = fs.createWriteStream('./output.png');
var stream = canvas.pngStream();
// var stream = canvas.jpegStream({
//    bufsize: 4096, // output buffer size in bytes, default: 4096
//    quality: 100 // JPEG quality (0-100) default: 75
//   , progressive: false // true for progressive compression, default: false
// });

ctx.font = '50px Deng';
ctx.beginPath();
ctx.rect(0, 0, 2100, 2970);
ctx.fillStyle = "white";
ctx.fill();
ctx.fillStyle = "black";
ctx.fillText("Line 1: To Zephan:", 50, 50);
ctx.fillText("Line 2: 我现在将 Text 改为 png", 50, 150);
ctx.fillText("Line 3: 然后用 printer.printFile 打印 ./output.png", 50, 250);
ctx.fillText("Line 4: 打印 png 档案从来没有失败过！", 50, 350);
ctx.fillText("Line 5: 请看 print2.js 你就明白了", 50, 450);
ctx.fillText("Line 6: From Ken", 50, 550);

// stream.pipe(out);

stream.on('data', function(chunk){
  out.write(chunk);
});

stream.on('end', function(){
  console.log('saved png');
  setTimeout(funStartPrint,2000);
});

function funStartPrint() {
    printer.printFile({
        filename: './output.png',
        printer: 'hp100_raspbian',
        success: function (jobID) {
            console.log("Print ID: " + jobID);
        },
        error: function(err){
            console.log('print module err: ' + err);
        }
      });    
}
