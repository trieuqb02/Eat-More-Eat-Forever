package com.enotion.Backend.services;

import com.enotion.Backend.payload.JoinRoomVM;
import com.enotion.Backend.payload.RoomMV;
import com.enotion.Backend.payload.RoomVM;

import java.util.List;

public interface IRoomService {
    RoomMV createRoom(RoomVM data);

    List<RoomMV> getAll();

    RoomMV updateRoom(JoinRoomVM data);
}
