package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOServer;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

@Component
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SocketEventManager {

    RoomSocketHandler roomSocketHandler;

    SnakeSocketHandler snakeSocketHandler;

    public SocketEventManager(RoomSocketHandler roomSocketHandler, SnakeSocketHandler snakeSocketHandler) {
        this.roomSocketHandler = roomSocketHandler;
        this.snakeSocketHandler = snakeSocketHandler;
    }

    public void registerAll(SocketIOServer server) {

        roomSocketHandler.registerHandlers(server);
        snakeSocketHandler.registerHandlers(server);
    }
}
