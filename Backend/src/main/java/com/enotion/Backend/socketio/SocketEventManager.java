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

    RoomChatSocketHandler roomChatSocketHandler;

    public SocketEventManager(RoomSocketHandler roomSocketHandler, SnakeSocketHandler snakeSocketHandler, RoomChatSocketHandler roomChatSocketHandler) {
        this.roomSocketHandler = roomSocketHandler;
        this.snakeSocketHandler = snakeSocketHandler;
        this.roomChatSocketHandler = roomChatSocketHandler;
    }

    public void registerAll(SocketIOServer server) {
        roomChatSocketHandler.registerHandlers(server);
        roomSocketHandler.registerHandlers(server);
        snakeSocketHandler.registerHandlers(server);
    }
}
