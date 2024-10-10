package org.example.busapp.controller;



import org.example.busapp.model.RouteRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/transit")  // base path
@CrossOrigin(origins = "*") // CORS 설정
public class TransitController {

    @PostMapping("/routes")  // POST 요청에 대한 핸들러
    public ResponseEntity<?> getRoutes(@RequestBody RouteRequest request) {
        // 로직 구현
        return ResponseEntity.ok("API 호출 성공");
    }
}