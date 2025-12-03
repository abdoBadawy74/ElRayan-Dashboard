import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    Row, Col, Card, Spin, Table, Space, Badge, Progress, Tag, message
} from "antd";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, CartesianGrid
} from "recharts";
import { BarChart as BarIcon, PieChart as PieIcon, DollarSign, Users, Package, ShoppingCart } from "lucide-react";

const API = "https://api.elrayan.acwad.tech/api/v1/orders/dashboard";
const COLORS = ["#4CAF50", "#FF9800", "#2196F3", "#F44336", "#9C27B0", "#00BCD4"];
const OVERVIEW_COLORS = ["#e3f2fd", "#fff3e0", "#e8f5e9", "#fce4ec", "#e0f7fa"]; // ألوان للكاردز الأولية

const OrdersTab = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, "Accept-Language": "en" };

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(API, { headers });
                if (mounted) setData(res.data);
            } catch (e) {
                console.error(e);
                message.error("Failed to load orders dashboard");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        return () => { mounted = false; };
    }, []);

    const StatCard = ({ title, value, prefix, color = "#fff", formatter }) => {
        const [displayValue, setDisplayValue] = useState(0);

        useEffect(() => {
            let start = 0;
            const end = value || 0;
            if (start === end) return;
            let duration = 1000;
            let increment = end / (duration / 16);
            const counter = setInterval(() => {
                start += increment;
                if (start >= end) {
                    start = end;
                    clearInterval(counter);
                }
                setDisplayValue(start);
            }, 16);
            return () => clearInterval(counter);
        }, [value]);

        return (
            <Card style={{
                height: 120,
                borderRadius: 12,
                background: color,
                boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
            }}>
                <div style={{ fontSize: 13, color: "#666" }}>{title}</div>
                <div style={{ fontSize: 24, fontWeight: "700", marginTop: 6 }}>
                    {formatter ? formatter(displayValue) : Math.round(displayValue)}
                </div>
                {prefix && <div style={{ marginTop: 4 }}>{prefix}</div>}
            </Card>
        );
    };

    const overviewCards = useMemo(() => {
        if (!data) return [];
        const o = data.overview;
        return [
            { title: "Total Revenue", value: o.totalRevenue, prefix: <DollarSign size={18} />, color: OVERVIEW_COLORS[0] },
            { title: "Total Orders", value: o.totalOrders, prefix: <ShoppingCart size={18} />, color: OVERVIEW_COLORS[1] },
            { title: "Total Products", value: o.totalProducts, prefix: <Package size={18} />, color: OVERVIEW_COLORS[2] },
            { title: "Total Customers", value: o.totalCustomers, prefix: <Users size={18} />, color: OVERVIEW_COLORS[3] },
            { title: "Completion Rate", value: o.completionRate, prefix: "%", color: OVERVIEW_COLORS[4], formatter: v => `${v.toFixed(1)}%` },
        ];
    }, [data]);

    const dailyTrend = useMemo(() => (data?.trends?.dailyRevenue || []).map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        revenue: d.revenue,
        orders: d.orders
    })), [data]);

    const weeklyTrend = useMemo(() => (data?.trends?.weeklyRevenue || []).map(d => ({
        week: new Date(d.week).toLocaleDateString(),
        revenue: d.revenue,
        orders: d.orders
    })), [data]);

    const monthlyTrend = useMemo(() => (data?.trends?.monthlyRevenue || []).map(d => ({
        month: new Date(d.month).toLocaleString(undefined, { month: "short", year: "numeric" }),
        revenue: d.revenue,
        orders: d.orders
    })), [data]);

    const ordersByStatus = data?.orderStats?.ordersByStatus || [];
    const ordersByPayment = data?.orderStats?.ordersByPaymentStatus || [];
    const paymentMethods = data?.orderStats?.ordersByPaymentMethod || [];

    const productColumns = [
        { title: "Product", dataIndex: "name", key: "name", render: (t, r) => (<Space><img src={r.Image?.startsWith("/") ? `https://api.elrayan.acwad.tech${r.Image}` : r.Image} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />{t}</Space>) },
        { title: "Category", dataIndex: "mainCategoryName", key: "mainCategoryName" },
        { title: "Sold", dataIndex: "totalSold", key: "totalSold" },
        { title: "Revenue", dataIndex: "revenue", key: "revenue", render: v => `Egp${v}` },
        { title: "Avg Price", dataIndex: "averagePrice", key: "averagePrice", render: v => `Egp${v}` },
    ];

    const lowStockColumns = [
        { title: "Product", dataIndex: "name", key: "name" },
        { title: "Stock", dataIndex: "currentStock", key: "currentStock" },
        { title: "Sold", dataIndex: "sold", key: "sold" },
        { title: "Recommended", dataIndex: "isRecommended", key: "isRecommended", render: v => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
    ];

    const customerColumns = [
        { title: "Customer", dataIndex: "fullName", key: "fullName" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Orders", dataIndex: "orderCount", key: "orderCount" },
        { title: "Total Spent", dataIndex: "totalSpent", key: "totalSpent", render: v => `Egp${Number(v).toFixed(2)}` },
        { title: "Avg Order", dataIndex: "averageOrderValue", key: "averageOrderValue", render: v => `Egp${Number(v).toFixed(2)}` },
    ];

    if (loading || !data) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spin size="large" /></div>;

    return (
        <div className="space-y-6">
            <Row gutter={[16, 16]}>
                {overviewCards.map((c, idx) => (
                    <Col xs={24} sm={12} md={6} lg={4} key={c.title}>
                        <StatCard {...c} formatter={v => Math.round(v)} />
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                <Col xs={24} lg={16}>
                    {/* Revenue Trends */}
                    <Card title={<Space><BarIcon size={16} />Revenue Trends</Space>} style={{ marginBottom: 16 }}>
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" dot={{ r: 3 }} name="Revenue" />
                                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" dot={{ r: 3 }} name="Orders" yAxisId={1} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Weekly / Monthly Revenue">
                        <Row gutter={[12, 12]}>
                            <Col xs={24} md={12}>
                                <div style={{ height: 220 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="week" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                                            <Bar dataKey="orders" name="Orders" fill="#82ca9d" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div style={{ height: 220 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="revenue" name="Revenue" fill="#ff7f50" />
                                            <Bar dataKey="orders" name="Orders" fill="#ffd54f" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Top Selling Products" style={{ marginTop: 16 }}>
                        <Table
                            columns={productColumns}
                            dataSource={data.productStats?.topSellingProducts}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>

                    <Card title="Top Customers" style={{ marginTop: 16 }}>
                        <Table
                            columns={customerColumns}
                            dataSource={data?.topCustomers}
                            rowKey="id"
                            pagination={false}
                            className="overflow-x-auto"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    {/* Right column */}
                    <Card title={<Space><PieIcon size={16} />Orders by Status</Space>} style={{ marginBottom: 16 }}>
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} label>
                                        {ordersByStatus.map((entry, idx) => <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ marginTop: 8 }}>
                                {ordersByStatus.map((s, i) => (
                                    <div key={s.status} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                                        <div><Badge color={COLORS[i % COLORS.length]} /> {s.status}</div>
                                        <div>{s.count} ({(s.percentage || 0).toFixed(1)}%)</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card title="Payment Status" style={{ marginBottom: 16 }}>
                        <div>
                            {ordersByPayment.map((p, i) => (
                                <div key={p.status} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                                    <div>{p.status}</div>
                                    <div>{p.count} ({(p.percentage || 0).toFixed(1)}%)</div>
                                </div>
                            ))}
                            <div style={{ height: 150, marginTop: 8 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={paymentMethods} dataKey="count" nameKey="method" cx="50%" cy="50%" outerRadius={50} label>
                                            {paymentMethods.map((_, idx) => <Cell key={`pm-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>

                    <Card title="Recent Stats">
                        <div style={{ display: "grid", gap: 8 }}>
                            {Object.entries(data.recentStats).map(([key, value]) => (
                                <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                                    <div><b>{typeof value === "number" && key.toLowerCase().includes("revenue") ? `EGP${value}` : value}</b></div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Low Stock Products" style={{ marginTop: 16 }}>
                        <Table
                            columns={lowStockColumns}
                            dataSource={data.productStats?.lowStockProducts}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>


                </Col>
            </Row>

        </div>

    );
};

export default OrdersTab;
