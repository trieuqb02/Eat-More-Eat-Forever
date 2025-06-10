package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.enotion.Backend.enums.EventName;
import com.enotion.Backend.enums.PowerUpType;
import com.enotion.Backend.payload.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.*;

@Component
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SnakeSocketHandler {
    Map<Integer, Boolean> spawnedFoods = new ConcurrentHashMap<>();
    Map<Integer, FoodMV> activeFoods = new ConcurrentHashMap<>();
    Map<String, ScheduledExecutorService> gameTimers = new ConcurrentHashMap<>();
    Map<String, Integer> roomTimers = new ConcurrentHashMap<>();
    Map<String, Integer> playerScores = new ConcurrentHashMap<>();

    public void registerHandlers(SocketIOServer server) {
        // event, type data receive, callback
        server.addEventListener(EventName.MOVE.name(), SnakeVM.class, handleMove(server));
        server.addEventListener("JOIN_GAME", JoinGameVM.class, handleJoinGame(server));
        server.addEventListener("FOOD_EATEN", FoodMV.class, handleFoodEaten(server));
        server.addEventListener("PLAYER_QUIT", PlayerLeaveVM.class, handlePlayerQuit(server));
        server.addEventListener("SNAKE_DIED", PlayerLeaveVM.class, (client, data, ackSender) -> {
            server.getBroadcastOperations().sendEvent("SNAKE_DIED", data);
        });
        server.addEventListener("START_GAMEPLAY", StartGameVM.class, handleStartGame(server));

        server.addEventListener("POWER_UP_COLLECTED", PowerUpCollectedVM.class, (client, data, ackSender) -> {
            String playerId = data.playerId();
            String roomId = data.roomId();
            int powerUpType = data.powerUpType();
            int duration = data.duration();

            // remove
            server.getRoomOperations(roomId).sendEvent("POWER_UP_REMOVED", powerUpType);
            spawnPowerUp(server, roomId);

            PowerUpType type;
            try {
                type = PowerUpType.fromCode(powerUpType);
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid PowerUpType from client");
                return;
            }

            PowerUpType effectToApply = type;
            if (type == PowerUpType.MYSTERY) {
                effectToApply = PowerUpType.getRandomBasicEffect();
            }

            PowerUpEffectMV effectData = new PowerUpEffectMV(playerId, effectToApply.getCode(), duration);
            server.getRoomOperations(roomId).sendEvent("APPLY_EFFECT", effectData);
        });
    }

    private DataListener<StartGameVM> handleStartGame(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String roomId = data.roomId();
            int gameTime = 60;

            spawnPowerUp(server, roomId);

            // check had
            if (gameTimers.containsKey(roomId)) return;

            roomTimers.put(roomId, gameTime);

            ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
            gameTimers.put(roomId, scheduler);

            scheduler.scheduleAtFixedRate(() -> {
                int timer = roomTimers.get(roomId) - 1;

                if (timer >= 0) {
                    roomTimers.put(roomId, timer);
                    server.getRoomOperations(roomId).sendEvent("TIMER_COUNT", timer);
                }

                if (timer <= 0) {
                    scheduler.shutdown();
                    gameTimers.remove(roomId);
                    roomTimers.remove(roomId);

                    server.getRoomOperations(roomId).sendEvent("GAME_OVER");
                }
            }, 1, 1, TimeUnit.SECONDS);
        };
    }

    private DataListener<PlayerLeaveVM> handlePlayerQuit(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String playerId = data.playerId();
            server.getBroadcastOperations().sendEvent("PLAYER_QUIT", data);
        };
    }

    private DataListener<FoodMV> handleFoodEaten(SocketIOServer server) {
        return (client, data, ackSender) -> {
            int foodType = data.foodType();
            String playerId = data.playerId();
            int snakeType = data.snakeType();

            // get snakeType player
            boolean isMapping = (snakeType == foodType);

            int amountScore = isMapping ? 10 : -10;
            int score = playerScores.getOrDefault(playerId, 0) + amountScore;
            if(score <= 0){
                score = 0;
            }
            playerScores.put(playerId, score);
            // create food
            FoodEatenMV foodEatenMV = new FoodEatenMV(playerId, foodType, isMapping, score);
            server.getBroadcastOperations().sendEvent("FOOD_EATEN", foodEatenMV);

            // remove food
            activeFoods.remove(foodType);
            server.getBroadcastOperations().sendEvent("FOOD_REMOVED", foodType);
            spawnedFoods.put(foodType, false);
            // Respawn after 0.5s
            ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
            scheduler.schedule(() -> {
                if(!spawnedFoods.getOrDefault(foodType, false)){
                    float x = (float)(Math.random() * 600 - 300);
                    float y = (float)(Math.random() * 400 - 200);
                    FoodMV newFood = new FoodMV(playerId, foodType, snakeType, x, y);
                    server.getBroadcastOperations().sendEvent("SPAWN_FOOD", newFood);
                    spawnedFoods.put(foodType, true);
                    activeFoods.put(foodType, newFood);
                }
            }, 1500, TimeUnit.MILLISECONDS);
        };
    }

    private DataListener<SnakeVM> handleMove(SocketIOServer server) {
        return (client, data, ackSender) -> {
            // send pos to other clients
            server.getBroadcastOperations().sendEvent(EventName.SNAKE_MOVED.name(), data);
        };
    }

    private DataListener<JoinGameVM> handleJoinGame(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String playerId = data.playerId();

            SnakeJoinedVM joined = new SnakeJoinedVM(
                    playerId,
                    (float)(Math.random() * 500 - 250),
                    (float)(Math.random() * 500 - 250),
                    0,
                    data.type());

            // send own client to spawn
            client.sendEvent("PLAYER_CREATED", joined);

            // send cur food list to other client
            for (FoodMV food : activeFoods.values()) {
                client.sendEvent("SPAWN_FOOD", food);
            }

            // emit others client has new client
            server.getRoomOperations(String.valueOf(data.roomId())).sendEvent("NEW_PLAYER_JOINED", joined);

            // spawn food
            // First player -> spawn 3 type food
            if (activeFoods.isEmpty()) {
                spawnInitialFoods(server, playerId);
            }
        };
    }

    private void spawnInitialFoods(SocketIOServer server, String playerId) {
        activeFoods.clear();
        spawnedFoods.clear();

        for (int type = 0; type < 3; type++) {
            float x = (float) (Math.random() * 1000 - 500);
            float y = (float) (Math.random() * 1000 - 500);

            FoodMV food = new FoodMV(playerId, type, 0, x, y);
            activeFoods.put(type, food);
            spawnedFoods.put(type, true);

            server.getBroadcastOperations().sendEvent("SPAWN_FOOD", food);
        }
    }

    private void spawnPowerUp(SocketIOServer server, String roomId) {
        int delay = ThreadLocalRandom.current().nextInt(3000, 7000);
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.schedule(() -> {
            float x = (float)(Math.random() * 600 - 300);
            float y = (float)(Math.random() * 400 - 200);
            int powerUpType = PowerUpType.MYSTERY.getCode();
            PowerUpMV spawnData = new PowerUpMV(powerUpType, x, y);
            server.getRoomOperations(roomId).sendEvent("SPAWN_POWER_UP", spawnData);
        }, delay, TimeUnit.MILLISECONDS);
    }

    private void resetScore(String playerId) {
        playerScores.put(playerId, 0);
    }
}
