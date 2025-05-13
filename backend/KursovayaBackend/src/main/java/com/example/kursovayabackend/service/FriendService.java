package com.example.kursovayabackend.service;

import com.example.kursovayabackend.dto.FriendDto;
import com.example.kursovayabackend.dto.InviteDto;
import com.example.kursovayabackend.entity.Friendship;
import com.example.kursovayabackend.entity.Invite;
import com.example.kursovayabackend.mapper.FriendshipRepository;
import com.example.kursovayabackend.mapper.InviteRepository;
import com.example.kursovayabackend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {
    private final UserMapper userMapper;
    private final InviteRepository inviteRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserService userService;
    @Transactional
    public void sendInvite(Long fromUserId, String receiverLogin) {

        Long toUserId = userService.getUserIdByLogin(receiverLogin);
        userMapper.findById(toUserId).orElseThrow(() ->
            new IllegalArgumentException("Пользователь не найден!"));
        if (fromUserId.equals(toUserId)) {
            throw new IllegalArgumentException("Нельзя отправить приглашение самому себе");
        }
        boolean inviteExists = inviteRepository.findByUserId(toUserId).stream()
                .anyMatch(invite -> invite.getUserFromId().equals(fromUserId));
        if (inviteExists) {
            throw new IllegalArgumentException("Запрос уже отправлен");
        }

        if(friendshipRepository.findByUserId(fromUserId).stream()
                .anyMatch(friend -> friend.getFirstUserId().equals(toUserId) ||
                          friend.getSecondUserId().equals(toUserId))) {
            throw new IllegalArgumentException("Пользователь уже в друзьях");
        }

        Invite invite = new Invite();
        invite.setUserFromId(fromUserId);
        invite.setUserToId(toUserId);
        invite.setCreateAt(LocalDateTime.now());
        inviteRepository.save(invite);
    }

    @Transactional
    public void acceptInvite(Long inviteId, Long userId) {
        Invite invite = inviteRepository.findById(inviteId);
        Friendship friendship = new Friendship();
        friendship.setCreateAt(LocalDateTime.now());
        friendship.setFirstUserId(invite.getUserFromId());
        friendship.setSecondUserId(userId);
        friendshipRepository.save(friendship);

        inviteRepository.deleteById(inviteId);
    }
    @Transactional
    public List<Invite> getInvites(Long userId) {
        return friendshipRepository.findInvitesByUserId(userId);
    }
    @Transactional
    public List<Friendship> getFriends(Long userId) {
        return friendshipRepository.findByUserId(userId);
    }

    @Transactional
    public void declineInvite(Long inviteId) {
        inviteRepository.deleteById(inviteId);
    }

    @Transactional(readOnly = true)
    public List<FriendDto> getFriendsWithEmail(Long userId) {
        return friendshipRepository.findByFirstUserIdOrSecondUserId(userId)
                .stream()
                .map(friendship -> {
                    FriendDto dto = new FriendDto();
                    dto.setFriendshipId(friendship.getFriendshipId());
                    dto.setFirstUserId(friendship.getFirstUserId());
                    dto.setSecondUserId(friendship.getSecondUserId());

                    Long friendId = friendship.getFirstUserId().equals(userId)
                            ? friendship.getSecondUserId()
                            : friendship.getFirstUserId();

                    dto.setFriendEmail(userService.getUserEmailById(friendId));
                    dto.setCreateAt(friendship.getCreateAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InviteDto> getInvitesWithEmail(Long userId) {
        return inviteRepository.findByUserToId(userId)
                .stream()
                .map(invite -> {
                    InviteDto dto = new InviteDto();
                    dto.setInviteId(invite.getInviteId());
                    dto.setSenderEmail(userService.getUserEmailById(invite.getUserFromId()));
                    dto.setCreateAt(invite.getCreateAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
