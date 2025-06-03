package com.enotion.Backend.payload;

import java.util.UUID;

public record RoomAndPlayer(UUID roomId, UUID playerId) {
}
