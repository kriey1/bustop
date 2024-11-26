package org.example.busapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

@RestController
public class TagoBusStopInfo {

    private static final String SERVICE_KEY = "7qe7vg3zUQdiZErzcHVVolstffAp3wUBke37nX4dyFcWCPsjYsiHmb5Su25Dw%2Fs1uv5zk6sh3oQq4sIynl8z0A%3D%3D"; // 발급받은 서비스 키로 변경하세요

    // 근처 버스 정류장 목록 조회
    @GetMapping("/getNearbyBusStops")
    public String getNearbyBusStops(
            @RequestParam(value = "pageNo", defaultValue = "1") String pageNo,
            @RequestParam(value = "numOfRows", defaultValue = "10") String numOfRows,
            @RequestParam(value = "gpsLati") String gpsLati,
            @RequestParam(value = "gpsLong") String gpsLong
    ) throws IOException {
        StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + SERVICE_KEY);
        urlBuilder.append("&" + URLEncoder.encode("pageNo", "UTF-8") + "=" + URLEncoder.encode(pageNo, "UTF-8")); // 페이지 번호
        urlBuilder.append("&" + URLEncoder.encode("numOfRows", "UTF-8") + "=" + URLEncoder.encode(numOfRows, "UTF-8")); // 한 페이지 결과 수
        urlBuilder.append("&" + URLEncoder.encode("_type", "UTF-8") + "=" + URLEncoder.encode("json", "UTF-8")); // JSON 형식으로 설정
        urlBuilder.append("&" + URLEncoder.encode("gpsLati", "UTF-8") + "=" + URLEncoder.encode(gpsLati, "UTF-8")); // 위도
        urlBuilder.append("&" + URLEncoder.encode("gpsLong", "UTF-8") + "=" + URLEncoder.encode(gpsLong, "UTF-8")); // 경도

        return getApiResponse(urlBuilder.toString());
    }

    // API 요청을 보내고 응답을 받아오는 메서드
    private String getApiResponse(String apiUrl) throws IOException {
        URL url = new URL(apiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");

        BufferedReader rd;
        if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
            rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
        }

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            sb.append(line);
        }
        rd.close();
        conn.disconnect();

        return sb.toString();
    }
}
