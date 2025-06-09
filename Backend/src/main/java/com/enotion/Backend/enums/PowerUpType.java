package com.enotion.Backend.enums;

import lombok.Getter;

@Getter
public enum PowerUpType {
    ACCELERATE(0),
    SLOW(1),
    MYSTERY(999);

    private final int code;

    PowerUpType(int code) {
        this.code = code;
    }
    public int getCode() {
        return code;
    }
    public static PowerUpType fromCode(int code) {
        for (PowerUpType type : values()) {
            if (type.code == code) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown PowerUpType code: " + code);
    }
    public static PowerUpType getRandomBasicEffect() {
        PowerUpType[] basics = {ACCELERATE, SLOW};
        return basics[(int)(Math.random() * basics.length)];
    }
}
