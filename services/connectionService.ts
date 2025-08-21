import React from 'react';

export interface ConnectionStatus {
    isOnline: boolean;
    isStable: boolean;
    lastChecked: Date;
    retryCount: number;
}

class ConnectionService {
    private status: ConnectionStatus = {
        isOnline: navigator.onLine,
        isStable: true,
        lastChecked: new Date(),
        retryCount: 0
    };

    private listeners: ((status: ConnectionStatus) => void)[] = [];
    private checkInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        // Escuchar cambios de conexión
        window.addEventListener('online', () => this.updateStatus(true));
        window.addEventListener('offline', () => this.updateStatus(false));

        // Verificar conexión periódicamente
        this.startPeriodicCheck();

        // Verificar conexión inicial
        this.checkConnection();
    }

    private updateStatus(isOnline: boolean) {
        const wasOnline = this.status.isOnline;
        this.status.isOnline = isOnline;
        this.status.lastChecked = new Date();

        if (isOnline && !wasOnline) {
            this.status.retryCount = 0;
            this.status.isStable = true;
            console.log('🌐 Conexión restaurada');
        } else if (!isOnline && wasOnline) {
            console.log('📶 Conexión perdida');
        }

        this.notifyListeners();
    }

    private async checkConnection() {
        try {
            const startTime = Date.now();
            const response = await fetch('/manifest.json', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            const endTime = Date.now();

            const isStable = endTime - startTime < 2000; // Menos de 2 segundos

            this.status.isStable = isStable;
            this.status.lastChecked = new Date();

            if (!this.status.isOnline) {
                this.updateStatus(true);
            }
        } catch (error) {
            if (this.status.isOnline) {
                this.updateStatus(false);
            }
            this.status.retryCount++;
        }
    }

    private startPeriodicCheck() {
        this.checkInterval = setInterval(() => {
            this.checkConnection();
        }, 30000); // Verificar cada 30 segundos
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.status));
    }

    public getStatus(): ConnectionStatus {
        return { ...this.status };
    }

    public addListener(callback: (status: ConnectionStatus) => void) {
        this.listeners.push(callback);
        // Notificar estado actual inmediatamente
        callback(this.status);
    }

    public removeListener(callback: (status: ConnectionStatus) => void) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    public async testConnection(): Promise<boolean> {
        try {
            await this.checkConnection();
            return this.status.isOnline;
        } catch {
            return false;
        }
    }

    public destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        this.listeners = [];
    }
}

// Instancia singleton
export const connectionService = new ConnectionService();

// Hook para React
export const useConnectionStatus = () => {
    const [status, setStatus] = React.useState<ConnectionStatus>(connectionService.getStatus());

    React.useEffect(() => {
        const handleStatusChange = (newStatus: ConnectionStatus) => {
            setStatus(newStatus);
        };

        connectionService.addListener(handleStatusChange);

        return () => {
            connectionService.removeListener(handleStatusChange);
        };
    }, []);

    return status;
};
