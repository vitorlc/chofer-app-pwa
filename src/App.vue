<template>
  <div id="app">
    <header>
      <span>Chofer App</span>
    </header>
    <main>
      <button @click="connect()">bluetooth Connect</button>

      <div>
        <button @click="listDevices()">List Devices</button>
      </div>
    </main>
  </div>
</template>

<script>


let vm;

export default {
  name: "app",
  components: {},
  created() {
    vm = this;
  },
  data() {
    return {
      server: null,
      service: null,
      device: null,
      receivedData : ""
    };
  },
  methods: {
    async listDevices() {
      // Validate services UUID entered by user first.
      let optionalServices = [0x1800, 0x1801, 0x1804, 0x180f, 0xfff0];

      try {
        console.log("Requesting any Bluetooth Device...");
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: optionalServices
        });

        const server = await device.gatt.connect();
        const services = await server.getPrimaryServices();

        for (const service of services) {
          console.log("\n\n======> Service: " + service.uuid);
          const characteristics = await service.getCharacteristics();

          characteristics.forEach(characteristic => {
            console.table("===> Characteristic: " + characteristic.uuid);
            // const value = await characteristic.readValue();
            // console.log("> Battery Level is " + value.getUint8(0) + "%");
            console.log(getSupportedProperties(characteristic));
          });
        }
      } catch (error) {
        console.log("Argh! " + error.message);
      }

      /* Utils */

      function getSupportedProperties(characteristic) {
        let supportedProperties = [];
        for (const p in characteristic.properties) {
          if (characteristic.properties[p] === true) {
            supportedProperties.push(p.toUpperCase());
          }
        }
        return "[" + supportedProperties.join(", ") + "]";
      }
    },
    async connect(){
      let optionalServices = [0x1800, 0x1801, 0x1804, 0x180f, 0xfff0];
       try {
        console.log('Solicitando dispositivos Bluetooth...');
        const device  = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: optionalServices
        });

        console.log('Conectado ao GATT Server...');
        const server = await device.gatt.connect();

        console.log('Conectando ao serviço...');
        const service = await server.getPrimaryService(0xfff0);

        const characteristic = await service.getCharacteristic(0xfff2);

        vm.writeValue(characteristic, 'reset')
        vm.writeValue(characteristic)

        const characteristic2 = await service.getCharacteristic(0xfff1);

        // vm.readValuePing(characteristic2)

        //await characteristic2.startNotifications();
        //characteristic2.addEventListener('characteristicvaluechanged', vm.handleNotifications);

      } catch(error) {
        console.log('Argh! ' + error);
      }

    },
    handleNotifications(event) {
      let value = event.target.value;
      console.log(value)
      let a = [];
      // Convert raw data bytes to hex values just for the sake of showing something.
      // In the "real" world, you'd use data.getUint8, data.getUint16 or even
      // TextDecoder to process raw data bytes.
      for (let i = 0; i < value.byteLength; i++) {
        a.push(value.getUint8(i).toString('16').slice(-2));
      }
      console.log('Notification >> ' + a.join(' '));
    },
    disconect() {
      if (!vm.device) {
        return;
      }
      console.log("Disconnecting from Bluetooth Device...");
      if (vm.device.gatt.connected) {
        bluetoothDevice.gatt.disconnect();
      } else {
        console.log("> Bluetooth Device is already disconnected");
      }
    },
    writeValue(characteristic, type){
      let data
      let encoder = new TextEncoder('utf-8');
      if (type =='reset'){ // Strings needs to encode
        // console.log("Encoded Message: " + encoder.encode([ 'ATZ\r', 'ATL0\r', 'ATS0\r', 'ATH0\r', 'ATE0\r', 'ATAT2\r', 'ATSP0\r']));
        let teste1 = new Uint8Array([ 'ATZ\r', 'ATL0\r', 'ATS0\r', 'ATH0\r', 'ATE0\r', 'ATAT2\r', 'ATSP0\r'])
        console.log("OLHA AQUI", teste1.length)
        characteristic.writeValue(teste1);
        // data = Buffer.from([ 'ATZ\r', 'ATL0\r', 'ATS0\r', 'ATH0\r', 'ATE0\r', 'ATAT2\r', 'ATSP0\r'], "utf-8"); // Reset OBD
      }
      else{ // Uint8Array.from or new Uint8Array
        setInterval(async function(){ 
          await characteristic.writeValue(new Uint8Array(['0x010C\r'])); //Write Params
        }, 1000);
      }
    },
    readValuePing(characteristic){
      setInterval(async function(){ 
        let value = await characteristic.readValue();
        console.log(value.toString('utf8'))
      }, 5000);
    },
  }
};
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

main {
  text-align: center;
  margin-top: 40px;
}

header {
  margin: 0;
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #35495e;
  color: #ffffff;
}

header span {
  display: block;
  position: relative;
  font-size: 20px;
  line-height: 1;
  letter-spacing: 0.02em;
  font-weight: 400;
  box-sizing: border-box;
  padding-top: 16px;
}
</style>
