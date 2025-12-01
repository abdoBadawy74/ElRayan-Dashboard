import { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { PulseLoader } from "react-spinners";
import { Card, DatePicker, Button, Row, Col } from "antd";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";

const { RangePicker } = DatePicker;

export default function OrdersTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/dashboard/orders/status-breakdown`,
                {
                    params: {
                        startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
                        endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
                    },
                }
            );
            setData(res.data);
        } catch (err) {
            console.error("Error fetching orders data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-bold mb-4">Orders Breakdown</h2>

            {/* Date Filter Section */}
            <Row gutter={16} className="mb-6">
                <Col>
                    <RangePicker
                        value={
                            startDate && endDate
                                ? [startDate, endDate]
                                : null
                        }
                        onChange={(values) => {
                            if (values) {
                                setStartDate(values[0]);
                                setEndDate(values[1]);
                            } else {
                                setStartDate(null);
                                setEndDate(null);
                            }
                        }}
                        placeholder={["Start Date", "End Date"]}
                    />
                </Col>
                <Col>
                    <Button type="primary" onClick={fetchData} loading={loading}>
                        Apply Filters
                    </Button>
                </Col>
            </Row>

            {/* Loading Spinner */}
            {loading && (
                <div className="flex justify-center py-10">
                    <PulseLoader color="#2563eb" />
                </div>
            )}

            {/* No Data */}
            {!loading && !data && (
                <p className="text-center text-gray-600">No data available.</p>
            )}

            {/* Data Display */}
            {!loading && data && (
                <>
                    {/* Summary Cards */}
                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <SummaryCard
                                title="Average Items per Order"
                                value={data.averageItemsPerOrder}
                                color="#2563eb"
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <SummaryCard
                                title="Completion Rate"
                                value={data.completionRate}
                                color="#10b981"
                                suffix="%"
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <SummaryCard
                                title="Cancellation Rate"
                                value={data.cancellationRate}
                                color="#ef4444"
                                suffix="%"
                            />
                        </Col>
                    </Row>

                    {/* Orders by Status */}
                    <Card title="Orders by Status" className="mt-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.ordersByStatus}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {data.ordersByStatus.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Orders by Payment Status */}
                    <Card title="Orders by Payment Status" className="mt-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.ordersByPaymentStatus}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="paymentStatus" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#3b82f6" name="Orders" />
                                <Bar dataKey="amount" fill="#10b981" name="Amount (EGP)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Orders by Payment Method */}
                    <Card title="Orders by Payment Method" className="mt-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.ordersByPaymentMethod}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="paymentMethod" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#6366f1" name="Orders" />
                                <Bar dataKey="amount" fill="#f59e0b" name="Amount (EGP)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}
        </div>
    );
}

function SummaryCard({ title, value, color, suffix = "" }) {
    return (
        <Card style={{ backgroundColor: color, color: "#fff" }}>
            <h4 className="text-sm uppercase opacity-80">{title}</h4>
            <p className="text-2xl font-bold mt-1">
                <CountUp
                    end={value || 0}
                    duration={2.5}
                    separator=","
                    decimals={2}
                />{" "}
                {suffix}
            </p>
        </Card>
    );
}
