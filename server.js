const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public'));

// שמירת כל החיבורים הפעילים
const clients = new Set();

// טיפול בחיבורי WebSocket חדשים
wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);
    
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

// נקודת קצה לקבלת הוובהוק
app.post('/webhook', (req, res) => {
    console.log('Received webhook:', req.body);
    const callData = req.body;
    
    // שליחת ההתראה לכל הלקוחות המחוברים
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'incoming_call',
                data: callData
            }));
        }
    });
    
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});