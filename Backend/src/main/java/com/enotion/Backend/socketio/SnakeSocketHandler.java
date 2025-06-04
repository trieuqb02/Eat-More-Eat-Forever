package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.enotion.Backend.enums.EventName;
import com.enotion.Backend.payload.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SnakeSocketHandler {

    public void registerHandlers(SocketIOServer server) {
        // event, type data receive, callback
        //server.addEventListener(EventName.CREATE_ROOM.name(), RoomVM.class, createRoom());
        server.addEventListener(EventName.MOVE.name(), SnakeVM.class, handleMove(server));
    }

//    private DataListener<RoomVM> createRoom() {
//        return (socketIOClient, data, ackSender) -> {
//
//
//        };
//    }

    private DataListener<SnakeVM> handleMove(SocketIOServer server) {
        return (client, data, ackSender) -> {
            // send pos to other clients
            //server.getBroadcastOperations().sendEvent(EventName.SNAKE_MOVED.name(), data);
            System.out.println(data.x());
        };
    }
}
