package org.example.busapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

@RestController
@RequestMapping("/api")
public class BusArrivalController {

    private static final String SERVICE_KEY = "7qe7vg3zUQdiZErzcHVVolstffAp3wUBke37nX4dyFcWCPsjYsiHmb5Su25Dw%2Fs1uv5zk6sh3oQq4sIynl8z0A%3D%3D";

    // 저상버스 노선의 정류소 도착예정정보
    @GetMapping("/getLowArrInfoByRoute")
    public String callGetLowArrInfoByRoute() throws IOException {
        StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + SERVICE_KEY);
        urlBuilder.append("&" + URLEncoder.encode("stId", "UTF-8") + "=" + URLEncoder.encode("112000001", "UTF-8")); // 정류소 고유 ID
        urlBuilder.append("&" + URLEncoder.encode("busRouteId", "UTF-8") + "=" + URLEncoder.encode("100100118", "UTF-8")); // 노선 ID
        urlBuilder.append("&" + URLEncoder.encode("ord", "UTF-8") + "=" + URLEncoder.encode("22", "UTF-8")); // 정류소 순번

        return getApiResponse(urlBuilder.toString());
    }

    // 저상버스 정류소 도착예정정보
    @GetMapping("/getLowArrInfoByStId")
    public String callGetLowArrInfoByStId() throws IOException {
        StringBuilder urlBuilder = new StringBuilder("http://ws.bus.go.kr/api/rest/arrive/getLowArrInfoByStId");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + SERVICE_KEY);
        urlBuilder.append("&" + URLEncoder.encode("stId", "UTF-8") + "=" + URLEncoder.encode("112000001", "UTF-8")); // 정류소 ID

        return getApiResponse(urlBuilder.toString());
    }

    // 예시: 모든 정류소 도착정보
    @GetMapping("/getArrInfoByRouteAll")
    public String callGetArrInfoByRouteAll() throws IOException {
        StringBuilder urlBuilder = new StringBuilder("http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + SERVICE_KEY);
        urlBuilder.append("&" + URLEncoder.encode("busRouteId", "UTF-8") + "=" + URLEncoder.encode("100100118", "UTF-8")); // 노선 ID

        return getApiResponse(urlBuilder.toString());
    }

    // 예시: 특정 정류소 도착정보
    @GetMapping("/getArrInfoByRoute")
    public String callGetArrInfoByRoute() throws IOException {
        StringBuilder urlBuilder = new StringBuilder("http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRoute");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + SERVICE_KEY);
        urlBuilder.append("&" + URLEncoder.encode("stId", "UTF-8") + "=" + URLEncoder.encode("112000001", "UTF-8")); // 정류소 고유 ID
        urlBuilder.append("&" + URLEncoder.encode("busRouteId", "UTF-8") + "=" + URLEncoder.encode("100100118", "UTF-8")); // 노선 ID
        urlBuilder.append("&" + URLEncoder.encode("ord", "UTF-8") + "=" + URLEncoder.encode("22", "UTF-8")); // 정류소 순번

        return getApiResponse(urlBuilder.toString());
    }

    private String getApiResponse(String urlString) throws IOException {
        URL url = new URL(urlString);
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
