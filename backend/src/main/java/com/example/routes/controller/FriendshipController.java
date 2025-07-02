package com.example.routes.controller;

import com.example.routes.dto.request.FriendInvitationRequest;
import com.example.routes.dto.response.FriendInvitationResponse;
import com.example.routes.dto.response.FriendResponse;
import com.example.routes.dto.response.InviteResponse;
import com.example.routes.service.FriendService;
import com.example.routes.service.InviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friend")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendService friendService;
    private final InviteService inviteService;

    @PostMapping("/invite")
    public ResponseEntity<FriendInvitationResponse> sendInvitation(@RequestBody FriendInvitationRequest request) {
        return ResponseEntity.ok(friendService.sendInvitation(request.getUsername()));
    }

    @GetMapping("/invite/{userId}")
    public ResponseEntity<List<InviteResponse>> getReceivedInvites(@PathVariable Long userId) {
        return ResponseEntity.ok(friendService.getReceivedInvites(userId));
    }

    @PatchMapping("/{inviteId}/accept")
    public ResponseEntity<FriendInvitationResponse> acceptInvite(@PathVariable Long inviteId) {
        return ResponseEntity.ok(inviteService.acceptInvite(inviteId));
    }

    @PatchMapping("/{inviteId}/decline")
    public ResponseEntity<FriendInvitationResponse> declineInvite(@PathVariable Long inviteId) {
        return ResponseEntity.ok(inviteService.declineInvite(inviteId));
    }

    @GetMapping("/friends/{userId}")
    public ResponseEntity<List<FriendResponse>> getFriends(@PathVariable Long userId) {
        return ResponseEntity.ok(friendService.getFriends(userId));
    }
}
