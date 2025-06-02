package com.enotion.Backend.dto;

import com.enotion.Backend.entities.Room;
import com.enotion.Backend.enums.RoomState;

import java.util.UUID;

public record RoomMV(UUID id, String name, String description, RoomState state, int maxPlayers, int quantityPresent) {
    public static RoomMV convertRoomMV(Room room) {
        return new RoomMV(room.getId(), room.getName(), room.getDescription(), room.getState(), room.getMaxPlayers(), room.getPlayers().size());
    }
}
