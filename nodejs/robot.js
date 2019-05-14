// Main vars
var rpio = require('rpio');
const Gpio = require('pigpio').Gpio;

// Other vars

// For ultrasonic sensor
// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const usMsPerCm = 1e6/34321;


class Robot {
    constructor() {
        this.intNoOfMotor = 4;
        this.intNoOfSensor = 4;
        this.aryMotor = [];
        this.arySensors = [];
        this.intDefaultMotorFrontPWM = 102;
        this.intDefaultMotorTurnPWM = 166;
        this.bolShowEyeValue = true;
        this.intCheckEyeInterval = 100;
    }

    funInit() {
        // For motors
        this.aryMotor.push({
            strLR: "R",
            intDir: 1, 
            intPin0: new Gpio(17, {mode: Gpio.OUTPUT}), 
            intPin1: new Gpio(27, {mode: Gpio.OUTPUT})
        });
        this.aryMotor.push({
            strLR: "R",
            intDir: -1, 
            intPin0: new Gpio(22, {mode: Gpio.OUTPUT}), 
            intPin1: new Gpio(23, {mode: Gpio.OUTPUT})
        });
        this.aryMotor.push({
            strLR: "L",
            intDir: -1, 
            intPin0: new Gpio(5, {mode: Gpio.OUTPUT}), 
            intPin1: new Gpio(6, {mode: Gpio.OUTPUT})
        });
        this.aryMotor.push({
            strLR: "L",
            intDir: -1, 
            intPin0: new Gpio(13, {mode: Gpio.OUTPUT}), 
            intPin1: new Gpio(19, {mode: Gpio.OUTPUT})
        });

        // this.aryMotor.push({strLR: "R", intDir: 1, intPin0: 11, intPin1: 13});  
        // this.aryMotor.push({strLR: "R", intDir: -1, intPin0: 15, intPin1: 16});
        // this.aryMotor.push({strLR: "L", intDir: -1, intPin0: 29, intPin1: 31});
        // this.aryMotor.push({strLR: "L", intDir: -1, intPin0: 33, intPin1: 35});   

        // for (let i = 0; i < this.intNoOfMotor; i++) {
        //     rpio.open(this.aryMotor[i].intPin0, rpio.OUTPUT, rpio.LOW);
        //     rpio.open(this.aryMotor[i].intPin1, rpio.OUTPUT, rpio.LOW);
        // }


        
        // For sensors
        this.arySensors.push( {
            trigger: new Gpio(20, {mode: Gpio.OUTPUT}),
            echo: new Gpio(21, {mode: Gpio.INPUT, alert: true}),
            startTick: 0,
            endTick: 0,
            diff: 0,
            distance: 0,
            bolValid: true,
        });

        this.arySensors.push( {
            trigger: new Gpio(16, {mode: Gpio.OUTPUT}),
            echo: new Gpio(26, {mode: Gpio.INPUT, alert: true}),
            startTick: 0,
            endTick: 0,
            diff: 0,
            distance: 0,
            bolValid: true,
        });

        this.arySensors.push( {
            trigger: new Gpio(2, {mode: Gpio.OUTPUT}),
            echo: new Gpio(3, {mode: Gpio.INPUT, alert: true}),
            startTick: 0,
            endTick: 0,
            diff: 0,
            distance: 0,
            bolValid: true,
        });

        this.arySensors.push( {
            trigger: new Gpio(14, {mode: Gpio.OUTPUT}),
            echo: new Gpio(15, {mode: Gpio.INPUT, alert: true}),
            startTick: 0,
            endTick: 0,
            diff: 0,
            distance: 0,
            bolValid: true,
        });



        for (let i = 0; i < this.intNoOfSensor; i++) {
            // Make sure trigger is low
            this.arySensors[i].trigger.digitalWrite(0);

            // set echo function for each sensor echo
            this.arySensors[i].echo.on('alert', (level, tick) => {
                if (level == 1) {
                    this.arySensors[i].startTick = tick;
                } else {
                    this.arySensors[i].endTick = tick;
                    this.arySensors[i].diff = (this.arySensors[i].endTick >> 0) - (this.arySensors[i].startTick >> 0);  // Unsigned 32 bit arithmetic
                    if (this.arySensors[i].diff / 2 / usMsPerCm > 300) {
                        this.arySensors[i].bolValid = false;
                        this.arySensors[i].distance = 300;
                    } else {
                        if (this.arySensors[i].bolValid == true) {
                            this.arySensors[i].distance = this.arySensors[i].diff / 2 / usMsPerCm;
                        }
                        this.arySensors[i].bolValid = true;
                    }
                    if (this.bolShowEyeValue) {
                        console.log('Eye [' + i.toString() +  '] distance: ' + this.arySensors[i].distance.toString() + ' cm');
                    }
                    //console.log('Check Eye bol: ' + this.arySensors[i].bolValid.toString());
                    //console.log('Check Eye Diff: ' + this.arySensors[i].diff.toString());
                }
            });
        }
    }

    funMoveMotor(intMotorNo, strAction, intDir, intValue, intPWMValue) {
        let intCalMotorDir = 0;
        switch (strAction) {
            case 'S':
                intCalMotorDir = intDir * this.aryMotor[intMotorNo].intDir;
                if (intCalMotorDir == 1) {
                    this.aryMotor[intMotorNo].intPin0.pwmWrite(0);
                    this.aryMotor[intMotorNo].intPin1.pwmWrite(intPWMValue);
                    //rpio.write(this.aryMotor[intMotorNo].intPin0, rpio.LOW);
                    //rpio.write(this.aryMotor[intMotorNo].intPin1, rpio.HIGH);
                } else if (intCalMotorDir == 0) {
                    this.aryMotor[intMotorNo].intPin0.pwmWrite(0);
                    this.aryMotor[intMotorNo].intPin1.pwmWrite(0);
                    //rpio.write(this.aryMotor[intMotorNo].intPin0, rpio.LOW);
                    //rpio.write(this.aryMotor[intMotorNo].intPin1, rpio.LOW);
                } else {
                    this.aryMotor[intMotorNo].intPin0.pwmWrite(intPWMValue);
                    this.aryMotor[intMotorNo].intPin1.pwmWrite(0);
                    //rpio.write(this.aryMotor[intMotorNo].intPin0, rpio.HIGH);
                    //rpio.write(this.aryMotor[intMotorNo].intPin1, rpio.LOW);
                }
                // I dont know why, after setTimeout, this.aryMotor becomes undefined
                // However, let a array can solve this problem...
                let aryStopMotor = this.aryMotor;
                setTimeout(function() {
                    this.aryMotor[intMotorNo].intPin0.pwmWrite(0);
                    this.aryMotor[intMotorNo].intPin1.pwmWrite(0);
                    //rpio.write(aryStopMotor[intMotorNo].intPin0, rpio.LOW);
                    //rpio.write(aryStopMotor[intMotorNo].intPin1, rpio.LOW);
                }, intValue * 1000);
                break;
            case 'F':
                intCalMotorDir = intDir * this.aryMotor[intMotorNo].intDir;
                if (intCalMotorDir == 1) {
                    this.aryMotor[intMotorNo].intPin0.pwmWrite(0);
                    this.aryMotor[intMotorNo].intPin1.pwmWrite(intPWMValue);
                    //rpio.write(this.aryMotor[intMotorNo].intPin0, rpio.LOW);
                    //rpio.write(this.aryMotor[intMotorNo].intPin1, rpio.HIGH);
                } else if (intCalMotorDir == 0) {
                    this.aryMotor[intMotorNo].intPin0.pwmWrite(0);
                    this.aryMotor[intMotorNo].intPin1.pwmWrite(0);
                    //rpio.write(this.aryMotor[intMotorNo].intPin0, rpio.LOW);
                    //rpio.write(this.aryMotor[intMotorNo].intPin1, rpio.LOW);
                } else {
                    this.aryMotor[intMotorNo].intPin0.pwmWrite(intPWMValue);
                    this.aryMotor[intMotorNo].intPin1.pwmWrite(0);
                    //rpio.write(this.aryMotor[intMotorNo].intPin0, rpio.HIGH);
                    //rpio.write(this.aryMotor[intMotorNo].intPin1, rpio.LOW);
                }
                break;
            default:
                break;
        }
    }

    funMoveRobot(strAction, intLeft, intRight, intValue) {
        let intPWMValue = 0;
        if (intLeft == intRight) {
            intPWMValue = this.intDefaultMotorFrontPWM;
        } else {
            intPWMValue = this.intDefaultMotorTurnPWM;
        }
        for (let i = 0; i < this.intNoOfMotor; i++) {
            if (this.aryMotor[i].strLR == "L") {
                this.funMoveMotor(i, strAction, intLeft, intValue, intPWMValue);
            } else {
                this.funMoveMotor(i, strAction, intRight, intValue, intPWMValue);
            }
        }
    }

    funStopMotor(intMotorNo) {
        this.aryMotor[intMotorNo].intPin0.pwmWrite(0);
        this.aryMotor[intMotorNo].intPin1.pwmWrite(0);
        //rpio.write(this.aryMotor[intMotorNo].intPin0, rpio.LOW);
        //rpio.write(this.aryMotor[intMotorNo].intPin1, rpio.LOW);
    }
    
    funStopRobot() {
        for (let i = 0; i < this.intNoOfMotor; i++) {
            this.aryMotor[i].intPin0.pwmWrite(0);
            this.aryMotor[i].intPin1.pwmWrite(0);
            //rpio.write(this.aryMotor[i].intPin0, rpio.LOW);
            //rpio.write(this.aryMotor[i].intPin1, rpio.LOW);
        }
    }

    funStartIntervalCheckEye(bolShowEye) {
        this.bolShowEyeValue = bolShowEye;
        setInterval(() => {
            for (let i = 0; i < this.intNoOfSensor; i++) {
                // Set trigger high for 10 microseconds
                this.arySensors[i].trigger.trigger(10, 1);
            }
        }, this.intCheckEyeInterval);
    }
}

module.exports = Robot

