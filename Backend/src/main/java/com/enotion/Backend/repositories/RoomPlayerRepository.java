package com.enotion.Backend.repositories;

import com.enotion.Backend.entities.Player;
import com.enotion.Backend.entities.Room;
import com.enotion.Backend.entities.RoomPlayer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomPlayerRepository extends JpaRepository<RoomPlayer, UUID> {
    List<RoomPlayer> findAllByRoomAndLeftAtIsNull(Room room);
    RoomPlayer findByRoomAndPlayer(Room room, Player player);
}
