package com.enotion.Backend.repositories;

import com.enotion.Backend.entities.Room;
import com.enotion.Backend.enums.RoomState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findAllByStateIn(List<RoomState> states);

}
