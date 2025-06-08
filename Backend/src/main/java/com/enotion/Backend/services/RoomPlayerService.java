package com.enotion.Backend.services;

import com.enotion.Backend.entities.Player;
import com.enotion.Backend.entities.Room;
import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.enums.RoomState;
import com.enotion.Backend.payload.*;
import com.enotion.Backend.repositories.PlayerRepository;
import com.enotion.Backend.repositories.RoomPlayerRepository;
import com.enotion.Backend.repositories.RoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class RoomPlayerService implements IRoomPlayerService {

    RoomPlayerRepository roomPlayerRepository;
    RoomRepository roomRepository;
    PlayerRepository playerRepository;

    @Override
    public List<PlayerMV> getPlayersInRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow();
        List<RoomPlayer> activePlayers = roomPlayerRepository.findAllByRoomAndLeftAtIsNull(room);

        return activePlayers.stream().map(PlayerMV::convertPlayerMV).collect(Collectors.toList());
    }

    @Override
    public RoomAndPlayerMV changeReady(RoomAndPlayerVM data) {
        Room room = roomRepository.findById(data.roomId()).orElseThrow();
        if (data.isHost()) {
            room.setState(RoomState.PLAYING);
            room = roomRepository.save(room);
        }
        Player player = playerRepository.findById(data.playerId()).orElseThrow();
        RoomPlayer roomPlayer = roomPlayerRepository.findByRoomAndPlayer(room, player);
        int quantityPresent = getPlayersInRoom(room.getId()).size();
        if (data.isHost()) {
            boolean startGame = true;
            List<RoomPlayer> list = roomPlayerRepository.findAllByRoomAndLeftAtIsNull(room);
            for (RoomPlayer element : list) {
                if (!element.isReady() && !element.getPlayer().getId().equals(data.playerId())) {
                    startGame = false;
                    break;
                }
            }

            if (!startGame) {
                return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom(), quantityPresent), PlayerMV.convertPlayerMV(roomPlayer));
            }
        }

        roomPlayer.setReady(!roomPlayer.isReady());
        roomPlayer = roomPlayerRepository.save(roomPlayer);

        return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom(), quantityPresent), PlayerMV.convertPlayerMV(roomPlayer));
    }

    @Override
    public List<LeaderBoardMV> getLeaderBoard() {
        List<RoomPlayer> list = roomPlayerRepository.findTop10ByScoreNotNullOrderByScoreDesc();
        return list.stream().map(LeaderBoardMV::converToLeaderBoardMV).toList();
    }

    @Override
    public LeaderBoardMV update(GameOverMV gameOverMV) {
        Room room = roomRepository.findById(gameOverMV.roomId()).orElseThrow();
        Player player = playerRepository.findById(gameOverMV.playerId()).orElseThrow();

        RoomPlayer roomPlayer = roomPlayerRepository.findByRoomAndPlayer(room, player);
        roomPlayer.setScore(gameOverMV.score());

        if (roomPlayer.isHost()) {
            room.setState(RoomState.CLOSE);
            roomRepository.save(room);
        }

        byte[] image = decodeBase64Image(gameOverMV.imageBase64());

        roomPlayer.setImage(image);

        roomPlayer = roomPlayerRepository.save(roomPlayer);
        return LeaderBoardMV.converToLeaderBoardMV(roomPlayer);
    }

    @Override
    public RoomAndPlayerMV quitGame(UUID roomId, UUID playerId) {
        Room room = roomRepository.findById(roomId).orElseThrow();
        Player player = playerRepository.findById(playerId).orElseThrow();
        RoomPlayer roomPlayer = roomPlayerRepository.findByRoomAndPlayer(room, player);
        roomPlayer.setScore(0);
        roomPlayer = roomPlayerRepository.save(roomPlayer);
        return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom(), 0), PlayerMV.convertPlayerMV(roomPlayer));
    }

    @Override
    public byte[] getImage(UUID roomPlayerId) {
        RoomPlayer roomPlayer = roomPlayerRepository.findById(roomPlayerId).orElseThrow();
        return roomPlayer.getImage();
    }

    public static byte[] decodeBase64Image(String imageBase64) {

        if (imageBase64 == null || !imageBase64.contains(",")) {
            throw new IllegalArgumentException("Invalid base64 image string");
        }

        String base64Data = imageBase64.split(",")[1];

        return Base64.getDecoder().decode(base64Data);
    }
}
