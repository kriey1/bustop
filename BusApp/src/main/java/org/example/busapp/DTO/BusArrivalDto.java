package org.example.busapp.DTO;

public class BusArrivalDto {
    private String busRouteId;
    private String arrivalTime;
    private String message;

    // 생성자, getter, setter 추가
    public BusArrivalDto(String busRouteId, String arrivalTime, String message) {
        this.busRouteId = busRouteId;
        this.arrivalTime = arrivalTime;
        this.message = message;
    }

    public String getBusRouteId() {
        return busRouteId;
    }

    public void setBusRouteId(String busRouteId) {
        this.busRouteId = busRouteId;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
