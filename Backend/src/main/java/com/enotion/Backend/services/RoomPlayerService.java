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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
        if(data.isHost()){
            room.setState(RoomState.PLAYING);
            room = roomRepository.save(room);
        }
        Player player = playerRepository.findById(data.playerId()).orElseThrow();
        RoomPlayer roomPlayer = roomPlayerRepository.findByRoomAndPlayer(room,player);
        int quantityPresent = getPlayersInRoom(room.getId()).size();
        if(data.isHost()){
            boolean startGame = true;
            List<RoomPlayer> list = roomPlayerRepository.findAllByRoomAndLeftAtIsNull(room);
            for (RoomPlayer element : list){
                if (!element.isReady() && !element.getPlayer().getId().equals(data.playerId())) {
                    startGame = false;
                    break;
                }
            }

            if(!startGame){
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
    public LeaderBoardMV update(GameOverMV gameOverMV, MultipartFile image) throws IOException {
        Room room = roomRepository.findById(gameOverMV.roomId()).orElseThrow();
        Player player = playerRepository.findById(gameOverMV.playerId()).orElseThrow();

        RoomPlayer roomPlayer = roomPlayerRepository.findByRoomAndPlayer(room,player);
        roomPlayer.setScore(gameOverMV.score());
        roomPlayer.setImage(image.getBytes());

        roomPlayer = roomPlayerRepository.save(roomPlayer);
        return LeaderBoardMV.converToLeaderBoardMV(roomPlayer);
    }

    @Override
    public byte[] getImage(UUID roomPlayerId) {
        RoomPlayer roomPlayer = roomPlayerRepository.findById(roomPlayerId).orElseThrow();
        return roomPlayer.getImage();
    }
}
