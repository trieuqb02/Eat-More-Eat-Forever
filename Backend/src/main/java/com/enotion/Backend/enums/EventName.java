package com.enotion.Backend.enums;

public enum EventName {
    PING_CHECK,
    PONG_CHECK,

    CREATE_ROOM,
    JOIN_ROOM,
    LEAVE_ROOM,
    LEAVED_ROOM,
    DISSOLVE_ROOM,
    GET_ALL_ROOM,
    PLAYER_JOINED,
    START_GAME,
    STARTED_GAME,
    CHANGE_READY,

    REJOIN_GAME,

    SEND_MESSAGE,
    RECEIVE_MESSAGE,

    SAVE_SCORE,

    TIMEOUT_CONNECTION,

    // snake
    MOVE,
    SNAKE_MOVED,

}
