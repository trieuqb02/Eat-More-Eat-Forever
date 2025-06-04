package com.enotion.Backend.payload;

import java.util.UUID;

public record LeaveRoom(UUID roomId, UUID playerId) {
}
