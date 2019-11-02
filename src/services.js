 // try {
      //   if(vm.device ==null){
      //     console.console.log('entrou')
      //     vm.device = await window.navigator.bluetooth.requestDevice({
      //       acceptAllDevices: true,
      //     optionalService: [0xfff0]
      //   });
      //   console.log("DEVICE INFO: ", device);
      //   const server = await device.gatt.connect();
      //   }else {
      //     const server = device.gatt
      //   }
      //   console.log("server: ", server);
      //   const service = await server.getPrimaryService(0xfff0);
      //   console.log(vm.service);
      //   console.log('Getting Characteristic...');
      //   const characteristic = await vm.service.getCharacteristic(0xfff1);
      //   console.log('> Characteristic UUID:  ' + characteristic.uuid);
      //   console.log('> Broadcast:            ' + characteristic.properties.broadcast);
      //   console.log('> Read:                 ' + characteristic.properties.read);
      //   console.log('> Write w/o response:   ' + characteristic.properties.writeWithoutResponse);
      //   console.log('> Write:                ' + characteristic.properties.write);
      //   console.log('> Notify:               ' + characteristic.properties.notify);
      //   console.log('> Indicate:             ' + characteristic.properties.indicate);
      //   console.log('> Signed Write:         ' + characteristic.properties.authenticatedSignedWrites);
      //   console.log('> Queued Write:         ' + characteristic.properties.reliableWrite);
      //   console.log('> Writable Auxiliaries: ' + characteristic.properties.writableAuxiliaries);
      //   characteristic.readValue().then(result => {
      //     console.log(result);
      //     console.log(vm.parseHeartRate(result));
      //   });
      // } catch(error)  {
      //   console.log('Argh! ' + error.message);
      // }

      // console.log('Requesting Bluetooth Device...');
      // navigator.bluetooth.requestDevice({
      //   acceptAllDevices: true,
      //   optionalServices: [0x180F]
      // }).then(function(device) {
      //     // Step 2: Connect to it
      //     return device.gatt.connect();
      //   })
      //   .then(function(server) {
      //     // Step 3: Get the Service
      //     return server.getPrimaryService(0x180F);
      //   })
      //   .then(function(service) {
      //     console.log("TCL: connect -> service", service)
      //     // Step 4: get the Characteristic
      //     return service.getCharacteristic(0x2A19)
      //   })
      // .then(function(characteristic) {
      //   // Step 5: Write to the characteristic
      //   var data = new Uint8Array([0x0C, 0x0C, 0x0C, 0x0C]);
      //   return characteristic.writeValue(data);
      // })
      // .catch(function(error) {
      //   // And of course: error handling!
      //   console.error(error.message);
      // });

      parseHeartRate(data) {
        console.log("AQUIII");
        console.log(data);
        const flags = data.getUint8(0);
        const rate16Bits = flags & 0x1;
        const result = {};
        let index = 1;
        if (rate16Bits) {
          result.heartRate = data.getUint16(index, /*littleEndian=*/ true);
          index += 2;
        } else {
          result.heartRate = data.getUint8(index);
          index += 1;
        }
        const contactDetected = flags & 0x2;
        const contactSensorPresent = flags & 0x4;
        if (contactSensorPresent) {
          result.contactDetected = !!contactDetected;
        }
        const energyPresent = flags & 0x8;
        if (energyPresent) {
          result.energyExpended = data.getUint16(index, /*littleEndian=*/ true);
          index += 2;
        }
        const rrIntervalPresent = flags & 0x10;
        if (rrIntervalPresent) {
          const rrIntervals = [];
          for (; index + 1 < data.byteLength; index += 2) {
            rrIntervals.push(data.getUint16(index, /*littleEndian=*/ true));
          }
          result.rrIntervals = rrIntervals;
        }
        return result;
      }

      
    async getService() {
        console.log("server: ", vm.server);
        vm.service = await vm.server.getPrimaryService(0xfff0);
        console.log(service);
      },
      async getCharacteristic() {
        const characteristic = await vm.service.getCharacteristic(0xfff1);
        console.log("TCL: getCharacteristic -> characteristic", characteristic);
      },
  
      async onButtonClick() {
        try {
          console.log("Requesting Bluetooth Device...");
          const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ["battery_service"] }]
          });
  
          console.log("Connecting to GATT Server...");
          const server = await device.gatt.connect();
  
          console.log("Getting Battery Service...");
          const service = await server.getPrimaryService("battery_service");
  
          console.log("Getting Battery Level Characteristic...");
          const characteristic = await service.getCharacteristic("battery_level");
  
          console.log("Reading Battery Level...");
          const value = await characteristic.readValue();
  
          console.log("> Battery Level is " + value.getUint8(0) + "%");
        } catch (error) {
          console.log("Argh! " + error);
        }
      },