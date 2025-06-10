package com.enotion.Backend.payload;

import com.enotion.Backend.entities.RoomPlayer;

import java.util.UUID;

public record LeaderBoardMV(UUID roomPlayerId, String name, int score, String urlImage) {
    public static LeaderBoardMV converToLeaderBoardMV(RoomPlayer roomPlayer){

        return new LeaderBoardMV(roomPlayer.getId(), roomPlayer.getPlayer().getName(), roomPlayer.getScore(), roomPlayer.getUrlImage());
    }
}
