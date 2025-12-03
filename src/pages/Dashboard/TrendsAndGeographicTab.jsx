import { useState, useEffect } from "react";
import axios from "axios";
import { Card, Select, InputNumber, Button, Space, message } from "antd";
import { Search } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast, ToastContainer } from "react-toastify";

export default function Trends() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [type, setType] = useState("daily");
    const [limit, setLimit] = useState(30);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get("https://api.elrayan.acwad.tech/api/v1/orders/trends", {
                params: { type, limit }
            });
            const formatted = (res.data || []).map(d => ({
                date: new Date(d.date).toLocaleDateString(),
                revenue: d.revenue,
                orders: d.orders
            }));
            setData(formatted);
        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message || "Failed to load trends data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-5">
            <ToastContainer />
            {/* Filters */}
            <Card className="p-4">
                <Space wrap size="large">

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>Trend Type</div>
                        <Select
                            style={{ width: 180 }}
                            value={type}
                            onChange={setType}
                            options={[
                                { value: "daily", label: "Daily" },
                                { value: "weekly", label: "Weekly" },
                                { value: "monthly", label: "Monthly" },
                                // { value: "yearly", label: "Yearly" },
                            ]}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>Limit</div>
                        <InputNumber min={1} max={365} value={limit} onChange={v => setLimit(v)} />
                    </div>

                    <Button
                        type="primary"
                        icon={<Search size={16} />}
                        loading={loading}
                        onClick={fetchData}
                        style={{ marginTop: 20 }}
                    >
                        Apply
                    </Button>
                </Space>
            </Card>

            {/* Line Chart */}
            <Card title="Revenue & Orders Trends">
                {data.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#888" }}>No data available</div>
                ) : (
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
        </div>
    );
}
