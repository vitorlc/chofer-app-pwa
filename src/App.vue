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
      device: null
    };
  },
  methods: {
    async listDevices() {
      // Validate services UUID entered by user first.
      let optionalServices = [0x1800, 0x1801, 0x1804, 0x180f, 0xfff0];

      try {
        console.log("Requesting any Bluetooth Device...");
        const device = await navigator.bluetooth.requestDevice({
          // filters: [...] <- Prefer filters to save energy & show relevant devices.
          acceptAllDevices: true,
          optionalServices: optionalServices
        });

        const server = await device.gatt.connect();

        // Note that we could also get all services that match a specific UUID by
        // passing it to getPrimaryServices().
        const services = await server.getPrimaryServices();

        for (const service of services) {
          console.log("\n=====> Service: " + service.uuid);
          const characteristics = await service.getCharacteristics();

          characteristics.forEach(characteristic => {
            console.log("\n=====> Characteristic: " + characteristic.uuid);
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
        console.log('Requesting Bluetooth Device...');
        const device  = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: optionalServices
        });

        console.log('Connecting to GATT Server...');
        const server = await device.gatt.connect();

        console.log('Getting Heart Rate Service...');
        const service = await server.getPrimaryService(0x180f);

        console.log('Getting Heart Rate Control Point Characteristic...');
        const characteristic = await service.getCharacteristic(0x2a19);

        console.log('Writing Heart Rate Control Point Characteristic...');
        // Writing 1 is the signal to reset energy expended.
        setInterval(async function(){ 
          const value = await characteristic.readValue();
          console.log("> Battery Level is " + value.getUint8(0) + "%");
          // let resetOBD = Uint8Array.of('ATZ\r');
          // await characteristic.writeValue(resetOBD);
        }, 5000);
        console.log('> Has been reset.');
      } catch(error) {
        console.log('Argh! ' + error);
      }

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
