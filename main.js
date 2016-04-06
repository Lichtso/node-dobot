'use strict';

const commandLen = 42;
const SerialPort = require('serialport').SerialPort
const serialPort = new SerialPort('/dev/tty.usbmodem1411', {
    baudrate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
});

function sendCommand(params) {
    let command = new Buffer(commandLen);
    command.writeUInt8(0xA5, 0);
    for(let i = 0; i < params.length; ++i)
        command.writeFloatLE(params[i], 1+i*4);
    command.writeUInt8(0x5A, 1+params.length*4);
    serialPort.write(command, function(err, results) {
        if(results == commandLen)
            console.log('sent: '+command.toString('hex'));
        else
            console.log('error: '+err);
    });
}

let receiveBuffer;
serialPort.on('data', function(data) {
    if(receiveBuffer)
        receiveBuffer = Buffer.concat([receiveBuffer, data]);
    else
        receiveBuffer = data;
    if(receiveBuffer.length == commandLen) {
        if(receiveBuffer.readUInt8(0) == 0xA5 && receiveBuffer.readUInt8(41) == 0x5A) {
            let params = [];
            for(let i = 0; i < 10; ++i)
                params.push(receiveBuffer.readFloatLE(1+i*4));
            console.log('received: '+receiveBuffer.toString('hex')+' '+params);
        }
        receiveBuffer = undefined;
    }
});

serialPort.on('open', function() {
    var state = 9;
    setTimeout(function() {
        sendCommand([6, 0, 10, 20, 30, 40, 1, 1, 0, 0]);
    }, 10000);

    // serialPort.flush();
});

serialPort.on('disconect', function() {
    console.log('disconect');
});

serialPort.on('close', function() {
    console.log('close');
});
