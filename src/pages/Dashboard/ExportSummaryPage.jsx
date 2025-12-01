// src/pages/DashboardReports.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PulseLoader } from "react-spinners";
import CountUp from "react-countup";
import { Card, DatePicker, Table, Row, Col, Spin } from "antd";
// import moment from "moment";
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

export default function DashboardReports() {
  const token = localStorage.getItem("token");
  const [dateRange, setDateRange] = useState([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState(null);
  const [addons, setAddons] = useState([]);
  const [customers, setCustomers] = useState([]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#9932CC"];

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
        endDate: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
      };
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [summaryRes, paymentsRes, addonsRes, customersRes] = await Promise.all([
        axios.get("https://api.maghni.acwad.tech/api/v1/dashboard/export/summary", { params, headers }),
        axios.get("https://api.maghni.acwad.tech/api/v1/dashboard/payments/analytics", { params, headers }),
        axios.get("https://api.maghni.acwad.tech/api/v1/dashboard/addons/stats", { params, headers }),
        axios.get("https://api.maghni.acwad.tech/api/v1/dashboard/customers/lifetime-value", { params, headers }),
      ]);

      setSummary(summaryRes.data);
      setPayments(paymentsRes.data);
      setAddons(addonsRes.data);
      setCustomers(customersRes.data);
      toast.success("Dashboard data loaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Columns for Antd Tables
  const topProductsColumns = [
    { title: "Product", dataIndex: "productName", key: "productName" },
    { title: "Sold", dataIndex: "totalSold", key: "totalSold" },
    { title: "Revenue", dataIndex: "revenue", key: "revenue", render: (val) => `${val} EGP` },
  ];

  const topVendorsColumns = [
    { title: "Vendor", dataIndex: "vendorName", key: "vendorName" },
    { title: "Orders", dataIndex: "orderCount", key: "orderCount" },
    { title: "Revenue", dataIndex: "revenue", key: "revenue", render: (val) => `${val} EGP` },
  ];

  const topCustomersColumns = [
    { title: "Customer", dataIndex: "name", key: "name" },
    { title: "Orders", dataIndex: "orderCount", key: "orderCount" },
    { title: "Spent", dataIndex: "totalSpent", key: "totalSpent", render: (val) => `${val} EGP` },
  ];

  const addonsColumns = [
    { title: "Addon", dataIndex: ["addonName", "en"], key: "addonName" },
    { title: "Used", dataIndex: "usageCount", key: "usageCount" },
    { title: "Revenue", dataIndex: "totalRevenue", key: "totalRevenue", render: (val) => `${val} EGP` },
    { title: "Avg Price", dataIndex: "averagePrice", key: "averagePrice", render: (val) => `${val} EGP` },
  ];

  const customersColumns = [
    { title: "Customer", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Orders", dataIndex: "orderCount", key: "orderCount" },
    { title: "Lifetime Value", dataIndex: "lifetimeValue", key: "lifetimeValue", render: (val) => `${val} EGP` },
    { title: "Avg Order Value", dataIndex: "averageOrderValue", key: "averageOrderValue", render: (val) => `${val} EGP` },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      <Row justify="space-between" className="mb-6">
        <Col>
          <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Reports</h1>
        </Col>
        <Col>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            onOk={fetchAll}
          />
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        {summary?.summary && (
          <>
            <Col xs={24} sm={12} lg={4}>
              <AntdStatCard title="Total Revenue" value={summary.summary.totalRevenue} color="#10b981" suffix="EGP" />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <AntdStatCard title="Total Orders" value={summary.summary.totalOrders} color="#2563eb" />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <AntdStatCard title="Total Users" value={summary.summary.totalUsers} color="#4f46e5" />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <AntdStatCard title="Total Vendors" value={summary.summary.totalVendors} color="#ec4899" />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <AntdStatCard title="Total Products" value={summary.summary.totalProducts} color="#facc15" />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <AntdStatCard title="Avg Order Value" value={summary.summary.averageOrderValue} color="#8b5cf6" suffix="EGP" decimals={2} />
            </Col>
          </>
        )}
      </Row>

      {/* Top Performers Tables */}
      <Row gutter={[16, 16]} className="mb-8">
        {summary?.topPerformers && (
          <>
            <Col xs={24} lg={8}>
              <Card title="Top Products">
                <Table
                  dataSource={summary.topPerformers.topProducts.map((p, i) => ({
                    key: i,
                    productName: JSON.parse(p.productName).en,
                    totalSold: p.totalSold,
                    revenue: p.revenue,
                  }))}
                  columns={topProductsColumns}
                  pagination={false}
                  className="overflow-x-auto"
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Top Vendors">
                <Table
                  dataSource={summary.topPerformers.topVendors.map((v, i) => ({ key: i, ...v }))}
                  columns={topVendorsColumns}
                  pagination={false}
                  className="overflow-x-auto"
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Top Customers">
                <Table
                  dataSource={summary.topPerformers.topCustomers.map((c, i) => ({ key: i, ...c }))}
                  columns={topCustomersColumns}
                  pagination={false}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Payment Analytics */}
      {payments && (
        <Card title="Payment Analytics" className="mb-8">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <h3 className="font-medium mb-2">Payment Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={payments.paymentMethodDistribution}
                    dataKey="totalAmount"
                    nameKey="paymentMethod"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {payments.paymentMethodDistribution.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
            <Col xs={24} md={12}>
              <h3 className="font-medium mb-2">Failed Payments Summary</h3>
              <p>Count: {payments.failedPayments.count}</p>
              <p>Lost Revenue: {payments.failedPayments.lostRevenue} EGP</p>
              <p>Avg Processing Time: {payments.averageProcessingTime}s</p>
            </Col>
          </Row>
        </Card>
      )}

      {/* Addons Stats */}
      {addons && addons.length > 0 && (
        <Card title="Addons Stats" className="mb-8">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Table
                dataSource={addons.map((a, i) => ({ key: i, ...a }))}
                columns={addonsColumns}
                pagination={false}
                className="overflow-x-auto"
              />
            </Col>
            <Col xs={24} lg={12}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={addons}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={["addonName", "en"]} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#8884d8" name="Revenue (EGP)" />
                  <Bar dataKey="usageCount" fill="#82ca9d" name="Usage Count" />
                </BarChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        </Card>
      )}

      {/* Customers Lifetime Value */}
      {customers && customers.length > 0 && (
        <Card title="Customers Lifetime Value" className="mb-8">
          <Table dataSource={customers.map((c, i) => ({ key: i, ...c }))} columns={customersColumns} pagination={false} className="overflow-x-auto" />
        </Card>
      )}
    </div>
  );
}

// ---------- Antd Stat Card ----------
function AntdStatCard({ title, value, color = "#2563eb", suffix = "", decimals = 0 }) {
  return (
    <Card
      bordered={false}
      style={{ backgroundColor: color, color: "#fff", borderRadius: 12, textAlign: "center" }}
    >
      <div className="text-sm opacity-90">{title}</div>
      <div className="text-2xl font-bold mt-2">
        <CountUp end={Number(value) || 0} duration={1.5} separator="," decimals={decimals} />
        {suffix && <span className="ml-1 text-sm">{suffix}</span>}
      </div>
    </Card>
  );
}
