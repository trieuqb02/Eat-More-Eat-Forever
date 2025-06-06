package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.enotion.Backend.enums.EventName;
import com.enotion.Backend.payload.MessageVM;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class RoomChatSocketHandler {

    public void registerHandlers(SocketIOServer server) {
        server.addEventListener(EventName.SEND_MESSAGE.name(), MessageVM.class, sendMessage(server));
    }

    private DataListener<MessageVM> sendMessage(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {
            LocalTime now = LocalTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm:ss a");
            String formattedTime = now.format(formatter);
            if(ackSender.isAckRequested()){
                ackSender.sendAckData(data.message(), formattedTime);
            }
            server.getRoomOperations(String.valueOf(data.roomId())).getClients().stream()
                    .filter(client -> !client.getSessionId().equals(socketIOClient.getSessionId()))
                    .forEach(client -> {
                        client.sendEvent(EventName.RECEIVE_MESSAGE.name(), data.message(), data.player().name(), formattedTime);
                    });
        };
    }
}
