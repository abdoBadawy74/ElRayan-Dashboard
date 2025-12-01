import { useState, useEffect } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { Card, DatePicker, Button, Row, Col, Spin } from "antd";
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

export default function ProductsTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/dashboard/products/performance`,
                {
                    params: {
                        startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
                        endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
                    },
                }
            );
            setData(res.data);
        } catch (err) {
            console.error("Error fetching products data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-bold mb-4">Products Performance</h2>

            {/* Date Filter Section */}
            <Row gutter={8} align="middle" className="mb-6">
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
                    <Spin size="large" />
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
                        <Col xs={24} sm={12}>
                            <SummaryCard
                                title="Total Products"
                                value={data.totalProducts}
                                color="#2563eb"
                                suffix=""
                            />
                        </Col>
                        <Col xs={24} sm={12}>
                            <SummaryCard
                                title="Average Product Price"
                                value={data.averageProductPrice}
                                color="#10b981"
                                suffix=" EGP"
                            />
                        </Col>
                    </Row>

                    {/* Top Selling Products */}
                    <Card title="Top Selling Products" className="mt-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.topSellingProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="productName"
                                    tickFormatter={(name) => {
                                        try {
                                            return JSON.parse(name).ar;
                                        } catch {
                                            return name;
                                        }
                                    }}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) =>
                                        name === "totalRevenue"
                                            ? [`${value} EGP`, "Revenue"]
                                            : [value, "Sold"]
                                    }
                                    labelFormatter={(label) => {
                                        try {
                                            return JSON.parse(label).ar;
                                        } catch {
                                            return label;
                                        }
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="totalSold"
                                    fill="#3b82f6"
                                    name="Total Sold"
                                />
                                <Bar
                                    dataKey="totalRevenue"
                                    fill="#10b981"
                                    name="Total Revenue (EGP)"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Products by Category */}
                    <Card title="Products by Category" className="mt-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.productsByCategory}
                                    dataKey="count"
                                    nameKey="categoryName"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={(entry) => {
                                        try {
                                            return JSON.parse(entry.categoryName).ar;
                                        } catch {
                                            return entry.categoryName;
                                        }
                                    }}
                                >
                                    {data.productsByCategory.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value}`, "Products"]}
                                    labelFormatter={(label) => {
                                        try {
                                            return JSON.parse(label).ar;
                                        } catch {
                                            return label;
                                        }
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}
        </div>
    );
}

function SummaryCard({ title, value, color, suffix }) {
    return (
        <Card style={{ backgroundColor: color, color: "#fff" }}>
            <h4 className="text-sm uppercase opacity-80">{title}</h4>
            <p className="text-2xl font-bold mt-1">
                <CountUp end={value || 0} duration={2.5} separator="," decimals={2} />{" "}
                {suffix}
            </p>
        </Card>
    );
}
