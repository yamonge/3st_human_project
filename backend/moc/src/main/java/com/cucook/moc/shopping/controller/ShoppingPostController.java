package com.cucook.moc.shopping.controller;

import com.cucook.moc.shopping.dto.ShoppingPostCreateRequestDTO;
import com.cucook.moc.shopping.dto.ShoppingPostDetailDTO;
import com.cucook.moc.shopping.dto.ShoppingPostSummaryDTO;
import com.cucook.moc.shopping.service.ShoppingPostJoinService;
import com.cucook.moc.shopping.service.ShoppingPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    /**
     * 주변 게시글 목록 (맵 기준)
     * GET /api/shopping/posts/nearby?lat=37.5&lng=127.0
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<ShoppingPostSummaryDTO>> getNearbyPosts(
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng
    ) {
        List<ShoppingPostSummaryDTO> list = shoppingPostService.getNearbyPosts(lat, lng);
        return ResponseEntity.ok(list);
    }

    /**
     * 게시글 상세
     * GET /api/shopping/posts/{postId}
     */
    @GetMapping("/{postId}")
    public ResponseEntity<ShoppingPostDetailDTO> getPostDetail(
            @PathVariable("postId") Long postId
    ) {
        ShoppingPostDetailDTO detail = shoppingPostService.getPostDetail(postId);
        return ResponseEntity.ok(detail);
    }

    @PostMapping("/{postId}/join")
    public void joinPost(@PathVariable Long postId,
                         @RequestParam("userId") Long userId) {
        shoppingPostJoinService.joinPost(postId, userId);
    }
}