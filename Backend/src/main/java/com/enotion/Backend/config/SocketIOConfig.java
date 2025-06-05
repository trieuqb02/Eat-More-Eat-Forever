package com.enotion.Backend.config;

import com.corundumstudio.socketio.SocketIOServer;
import com.enotion.Backend.socketio.SocketEventManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocketIOConfig {
    @Value("${socketio.port}")
    private int port;

    @Bean
    public SocketIOServer socketIOServer(SocketEventManager manager) {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setPort(port);
        config.setHostname("0.0.0.0");
        SocketIOServer server = new SocketIOServer(config);

        manager.registerAll(server);

        return server;
    }
}
