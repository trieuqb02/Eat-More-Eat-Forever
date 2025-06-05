package com.enotion.Backend.services;

import com.enotion.Backend.entities.Player;
import com.enotion.Backend.entities.Room;
import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.enums.RoomState;
import com.enotion.Backend.payload.PlayerMV;
import com.enotion.Backend.payload.RoomAndPlayerMV;
import com.enotion.Backend.payload.RoomAndPlayerVM;
import com.enotion.Backend.payload.RoomMV;
import com.enotion.Backend.repositories.PlayerRepository;
import com.enotion.Backend.repositories.RoomPlayerRepository;
import com.enotion.Backend.repositories.RoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

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

        return activePlayers.stream().map(roomPlayer -> {
            return PlayerMV.convertPlayerMV(roomPlayer.getPlayer(), roomPlayer.isHost(), roomPlayer.isReady());
        }).collect(Collectors.toList());
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
                return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom(), quantityPresent), PlayerMV.convertPlayerMV(roomPlayer.getPlayer(), roomPlayer.isHost(), roomPlayer.isReady()));
            }
        }

        roomPlayer.setReady(!roomPlayer.isReady());
        roomPlayer = roomPlayerRepository.save(roomPlayer);

        return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom(), quantityPresent), PlayerMV.convertPlayerMV(roomPlayer.getPlayer(), roomPlayer.isHost(), roomPlayer.isReady()));
    }
}
