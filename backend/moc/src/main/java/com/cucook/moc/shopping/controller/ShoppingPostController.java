package com.cucook.moc.shopping.controller;

import com.cucook.moc.shopping.dto.ShoppingPostCreateRequestDTO;
import com.cucook.moc.shopping.dto.ShoppingPostDetailDTO;
import com.cucook.moc.shopping.dto.ShoppingPostSummaryDTO;
import com.cucook.moc.shopping.service.ShoppingPostJoinService;
import com.cucook.moc.shopping.service.ShoppingPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shopping-posts")
public class ShoppingPostController {

    @Autowired
    private ShoppingPostService shoppingPostService;

    @Autowired
    private ShoppingPostJoinService shoppingPostJoinService;

    @PostMapping
    public Long createPost(@RequestParam("userId") Long userId,
                           @RequestBody ShoppingPostCreateRequestDTO dto) {
        return shoppingPostService.createPost(userId, dto);
    }

    @GetMapping("/nearby")
    public List<ShoppingPostSummaryDTO> getNearbyPosts(@RequestParam double lat,
                                                       @RequestParam double lng) {
        return shoppingPostService.getNearbyPosts(lat, lng);
    }

    @GetMapping("/{postId}")
    public ShoppingPostDetailDTO getPostDetail(@PathVariable Long postId) {
        return shoppingPostService.getPostDetail(postId);
    }

    @PostMapping("/{postId}/join")
    public void joinPost(@PathVariable Long postId,
                         @RequestParam("userId") Long userId) {
        shoppingPostJoinService.joinPost(postId, userId);
    }
}