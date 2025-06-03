package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.enotion.Backend.payload.JoinRoomVM;
import com.enotion.Backend.payload.LeaveRoom;
import com.enotion.Backend.payload.RoomMV;
import com.enotion.Backend.payload.RoomVM;
import com.enotion.Backend.enums.EventName;
import com.enotion.Backend.services.RoomService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class RoomSocketHandler {

    RoomService roomService;

    public void registerHandlers(SocketIOServer server) {
        server.addEventListener(EventName.CREATE_ROOM.name(), RoomVM.class, createRoom(server));
        server.addEventListener(EventName.JOIN_ROOM.name(), JoinRoomVM.class, JoinRoom(server));
        server.addEventListener(EventName.LEAVE_ROOM.name(), LeaveRoom.class, leaveRoom(server));
        server.addEventListener(EventName.GET_ALL_ROOM.name(), String.class, getAllRoom());
    }

    private DataListener<RoomVM> createRoom(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {
            RoomMV roomInfo = roomService.createRoom(data);
            socketIOClient.sendEvent(EventName.CREATED_ROOM.name(), roomInfo);
            server.getBroadcastOperations().sendEvent(EventName.NEW_ROOM.name(), roomInfo);
        };
    }

    private DataListener<JoinRoomVM> JoinRoom(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {
            RoomMV roomInfo = roomService.updateRoom(data);
            socketIOClient.joinRoom(String.valueOf(data.id()));
            server.getBroadcastOperations().sendEvent(EventName.UPDATE_ROOM.name(), roomInfo);
        };
    }

    private DataListener<LeaveRoom> leaveRoom(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {
//            server.getBroadcastOperations().sendEvent(EventName.DELETE_ROOM.name(), roomInfo);
        };
    }

    private DataListener<String> getAllRoom() {
        return (socketIOClient, data, ackSender) -> {
            List<RoomMV> roomMVList = roomService.getAll();
            socketIOClient.sendEvent(EventName.GET_ALL_ROOM.name(), roomMVList);
        };
    }
}
