package com.enotion.Backend.payload;

import java.util.UUID;

public record GameOverMV(UUID roomId, UUID playerId, int score, String imageBase64) {
}
