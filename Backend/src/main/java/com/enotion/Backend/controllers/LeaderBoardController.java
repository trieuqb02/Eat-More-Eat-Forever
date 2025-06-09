package com.enotion.Backend.controllers;

import com.enotion.Backend.payload.LeaderBoardMV;
import com.enotion.Backend.services.RoomPlayerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RestController
@RequestMapping("/api/v1/")
public class LeaderBoardController {

    RoomPlayerService roomPlayerService;

    @GetMapping("view/{roomPlayerId}")
    public ResponseEntity<byte[]> viewImage(@PathVariable UUID roomPlayerId) throws Exception {
        byte[] imageData = roomPlayerService.getImage(roomPlayerId);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(imageData);
    }

    @GetMapping("leader-board")
    public ResponseEntity<?> getLeaderBoard(){
        List<LeaderBoardMV> list = roomPlayerService.getLeaderBoard();
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }
}
