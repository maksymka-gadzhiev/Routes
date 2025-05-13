package com.example.kursovayabackend.controller;

import com.example.kursovayabackend.dto.FriendDto;
import com.example.kursovayabackend.dto.FriendRequestDto;
import com.example.kursovayabackend.dto.InviteDto;
import com.example.kursovayabackend.service.FriendService;
import com.example.kursovayabackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {
    private final FriendService friendService;
    private final UserService userService;

    @PostMapping("/invite")
    public ResponseEntity<?> sendFriendRequest(@RequestBody FriendRequestDto request) {
        try {
            if (request.getSenderId() == null || request.getReceiverLogin() == null) {
                throw new IllegalArgumentException("IDs cannot be null");
            }

            friendService.sendInvite(request.getSenderId(), request.getReceiverLogin());
            return ResponseEntity.ok(Map.of("status", "success"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/accept/{inviteId}")
    public ResponseEntity<?> acceptInvite(@PathVariable Long inviteId) {
        try {
            Long userId = getCurrentUserId();
            friendService.acceptInvite(inviteId, userId);
            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/decline/{inviteId}")
    public ResponseEntity<?> declineInvite(@PathVariable Long inviteId) {
        try{
            friendService.declineInvite(inviteId);
            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping
    public ResponseEntity<List<FriendDto>> getFriends() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(friendService.getFriendsWithEmail(userId));
    }

    @GetMapping("/invites")
    public ResponseEntity<List<InviteDto>> getInvites() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(friendService.getInvitesWithEmail(userId));
    }
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userService.getUserIdByEmail(userDetails.getUsername());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FriendDto>> getUserFriends(@PathVariable Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        Long currentUserId = userService.getUserIdByEmail(userDetails.getUsername());

        if (!currentUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(friendService.getFriendsWithEmail(userId));
    }


}
