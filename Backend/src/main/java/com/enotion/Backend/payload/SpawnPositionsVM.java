package com.enotion.Backend.payload;

import com.fasterxml.jackson.databind.node.ArrayNode;

public record SpawnPositionsVM (String roomId, ArrayNode spawnPositions) { }
