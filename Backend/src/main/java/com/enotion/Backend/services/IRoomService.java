package com.enotion.Backend.services;

import com.enotion.Backend.payload.JoinRoomVM;
import com.enotion.Backend.payload.RoomAndPlayerMV;
import com.enotion.Backend.payload.RoomMV;
import com.enotion.Backend.payload.RoomVM;

import java.util.List;

public interface IRoomService {
    RoomAndPlayerMV createRoom(RoomVM data);

    List<RoomMV> getAll();

    RoomAndPlayerMV updateRoom(JoinRoomVM data);
}
