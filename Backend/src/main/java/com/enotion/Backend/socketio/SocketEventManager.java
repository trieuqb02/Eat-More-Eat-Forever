package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.stereotype.Component;

@Component
public class SocketEventManager {

    private final RoomSocketHandler roomSocketHandler;

    public SocketEventManager(RoomSocketHandler roomSocketHandler) {
        this.roomSocketHandler = roomSocketHandler;
    }

    public void registerAll(SocketIOServer server) {
        roomSocketHandler.registerHandlers(server);
    }
}
