package com.enotion.Backend.services;

import com.enotion.Backend.entities.Player;
import com.enotion.Backend.entities.Room;
import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.enums.RoomState;
import com.enotion.Backend.enums.SnakeType;
import com.enotion.Backend.payload.*;
import com.enotion.Backend.repositories.PlayerRepository;
import com.enotion.Backend.repositories.RoomPlayerRepository;
import com.enotion.Backend.repositories.RoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class RoomService implements IRoomService {

    RoomRepository roomRepository;

    PlayerRepository playerRepository;

    RoomPlayerRepository roomPlayerRepository;

    @Override
    public RoomAndPlayerMV createRoom(RoomVM data) {
        Player player = Player.builder()
                .name(data.name())
                .build();

        Room room = Room.builder()
                .name(data.name())
                .state(RoomState.WAITING)
                .maxPlayers(data.quantity())
                .build();

        room.getPlayers().add(player);
        player.setCurrentRoom(room);

        room = roomRepository.save(room);

        RoomPlayer roomPlayer = RoomPlayer.builder()
                .player(player)
                .isHost(true)
                .isReady(false)
                .snakeType(SnakeType.RED)
                .room(room)
                .joinedAt(LocalDateTime.now())
                .build();

        roomPlayer = roomPlayerRepository.save(roomPlayer);

        return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom(), 1),
                PlayerMV.convertPlayerMV(roomPlayer));
    }

    @Override
    public List<RoomMV> getAll() {
        List<Room> roomList = roomRepository.findAllByStateIn(List.of(RoomState.WAITING,RoomState.PLAYING));
        return roomList.stream().map(room -> {
               int quantityPresent = roomPlayerRepository.findAllByRoomAndLeftAtIsNull(room).size();
               return RoomMV.convertRoomMV(room, quantityPresent);
        }
        ).collect(Collectors.toList());
    }

    @Override
    public RoomAndPlayerMV updateRoom(JoinRoomVM data) {

        Room room = roomRepository.findById(data.id()).orElseThrow();

        List<RoomPlayer> list = roomPlayerRepository.findAllByRoomAndLeftAtIsNull(room);

        for(RoomPlayer roomPlayer : list){
            if(roomPlayer.isHost() && roomPlayer.isReady()){
                return null;
            }
        }

        int quantityPresent = list.size();
        if (quantityPresent < room.getMaxPlayers()) {
            Player player = new Player();
            player.setName(data.name());
            player.setCurrentRoom(room);

            player = playerRepository.save(player);

            room.getPlayers().add(player);

            room = roomRepository.save(room);

            List<RoomPlayer> roomPlayers = roomPlayerRepository.findAllByRoomAndLeftAtIsNull(room);

            Set<SnakeType> usedTypes = roomPlayers.stream()
                    .map(RoomPlayer::getSnakeType)
                    .collect(Collectors.toSet());

            SnakeType selectedType = Arrays.stream(SnakeType.values())
                    .filter(type -> !usedTypes.contains(type))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("No available snake types"));

            RoomPlayer roomPlayer = RoomPlayer.builder()
                    .player(player)
                    .room(room)
                    .isHost(false)
                    .isReady(false)
                    .snakeType(selectedType)
                    .joinedAt(LocalDateTime.now())
                    .build();

            roomPlayer = roomPlayerRepository.save(roomPlayer);
            return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom(), quantityPresent + 1),
                    PlayerMV.convertPlayerMV(roomPlayer));
        }

        return null;
    }

    @Override
    public RoomPlayer removeRoom(RoomAndPlayerVM leaveRoom) {
        Room room = roomRepository.findById(leaveRoom.roomId()).orElseThrow();
        Player player = playerRepository.findById(leaveRoom.playerId()).orElseThrow();

        RoomPlayer roomPlayer = roomPlayerRepository.findByRoomAndPlayer(room, player);
        roomPlayer.setLeftAt(LocalDateTime.now());

        if(roomPlayer.isHost()){
            room.setState(RoomState.CLOSE);
            roomRepository.save(room);
        }

        roomPlayer = roomPlayerRepository.save(roomPlayer);

        return roomPlayer;
    }
}
