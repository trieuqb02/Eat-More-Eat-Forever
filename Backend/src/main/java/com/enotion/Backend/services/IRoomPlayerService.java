package com.enotion.Backend.services;

import com.enotion.Backend.payload.PlayerMV;
import com.enotion.Backend.payload.RoomAndPlayerMV;
import com.enotion.Backend.payload.RoomAndPlayerVM;

import java.util.List;
import java.util.UUID;

public interface IRoomPlayerService {
    List<PlayerMV> getPlayersInRoom(UUID roomId);

    RoomAndPlayerMV changeReady(RoomAndPlayerVM playerId);
}
