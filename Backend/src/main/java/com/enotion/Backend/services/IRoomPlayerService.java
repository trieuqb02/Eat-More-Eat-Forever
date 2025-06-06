package com.enotion.Backend.services;

import com.enotion.Backend.payload.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface IRoomPlayerService {
    List<PlayerMV> getPlayersInRoom(UUID roomId);

    RoomAndPlayerMV changeReady(RoomAndPlayerVM playerId);

    List<LeaderBoardMV> getLeaderBoard();

    LeaderBoardMV update(GameOverMV gameOverMV, MultipartFile image) throws IOException;

    byte[] getImage(UUID roomPlayerId);
}
