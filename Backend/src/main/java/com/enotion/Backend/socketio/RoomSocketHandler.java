package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.enotion.Backend.enums.ResponseState;
import com.enotion.Backend.payload.*;
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
        server.addEventListener(EventName.JOIN_ROOM.name(), JoinRoomVM.class, joinRoom(server));
        server.addEventListener(EventName.LEAVE_ROOM.name(), LeaveRoom.class, leaveRoom(server));
        server.addEventListener(EventName.FAST_JOIN_ROOM.name(), String.class, fastJoinRoom(server));
        server.addEventListener(EventName.GET_ALL_ROOM.name(), String.class, getAllRoom());
    }

    private DataListener<RoomVM> createRoom(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {
            RoomAndPlayerMV roomAndPlayerMV = roomService.createRoom(data);
            if (ackSender.isAckRequested()){
                socketIOClient.joinRoom(String.valueOf(roomAndPlayerMV.room().id()));
                RoomAndPlayer roomAndPlayer = new RoomAndPlayer(roomAndPlayerMV.room().id(),roomAndPlayerMV.playerId());
                ackSender.sendAckData(ResponseState.CREATE_ROOM_SUCCESSFULLY.getCode(), roomAndPlayer);
            }
            server.getBroadcastOperations().sendEvent(EventName.NEW_ROOM.name(), roomAndPlayerMV.room());
        };
    }

    private DataListener<JoinRoomVM> joinRoom(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {
            RoomAndPlayerMV roomAndPlayerMV = roomService.updateRoom(data);
            if(ackSender.isAckRequested()) {
                if(roomAndPlayerMV == null){
                    ackSender.sendAckData(ResponseState.JOIN_FAILURE_ROOM.getCode(),ResponseState.JOIN_FAILURE_ROOM.getMessage());
                } else {
                    socketIOClient.joinRoom(String.valueOf(data.id()));
                    RoomAndPlayer roomAndPlayer = new RoomAndPlayer(roomAndPlayerMV.room().id(),roomAndPlayerMV.playerId());
                    ackSender.sendAckData(ResponseState.JOIN_FAILURE_SUCCESSFULLY.getCode(),roomAndPlayer);

                    for (SocketIOClient client : server.getAllClients()) {
                        if (!client.getAllRooms().contains(String.valueOf(roomAndPlayerMV.room().id()))) {
                            client.sendEvent(EventName.UPDATE_ROOM.name(), roomAndPlayerMV.room());
                        }
                    }
                }
            }
        };
    }

    private DataListener<String> fastJoinRoom(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {

        };
    }

    private DataListener<LeaveRoom> leaveRoom(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {

        };
    }

    private DataListener<String> getAllRoom() {
        return (socketIOClient, data, ackSender) -> {
            List<RoomMV> roomMVList = roomService.getAll();
            if (ackSender.isAckRequested()){
                ackSender.sendAckData(ResponseState.GET_ALL_ROOM_SUCCESSFULLY.getCode(),roomMVList);
            }
        };
    }
}
