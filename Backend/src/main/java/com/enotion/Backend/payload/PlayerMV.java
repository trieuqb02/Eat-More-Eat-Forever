package com.enotion.Backend.payload;

import com.enotion.Backend.entities.Player;

import java.util.UUID;

public record PlayerMV(UUID id, String name, boolean isHost, boolean isReady) {
    public static PlayerMV convertPlayerMV(Player player, boolean isHost, boolean isReady) {
        return new PlayerMV(player.getId(), player.getName(), isHost, isReady);
    }
}
