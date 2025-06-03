package com.enotion.Backend.services;

import com.enotion.Backend.entities.Player;
import com.enotion.Backend.entities.Room;
import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.enums.RoomState;
import com.enotion.Backend.payload.JoinRoomVM;
import com.enotion.Backend.payload.RoomAndPlayerMV;
import com.enotion.Backend.payload.RoomMV;
import com.enotion.Backend.payload.RoomVM;
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
                .room(room)
                .joinedAt(LocalDateTime.now())
                .build();

        roomPlayer = roomPlayerRepository.save(roomPlayer);
        return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom()), roomPlayer.getPlayer().getId());
    }

    @Override
    public List<RoomMV> getAll() {
        List<Room> roomList = roomRepository.findAll();
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
                    .joinedAt(LocalDateTime.now())
                    .build();

            roomPlayer = roomPlayerRepository.save(roomPlayer);
            return new RoomAndPlayerMV(RoomMV.convertRoomMV(roomPlayer.getRoom()), roomPlayer.getPlayer().getId());
        } else if (room.getName().equals(data.name())) {
            return new RoomAndPlayerMV(RoomMV.convertRoomMV(room), room.getPlayers().iterator().next().getId());
        }

        return null;
    }
}
