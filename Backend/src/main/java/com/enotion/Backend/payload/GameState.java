package com.enotion.Backend.payload;

import com.enotion.Backend.enums.SnakeType;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GameState {
    float x;
    float y;
    float rot;
    int score;
    SnakeType type;
}
