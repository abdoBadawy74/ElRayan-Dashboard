import { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    DatePicker,
    Select,
    Button,
    Space,
    Table,
    Tag,
    message,
    Spin,
} from "antd";
import { Search } from "lucide-react";
import dayjs from "dayjs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

const { RangePicker } = DatePicker;

export default function SalesReport() {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [dates, setDates] = useState([]);
    const [type, setType] = useState("");

    // Default date = last month → today
    useEffect(() => {
        const today = dayjs();
        const lastMonth = dayjs().subtract(1, "month");
        const defaultRange = [lastMonth, today];
        setDates(defaultRange);
        fetchData(defaultRange, "");
    }, []);

    const fetchData = async (customDates, customType) => {
        const d = customDates || dates;
        const t = customType ?? type;

        if (!d || d.length !== 2) {
            message.error("اختر التاريخ الأول والتاني يا باشا");
            return;
        }

        let startDate = d[0].format("YYYY-MM-DD");
        let endDate = d[1].format("YYYY-MM-DD");

        try {
            setLoading(true);

            const res = await axios.get(
                "https://api.elrayan.acwad.tech/api/v1/orders/sales-report",
                { params: { startDate, endDate, type: t } }
            );

            setReport(res.data);
        } catch (e) {
            console.log(e);
            message.error("Error fetching sales report");
        }

        setLoading(false);
    };

    const topProductsColumns = [
        { title: "Product", dataIndex: "name" },
        {
            title: "Sold",
            dataIndex: "quantitySold",
            sorter: (a, b) => a.quantitySold - b.quantitySold,
        },
        {
            title: "Revenue",
            dataIndex: "revenue",
            sorter: (a, b) => a.revenue - b.revenue,
        },
        {
            title: "Average Price",
            dataIndex: "averagePrice",
            sorter: (a, b) => a.averagePrice - b.averagePrice,
        }
    ];

    return (
        <div className="space-y-5 p-2">

            {/* Filters */}
            <Card className="p-4">
                <Space wrap size="large">

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>Date Range</div>
                        <RangePicker
                            format="DD-MM-YYYY"
                            value={dates}
                            onChange={(v) => setDates(v)}
                            style={{ width: 250 }}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>Report Type</div>
                        <Select
                            style={{ width: 180 }}
                            value={type || undefined}
                            onChange={setType}
                            placeholder="Select type"
                            options={[
                                { value: "daily", label: "Daily" },
                                { value: "weekly", label: "Weekly" },
                                { value: "monthly", label: "Monthly" },
                                { value: "yearly", label: "Yearly" },
                            ]}
                        />
                    </div>

                    <Button
                        type="primary"
                        icon={<Search size={16} />}
                        loading={loading}
                        onClick={() => fetchData()}
                        style={{ marginTop: 20 }}
                    >
                        Apply
                    </Button>

                </Space>
            </Card>

            {!report ? null : (
                <>
                    {loading ? (
                        <div style={{ textAlign: "center", marginTop: 50 }}>
                            <Spin size="large" />
                        </div>
                    ) : null}
                    {/* Revenue Trend Chart */}
                    {report.trends && report.trends.length > 0 && (
                        <Card title="Revenue Trend">
                            <div style={{ width: "100%", height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={report.trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(v) => dayjs(v).format("DD/MM")}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(v) => dayjs(v).format("DD/MM/YYYY")}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    )}

                    {/* Charts Row */}
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <Card title="Revenue vs Orders" style={{ flex: 1, minWidth: 250 }}>
                            <div style={{ width: "100%", height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[
                                            { name: "Revenue", value: report.summary.totalRevenue },
                                            { name: "Orders", value: report.summary.totalOrders },
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card title="Discounts Given" style={{ flex: 1, minWidth: 250 }}>
                            <div style={{ width: "100%", height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[{ name: "Total Discount", value: report.summary.totalDiscountGiven }]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card title="Shipping Revenue" style={{ flex: 1, minWidth: 250 }}>
                            <div style={{ width: "100%", height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[{ name: "Shipping", value: report.summary.totalShippingRevenue }]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>



                    {/* Summary */}
                    <Card title="Summary">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                            <Card><b>Total Revenue</b><div className="text-xl font-bold">{report.summary.totalRevenue}</div></Card>

                            <Card><b>Total Orders</b><div className="text-xl font-bold">{report.summary.totalOrders}</div></Card>

                            <Card><b>Average Order Value</b><div className="text-xl font-bold">{report.summary.averageOrderValue}</div></Card>

                            <Card><b>Total Items Sold</b><div className="text-xl font-bold">{report.summary.totalItemsSold}</div></Card>

                            <Card><b>Total Discount Given</b><div className="text-xl font-bold">{report.summary.totalDiscountGiven}</div></Card>

                            <Card><b>Total Shipping Revenue</b><div className="text-xl font-bold">{report.summary.totalShippingRevenue}</div></Card>

                        </div>
                    </Card>

                    {/* Breakdown */}
                    <Card title="Breakdown">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                            <Card><b>Completed Orders</b><div className="text-xl">{report.breakdown.completedOrders}</div></Card>

                            <Card><b>Pending Orders</b><div className="text-xl">{report.breakdown.pendingOrders}</div></Card>

                            <Card><b>Cancelled Orders</b><div className="text-xl">{report.breakdown.cancelledOrders}</div></Card>

                            <Card><b>Refunded Orders</b><div className="text-xl">{report.breakdown.refundedOrders}</div></Card>

                            <Card>
                                <b>Completion Rate</b>
                                <div className="text-xl">
                                    {report.breakdown.completionRate !== undefined
                                        ? Number(report.breakdown.completionRate).toFixed(2)
                                        : "0.00"}%
                                </div>
                            </Card>

                            <Card>
                                <b>Cancellation Rate</b>
                                <div className="text-xl">
                                    {report.breakdown.cancellationRate !== undefined
                                        ? Number(report.breakdown.cancellationRate).toFixed(2)
                                        : "0.00"}%
                                </div>
                            </Card>

                        </div>
                    </Card>

                    {/* Customer Insights */}
                    <Card title="Customer Insights">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                            <Card><b>Unique Customers</b><div className="text-xl">{report.customerInsights.uniqueCustomers}</div></Card>

                            <Card><b>Returning Customers</b><div className="text-xl">{report.customerInsights.returningCustomers}</div></Card>

                            <Card><b>Avg Orders Per Customer</b><div className="text-xl">{report.customerInsights.averageOrdersPerCustomer}</div></Card>

                        </div>
                    </Card>

                    {/* Top Products */}
                    <Card title="Top Products">
                        {(!report.topProducts || report.topProducts.length === 0) ? (
                            <Tag color="red">No top products found</Tag>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <Table
                                    columns={topProductsColumns}
                                    dataSource={report.topProducts}
                                    rowKey={(r) => r.id}
                                    pagination={false}
                                />
                            </div>
                        )}
                    </Card>

                </>
            )}
        </div>
    );
}
