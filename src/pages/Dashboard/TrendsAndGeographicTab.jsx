import { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { Card, DatePicker, Button, Row, Col, Spin } from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { RangePicker } = DatePicker;

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function TrendsAndGeographicTab() {
    const [trends, setTrends] = useState(null);
    const [geoData, setGeoData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [dates, setDates] = useState([]);

    // Fetch Trends
    const fetchTrends = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                "https://api.maghni.acwad.tech/api/v1/dashboard/trends"
            );
            setTrends(res.data);
        } catch (err) {
            console.error("Error fetching trends:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch geo data
    const fetchGeoData = async () => {
        try {
            setGeoLoading(true);

            const startDate = dates?.[0]?.format("YYYY-MM-DD");
            const endDate = dates?.[1]?.format("YYYY-MM-DD");

            const res = await axios.get(
                "https://api.maghni.acwad.tech/api/v1/dashboard/geographic/stats",
                {
                    params: {
                        startDate: startDate || undefined,
                        endDate: endDate || undefined,
                    },
                }
            );
            setGeoData(res.data || []);
        } catch (err) {
            console.error("Error fetching geographic data:", err);
        } finally {
            setGeoLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends();
        fetchGeoData();
    }, []);

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-bold mb-4">
                Dashboard Trends & Geographic Stats
            </h2>

            {/* ================== Loading Trends ================== */}
            {loading && (
                <div className="flex justify-center py-10">
                    <Spin size="large" />
                </div>
            )}

            {/* ================== Trend Cards ================== */}
            {!loading && trends && (
                <Row gutter={16}>
                    <Col xs={24} sm={12} lg={6}>
                        <TrendCard
                            title="Revenue"
                            current={trends.revenue.current}
                            change={trends.revenue.change}
                            direction={trends.revenue.direction}
                            color="#2563eb"
                            suffix=" EGP"
                        />
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <TrendCard
                            title="Orders"
                            current={trends.orders.current}
                            change={trends.orders.change}
                            direction={trends.orders.direction}
                            color="#10b981"
                        />
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <TrendCard
                            title="Users"
                            current={trends.users.current}
                            change={trends.users.change}
                            direction={trends.users.direction}
                            color="#f59e0b"
                        />
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <TrendCard
                            title="Avg Order Value"
                            current={trends.averageOrderValue.current}
                            change={trends.averageOrderValue.change}
                            direction={trends.averageOrderValue.direction}
                            color="#8b5cf6"
                            suffix=" EGP"
                        />
                    </Col>
                </Row>
            )}

            {/* ================== Geographic Section ================== */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">Geographic Statistics</h3>

                {/* Date Range Filter */}
                <Row gutter={12} align="middle">
                    <Col>
                        <RangePicker
                            value={dates}
                            onChange={(values) => setDates(values)}
                        />
                    </Col>
                    <Col>
                        <Button type="primary" onClick={fetchGeoData} loading={geoLoading}>
                            Apply Filters
                        </Button>
                    </Col>
                </Row>

                {/* ================== Map Loading ================== */}
                {geoLoading && (
                    <div className="flex justify-center py-10">
                        <Spin size="large" />
                    </div>
                )}

                {/* ================== No Data ================== */}
                {!geoLoading && geoData.length === 0 && (
                    <p className="text-center text-gray-600">
                        No geographic data available.
                    </p>
                )}

                {/* ================== Map ================== */}
                {!geoLoading && geoData.length > 0 && (
                    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
                        <MapContainer
                            center={[30, 30]}
                            zoom={6}
                            scrollWheelZoom
                            style={{ width: "100%", height: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {geoData.map((point, idx) => (
                                <Marker
                                    key={idx}
                                    position={[point.latitude, point.longitude]}
                                    icon={markerIcon}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p><strong>Orders:</strong> {point.orderCount}</p>
                                            <p><strong>Total Revenue:</strong> {point.totalRevenue} EGP</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

// ================== Trend Card ==================
function TrendCard({ title, current, change, direction, color, suffix }) {
    const arrow =
        direction === "up" ? "▲" : direction === "down" ? "▼" : "→";

    const arrowColor =
        direction === "up"
            ? "text-green-300"
            : direction === "down"
            ? "text-red-300"
            : "text-gray-300";

    return (
        <Card style={{ backgroundColor: color, color: "#fff" }}>
            <h4 className="text-sm uppercase opacity-80">{title}</h4>
            <p className="text-2xl font-bold mt-1">
                <CountUp end={current || 0} duration={2.5} separator="," decimals={2} />
                {suffix && <span>{suffix}</span>}
            </p>
            <p className={`text-sm mt-1 ${arrowColor}`}>{arrow} {change?.toFixed(2)}%</p>
        </Card>
    );
}
