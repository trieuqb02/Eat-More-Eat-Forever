package com.enotion.Backend.services;

import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.payload.*;

import java.util.List;

public interface IRoomService {
    RoomAndPlayerMV createRoom(RoomVM data);

    List<RoomMV> getAll();

    RoomAndPlayerMV updateRoom(JoinRoomVM data);

    RoomPlayer removeRoom(RoomAndPlayerVM leaveRoom);
}
