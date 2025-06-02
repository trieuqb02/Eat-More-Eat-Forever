package com.enotion.Backend.services;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
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
        server.addConnectListener(client -> {
            System.out.println("Client connected: " + client.getSessionId());
        });

        server.addDisconnectListener(client -> {
            System.out.println("Client disconnected: " + client.getSessionId());
        });

        server.addEventListener("chat", String.class, (client, data, ackSender) -> {
            System.out.println("Received: " + data);
            server.getBroadcastOperations().sendEvent("chat", data);
        });

        server.start();
    }

    @PreDestroy
    public void stopSocketServer() {
        server.stop();
    }
}

