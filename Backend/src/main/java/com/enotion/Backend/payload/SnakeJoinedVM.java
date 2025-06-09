package com.enotion.Backend.payload;

import com.enotion.Backend.enums.SnakeType;

public record SnakeJoinedVM(String playerId,  String roomId,float x, float y, float rot,int score, SnakeType snakeType) {

}

