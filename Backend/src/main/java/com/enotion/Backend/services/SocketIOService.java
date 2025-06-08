package com.enotion.Backend.services;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

@Component
public class SocketIOService {

    private final SocketIOServer server;

    public SocketIOService(SocketIOServer server) {
        this.server = server;
    }

    @PostConstruct
    public void startSocketServer() {
        server.addConnectListener(onConnected());
        server.addDisconnectListener(onDisconnected());
        server.start();
    }

    private ConnectListener onConnected() {
        return (client) -> {
            System.out.println("Socket ID " + client.getSessionId().toString() + " connected to socket");
        };
    }

    private DisconnectListener onDisconnected() {
        return client -> {
            System.out.println("Socket ID " + client.getSessionId().toString() + " disconnected from socket");

        };
    }

    @PreDestroy
    public void stopSocketServer() {
        server.stop();
    }
}

