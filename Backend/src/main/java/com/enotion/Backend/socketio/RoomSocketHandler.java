package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.enums.ResponseState;
import com.enotion.Backend.payload.*;
import com.enotion.Backend.enums.EventName;
import com.enotion.Backend.services.RoomPlayerService;
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

    RoomPlayerService roomPlayerService;

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
                ackSender.sendAckData(ResponseState.CREATE_ROOM_SUCCESSFULLY.getCode(), roomAndPlayerMV);
            }
            for (SocketIOClient client : server.getAllClients()) {
                if (client.getAllRooms().size() < 2) {
                    client.sendEvent(EventName.NEW_ROOM.name(), roomAndPlayerMV.room());
                }
            }
        };
    }

    private DataListener<JoinRoomVM> joinRoom(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {
            RoomAndPlayerMV roomAndPlayerMV = roomService.updateRoom(data);
            List<PlayerMV> playerMVs = roomPlayerService.getPlayersInRoom(data.id());
            if(ackSender.isAckRequested()) {
                if(roomAndPlayerMV == null){
                    ackSender.sendAckData(ResponseState.JOIN_FAILURE_ROOM.getCode(),ResponseState.JOIN_FAILURE_ROOM.getMessage());
                } else {
                    socketIOClient.joinRoom(String.valueOf(data.id()));
                    ackSender.sendAckData(ResponseState.JOIN_ROOM_SUCCESSFULLY.getCode(),ResponseState.JOIN_ROOM_SUCCESSFULLY.getMessage(),roomAndPlayerMV, playerMVs);
                    for (SocketIOClient client : server.getAllClients()) {
                        if (client.getAllRooms().size() < 2) {
                            client.sendEvent(EventName.UPDATE_ROOM.name(), roomAndPlayerMV.room());
                        }
                    }
                    server.getRoomOperations(String.valueOf(data.id())).getClients().stream()
                            .filter(client -> !client.getSessionId().equals(socketIOClient.getSessionId()))
                            .forEach(client -> client.sendEvent(EventName.PLAYER_JOINED.name(), roomAndPlayerMV.player()));
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
            RoomPlayer roomPlayer = roomService.removeRoom(data);

            if(roomPlayer.isHost()){
                server.getRoomOperations(String.valueOf(data.roomId())).getClients()
                        .forEach(client -> {
                            client.leaveRoom(String.valueOf(data.roomId()));
                            client.sendEvent(EventName.LEAVED_ROOM.name(), PlayerMV.convertPlayerMV(roomPlayer.getPlayer(), roomPlayer.isHost()));
                        });

                

            } else {
                socketIOClient.leaveRoom(String.valueOf(data.roomId()));
                if(ackSender.isAckRequested()){
                    ackSender.sendAckData(ResponseState.LEAVE_ROOM_SUCCESSFULLY.getCode(),
                            ResponseState.LEAVE_ROOM_SUCCESSFULLY.getMessage(),
                            PlayerMV.convertPlayerMV(roomPlayer.getPlayer(), roomPlayer.isHost()));

                    for (SocketIOClient client : server.getAllClients()) {
                        if (client.getAllRooms().size() < 2) {
                            client.sendEvent(EventName.UPDATE_ROOM.name(), RoomMV.convertRoomMV(roomPlayer.getRoom()));
                        }
                    }
                }
            }
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
