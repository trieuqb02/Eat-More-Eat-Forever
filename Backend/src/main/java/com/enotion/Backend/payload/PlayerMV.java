package com.enotion.Backend.payload;

import com.enotion.Backend.entities.Player;
import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.enums.SnakeType;

import java.util.UUID;

public record PlayerMV(UUID id, String name, boolean isHost, boolean isReady, SnakeType type) {
    public static PlayerMV convertPlayerMV(RoomPlayer roomPlayer) {
        Player player = roomPlayer.getPlayer();
        return new PlayerMV(player.getId(), player.getName(), roomPlayer.isHost(), roomPlayer.isReady(), roomPlayer.getSnakeType());
    }
}
