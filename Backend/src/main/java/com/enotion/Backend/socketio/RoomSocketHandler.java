package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.enotion.Backend.enums.EventName;
import com.enotion.Backend.services.RoomService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class RoomSocketHandler {

    RoomService roomService;

    public void registerHandlers(SocketIOServer server) {
        server.addEventListener(EventName.CREATE_ROOM.name(), String.class, createRoom());
        server.addEventListener(EventName.JOIN_ROOM.name(), String.class, JoinRoom());
        server.addEventListener(EventName.LEAVE_ROOM.name(), String.class, leaveRoom());
    }

    private DataListener<String> createRoom() {
        return (socketIOClient, data, ackSender) -> {

        };
    }

    private DataListener<String> JoinRoom() {
        return (socketIOClient, data, ackSender) -> {

        };
    }

    private DataListener<String> leaveRoom() {
        return (socketIOClient, data, ackSender) -> {

        };
    }
}
