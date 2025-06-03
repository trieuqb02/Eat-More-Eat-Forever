package com.enotion.Backend.repositories;

import com.enotion.Backend.entities.RoomPlayer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoomPlayerRepository extends JpaRepository<RoomPlayer, UUID> {
}
