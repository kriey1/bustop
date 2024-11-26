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
public class BusRouteInfoController {

    private static final String SERVICE_KEY = "7qe7vg3zUQdiZErzcHVVolstffAp3wUBke37nX4dyFcWCPsjYsiHmb5Su25Dw%2Fs1uv5zk6sh3oQq4sIynl8z0A%3D%3D";
    private static final String BUS_ROUTE_ID = "100100118";  // 버스 노선 ID 직접 포함

    @GetMapping("/getStationByRoute")
    public String callGetStationByRoute() throws IOException {
        StringBuilder urlBuilder = new StringBuilder("http://ws.bus.go.kr/api/rest/busRouteInfo/getStaionByRoute");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + SERVICE_KEY);
        urlBuilder.append("&" + URLEncoder.encode("busRouteId", "UTF-8") + "=" + URLEncoder.encode(BUS_ROUTE_ID, "UTF-8"));

        return getApiResponse(urlBuilder.toString());
    }

    @GetMapping("/getRouteInfo")
    public String callGetRouteInfo() throws IOException {
        StringBuilder urlBuilder = new StringBuilder("http://ws.bus.go.kr/api/rest/busRouteInfo/getRouteInfo");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + SERVICE_KEY);
        urlBuilder.append("&" + URLEncoder.encode("busRouteId", "UTF-8") + "=" + URLEncoder.encode(BUS_ROUTE_ID, "UTF-8")); // 노선ID 설정

        return getApiResponse(urlBuilder.toString());
    }

    @GetMapping("/getRoutePath")
    public String callGetRoutePath() throws IOException {
        StringBuilder urlBuilder = new StringBuilder("http://ws.bus.go.kr/api/rest/busRouteInfo/getRoutePath");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + SERVICE_KEY);
        urlBuilder.append("&" + URLEncoder.encode("busRouteId", "UTF-8") + "=" + URLEncoder.encode(BUS_ROUTE_ID, "UTF-8")); // 노선ID 설정

        return getApiResponse(urlBuilder.toString());
    }

    @GetMapping("/getBusRouteList")
    public String callGetBusRouteList() throws IOException {
        StringBuilder urlBuilder = new StringBuilder("http://ws.bus.go.kr/api/rest/busRouteInfo/getBusRouteList");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + SERVICE_KEY);
        urlBuilder.append("&" + URLEncoder.encode("strSrch", "UTF-8") + "=" + URLEncoder.encode("3", "UTF-8")); // 검색할 노선번호

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
