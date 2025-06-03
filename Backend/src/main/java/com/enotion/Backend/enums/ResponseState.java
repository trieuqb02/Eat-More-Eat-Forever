package com.enotion.Backend.enums;

import lombok.Getter;

@Getter
public enum ResponseState {
    CREATE_ROOM_SUCCESSFULLY(200, "SUCCESS"),
    GET_ALL_ROOM_SUCCESSFULLY(200, "SUCCESS"),
    JOIN_FAILURE_ROOM(423, "FULL SLOT"),
    JOIN_FAILURE_SUCCESSFULLY(200, "SUCCESS");

    private final int code;
    private final String message;

    ResponseState(int code, String message) {
        this.code = code;
        this.message = message;
    }

}
