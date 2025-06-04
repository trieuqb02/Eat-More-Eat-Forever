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

import java.time.LocalDateTime;
import java.util.List;
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
                .score(0)
                .player(player)
                .isHost(true)
                .isReady(false)
                .room(room)
                .joinedAt(LocalDateTime.now())
                .build();

        roomPlayer = roomPlayerRepository.save(roomPlayer);
        return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom()), PlayerMV.convertPlayerMV(roomPlayer.getPlayer(),roomPlayer.isHost()));
    }

    @Override
    public List<RoomMV> getAll() {
        List<Room> roomList = roomRepository.findAllByStateIn(List.of(RoomState.WAITING,RoomState.PLAYING));
        return roomList.stream().map(RoomMV::convertRoomMV).collect(Collectors.toList());
    }

    @Override
    public RoomAndPlayerMV updateRoom(JoinRoomVM data) {

        Room room = roomRepository.findById(data.id()).orElseThrow();
        if (!room.getName().equals(data.name()) && room.getPlayers().size() < room.getMaxPlayers()) {
            Player player = new Player();
            player.setName(data.name());
            player.setCurrentRoom(room);

            player = playerRepository.save(player);

            room.getPlayers().add(player);

            room = roomRepository.save(room);

            RoomPlayer roomPlayer = RoomPlayer.builder()
                    .score(0)
                    .player(player)
                    .room(room)
                    .isHost(false)
                    .isReady(false)
                    .joinedAt(LocalDateTime.now())
                    .build();

            roomPlayer = roomPlayerRepository.save(roomPlayer);
            return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom()), PlayerMV.convertPlayerMV(roomPlayer.getPlayer(),roomPlayer.isHost()));
        } else if (room.getName().equals(data.name())) {
            return new RoomAndPlayerMV(RoomMV.convertRoomMV(room), PlayerMV.convertPlayerMV(room.getPlayers().iterator().next(),true));
        }

        return null;
    }

    @Override
    public RoomPlayer removeRoom(LeaveRoom leaveRoom) {
        Room room = roomRepository.findById(leaveRoom.roomId()).orElseThrow();
        room.setState(RoomState.CLOSE);

        room = roomRepository.save(room);

        Player player = playerRepository.findById(leaveRoom.playerId()).orElseThrow();

        RoomPlayer roomPlayer = roomPlayerRepository.findByRoomAndPlayer(room, player);
        roomPlayer.setLeftAt(LocalDateTime.now());

        roomPlayer = roomPlayerRepository.save(roomPlayer);

        return roomPlayer;
    }
}
