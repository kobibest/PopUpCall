class NotificationClient {
    constructor() {
        this.connect();
        this.updateStatus('מתחבר...');
        
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }
    
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.ws = new WebSocket(`${protocol}//${window.location.host}`);
        
        this.ws.onopen = () => {
            this.updateStatus('מחובר');
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'incoming_call') {
                this.showNotification(message.data);
            }
        };
        
        this.ws.onclose = () => {
            this.updateStatus('מנותק - מנסה להתחבר מחדש...');
            setTimeout(() => this.connect(), 5000);
        };
    }
    
    updateStatus(status) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = `סטטוס: ${status}`;
        }
    }
    
    showNotification(callData) {
        if (Notification.permission === 'granted') {
            new Notification('שיחה נכנסת', {
                body: `מתקשר: ${callData.caller || 'לא ידוע'}`,
                icon: '/phone-icon.png'
            });
        }
    }
}

const client = new NotificationClient();