package com.enotion.Backend.payload;

import java.util.UUID;

public record RoomAndPlayerMV(RoomMV room, UUID playerId) {
}
