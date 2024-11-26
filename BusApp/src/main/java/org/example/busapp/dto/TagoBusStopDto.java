public class TagoBusStopDto {
    private String nodeid;      // 정류소 ID
    private String nodenm;      // 정류소명
    private double gpslati;     // 위도
    private double gpslong;     // 경도

    public TagoBusStopDto() {}

    public TagoBusStopDto(String nodeid, String nodenm, double gpslati, double gpslong) {
        this.nodeid = nodeid;
        this.nodenm = nodenm;
        this.gpslati = gpslati;
        this.gpslong = gpslong;
    }

    public String getNodeid() {
        return nodeid;
    }

    public void setNodeid(String nodeid) {
        this.nodeid = nodeid;
    }

    public String getNodenm() {
        return nodenm;
    }

    public void setNodenm(String nodenm) {
        this.nodenm = nodenm;
    }

    public double getGpslati() {
        return gpslati;
    }

    public void setGpslati(double gpslati) {
        this.gpslati = gpslati;
    }

    public double getGpslong() {
        return gpslong;
    }

    public void setGpslong(double gpslong) {
        this.gpslong = gpslong;
    }
}
