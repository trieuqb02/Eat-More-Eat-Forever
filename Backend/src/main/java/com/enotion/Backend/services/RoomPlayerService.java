package com.enotion.Backend.services;

import com.enotion.Backend.entities.Room;
import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.payload.PlayerMV;
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

    @Override
    public List<PlayerMV> getPlayersInRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow();
        List<RoomPlayer> activePlayers = roomPlayerRepository.findAllByRoomAndLeftAtIsNull(room);

        return activePlayers.stream().map(roomPlayer -> {
            return PlayerMV.convertPlayerMV(roomPlayer.getPlayer(), roomPlayer.isHost());
        }).collect(Collectors.toList());
    }
}
