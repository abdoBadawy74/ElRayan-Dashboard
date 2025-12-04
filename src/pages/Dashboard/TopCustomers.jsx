import { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    DatePicker,
    InputNumber,
    Button,
    Space,
    Table,
    Tag,
    message,
    Spin,
} from "antd";
import { Search } from "lucide-react";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function TopCustomers() {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [dates, setDates] = useState([]);
    const [limit, setLimit] = useState(10);

    // Default date = last 6 months → today
    useEffect(() => {
        const today = dayjs();
        const last6Months = dayjs().subtract(6, "month");
        const defaultRange = [last6Months, today];
        setDates(defaultRange);
        fetchData(defaultRange, limit);
    }, []);

    const fetchData = async (customDates, customLimit) => {
        const d = customDates || dates;
        const l = customLimit || limit;

        if (!d || d.length !== 2) {
            message.error("اختر التاريخ الأول والتاني");
            return;
        }

        const startDate = d[0].format("YYYY-MM-DD");
        const endDate = d[1].format("YYYY-MM-DD");

        try {
            setLoading(true);

            const res = await axios.get(
                "https://api.elrayan.acwad.tech/api/v1/orders/top-customer",
                {
                    params: { startDate, endDate, limit: l },
                }
            );

            setCustomers(res.data);
        } catch (e) {
            console.log(e);
            message.error("Error fetching top customers");
        }

        setLoading(false);
    };

    const columns = [
        { title: "Name", dataIndex: "fullName" },
        { title: "Email", dataIndex: "email" },
        { title: "Phone", dataIndex: "phoneNumber" },
        { title: "Order Count", dataIndex: "orderCount", },
        { title: "Total Spent", dataIndex: "totalSpent", },
        { title: "Average Order Value", dataIndex: "averageOrderValue", },
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
                            onChange={v => setDates(v)}
                            style={{ width: 250 }}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>Limit</div>
                        <InputNumber
                            min={1}
                            max={1000}
                            value={limit}
                            onChange={setLimit}
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

            {/* Customers Table */}
            <Card title="Top Customers">
                {
                    loading && (
                        <div style={{ textAlign: "center", marginTop: 50 }}>
                            <Spin size="large" />
                        </div>
                    )
                }
                {!loading && customers.length === 0 ? (
                    <Tag color="red">No customers found</Tag>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <Table
                            columns={columns}
                            dataSource={customers}
                            rowKey={(r) => r.userId}
                            pagination={{ pageSize: 10 }}
                        />
                    </div>
                )}
            </Card>

        </div>
    );
}
