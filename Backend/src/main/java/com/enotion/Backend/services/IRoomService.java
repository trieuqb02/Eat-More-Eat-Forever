package com.enotion.Backend.services;

import com.enotion.Backend.dto.RoomMV;

public interface IRoomService {
    RoomMV createRoom(String name);
}
