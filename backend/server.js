const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve the static frontend files
app.use(express.static(path.join(__dirname, '..')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const baudRate = 115200;
const connections = {};

// Discover and connect to all available serial ports automatically
SerialPort.list().then(ports => {
  ports.forEach((portInfo) => {
    const portPath = portInfo.path;
    console.log(`Attempting to connect to auto-discovered port: ${portPath}...`);
    
    try {
      const port = new SerialPort({ path: portPath, baudRate: baudRate });
      const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
      
      port.on('open', () => {
        console.log(`Connected successfully to ${portPath}`);
        connections[portPath] = port;
      });

      parser.on('data', (data) => {
        const message = data.trim();
        if (message) {
          console.log(`Received from ${portPath}:`, message);
          io.emit('node_data', { node: portPath, message });
        }
      });

      port.on('error', (err) => {
        console.error(`Error on ${portPath}:`, err.message);
      });

    } catch (err) {
      console.error(`Failed to initialize port ${portPath}:`, err.message);
    }
  });
}).catch(err => {
  console.error("Failed to list serial ports:", err.message);
});

io.on('connection', (socket) => {
  console.log('A web client connected:', socket.id);

  socket.on('trigger_attack', (data) => {
    const { attackId, attackName } = data;
    console.log(`Commanding ALL connected ESPs to launch: ${attackName} (ID: ${attackId})`);
    
    // Broadcast to web clients for visual update
    io.emit('attack_event', data);

    const activePorts = Object.keys(connections);
    
    // Send the ID to all connected hardware
    if (activePorts.length > 0) {
      let command = `${attackId}`;
      if (data.payload) {
        command += `:${data.payload}`;
      }
      command += `\n`;
      
      activePorts.forEach(portPath => {
        connections[portPath].write(command, (err) => {
          if (err) {
            console.error(`Error writing to ${portPath}:`, err.message);
          } else {
            console.log(`Sent command '${command.trim()}' to ${portPath}`);
          }
        });
      });
    } else {
      console.log(`No USB COM ports connected (Battery Mode). Sending simulated broadcast.`);
      // Simulate the attacker's response so the simulation continues gracefully
      setTimeout(() => {
        io.emit('node_data', { 
          node: "BATTERY_NODE", 
          message: `[SIMULATED - BATTERY MODE] Starting attack ${attackName}` 
        });
      }, 500);
    }
  });

  socket.on('stop_attack', (data) => {
    console.log(`Commanding ALL connected ESPs to STOP attacks`);
    const activePorts = Object.keys(connections);
    
    if (activePorts.length > 0) {
      activePorts.forEach(portPath => {
        connections[portPath].write(`0\n`, (err) => {
          if (err) console.error(`Error stopping ${portPath}:`, err.message);
          else console.log(`Sent stop command (0) to ${portPath}`);
        });
      });
    } else {
      console.log(`No USB COM ports connected (Battery Mode). Simulating stop command.`);
      setTimeout(() => {
        io.emit('node_data', { 
          node: "BATTERY_NODE", 
          message: `[SIMULATED - BATTERY MODE] Attack stopped.` 
        });
      }, 500);
    }
  });

  socket.on('disconnect', () => {
    console.log('Web client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
