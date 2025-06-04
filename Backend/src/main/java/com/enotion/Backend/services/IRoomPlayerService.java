package com.enotion.Backend.services;

import com.enotion.Backend.payload.PlayerMV;

import java.util.List;
import java.util.UUID;

public interface IRoomPlayerService {
    List<PlayerMV> getPlayersInRoom(UUID roomId);
}
