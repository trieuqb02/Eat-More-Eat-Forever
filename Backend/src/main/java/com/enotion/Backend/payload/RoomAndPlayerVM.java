package com.enotion.Backend.payload;

import java.util.UUID;

public record RoomAndPlayerVM(UUID roomId, UUID playerId, boolean isHost) {
}
