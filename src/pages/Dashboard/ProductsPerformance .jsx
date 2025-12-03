import { useState, useEffect } from "react";
import axios from "axios";
import { Card, InputNumber, Button, Table, Space, message } from "antd";
import { Search } from "lucide-react";

export default function TopProducts() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [limit, setLimit] = useState(20);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                "https://api.elrayan.acwad.tech/api/v1/orders/top-products",
                { params: { limit } }
            );
            setProducts(res.data);
        } catch (e) {
            console.error(e);
            message.error("Failed to load top products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: "Product",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space>
                    <img
                        src={record.Image?.startsWith("/") ? `https://api.elrayan.acwad.tech${record.Image}` : record.Image}
                        alt=""
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
                    />
                    {text}
                </Space>
            )
        },
        { title: "Main Category", dataIndex: "mainCategoryName", key: "mainCategoryName" },
        { title: "Sub Category", dataIndex: "subCategoryName", key: "subCategoryName" },
        { title: "Total Sold", dataIndex: "totalSold", key: "totalSold", sorter: (a, b) => a.totalSold - b.totalSold },
        { title: "Revenue", dataIndex: "revenue", key: "revenue", sorter: (a, b) => a.revenue - b.revenue, render: v => `$${v}` },
        { title: "Average Price", dataIndex: "averagePrice", key: "averagePrice", render: v => `$${v}` },
    ];

    return (
        <div className="space-y-5">
            {/* Filters */}
            <Card className="p-4">
                <Space wrap size="large">
                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>Limit</div>
                        <InputNumber min={1} max={100} value={limit} onChange={v => setLimit(v)} />
                    </div>

                    <Button
                        type="primary"
                        icon={<Search size={16} />}
                        onClick={fetchData}
                        loading={loading}
                        style={{ marginTop: 20 }}
                    >
                        Apply
                    </Button>
                </Space>
            </Card>

            {/* Table */}
            <Card title="Top Products">
                <div style={{ overflowX: "auto" }}>
                    <Table
                        columns={columns}
                        dataSource={products}
                        rowKey={r => r.id}
                        pagination={{ pageSize: 10 }}
                        loading={loading}
                    />
                </div>
            </Card>
        </div>
    );
}
