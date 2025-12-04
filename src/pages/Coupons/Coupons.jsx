import { useEffect, useState } from "react";
import { FaEdit, FaChartBar, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
} from "recharts";
import { Modal, Input, Select, Checkbox, Button, DatePicker, InputNumber, Spin } from 'antd';
import AddCouponModal from "./AddCouponModal";
import EditCouponModal from "./EditCouponModal";


const API_URL =
    "https://api.elrayan.acwad.tech/api/v1/coupons?status=active&page=1&limit=10&sortOrder=DESC";

export default function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);

    // تعديل
    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState(null);

    // إضافة
    const [showAdd, setShowAdd] = useState(false);

    // API filters
    const [status, setStatus] = useState("active");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortOrder, setSortOrder] = useState("DESC");
    const [discountType, setDiscountType] = useState("");

    const token = localStorage.getItem("token");


    const buildAPIUrl = () => {
        let url = `https://api.elrayan.acwad.tech/api/v1/coupons?status=${status}&page=${page}&limit=${limit}&sortOrder=${sortOrder}`;
        if (discountType) url += `&discountType=${discountType}`;
        return url;
    };
    // Fetch coupons
    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch(buildAPIUrl(), {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCoupons(data.data.items || []);
        } catch (err) {
            toast.error("⚠️ Failed to load coupons!");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    // Handle analytics
    const handleAnalytics = async (id, code) => {
        try {
            const res = await fetch(
                `https://api.elrayan.acwad.tech/api/v1/coupons/${id}/analytics`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (data.success) {
                setAnalyticsData({ ...data.data, code });
                setShowAnalytics(true);
            } else {
                toast.error("⚠️ Failed to fetch analytics");
            }
        } catch (err) {
            toast.error("❌ Error fetching analytics");
        }
    };

    // Handle edit open
    const openEditModal = (coupon) => {
        setEditData(coupon);
        setShowEdit(true);
    };

    // Handle edit save (PATCH)
    const handleEditSave = async () => {
        const body = {
            code: editData.code || "",
            name: editData.name || { en: "Default name" },
            description: editData.description || { en: "Default description" },
            discountType: editData.discountType || "percentage",
            discountValue: editData.discountValue || 0,
            maxDiscountAmount: editData.maxDiscountAmount || 0,
            minOrderAmount: editData.minOrderAmount || 0,
            status: editData.status || "active",
            validFrom: editData.validFrom
                ? new Date(editData.validFrom).toISOString()
                : new Date().toISOString(),
            validTo: editData.validTo
                ? new Date(editData.validTo).toISOString()
                : new Date().toISOString(),
            usageLimit: editData.usageLimit || 0,
            usageLimitPerUser: editData.usageLimitPerUser || 0,
            applicableCategories: editData.applicableCategories || [],
            // applicableVendors: editData.applicableVendors || [],
            applicableProducts: editData.applicableProducts || [],
            excludedCategories: editData.excludedCategories || [],
            excludedProducts: editData.excludedProducts || [],
            applicableUserGroups: editData.applicableUserGroups || [],
            isStackable:
                editData.isStackable !== undefined ? editData.isStackable : true,
            createdBy: editData.createdBy || 0,
            splitValue: editData.splitValue || 0,
        };

        try {
            const res = await fetch(
                `https://api.elrayan.acwad.tech/api/v1/coupons/${editData.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                }
            );

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("✅ Coupon updated successfully");
                setShowEdit(false);
                fetchCoupons();
            } else {
                toast.error("⚠️ " + (data.message || "Failed to update coupon"));
                console.error("PATCH error:", data);
            }
        } catch (err) {
            toast.error("❌ Error updating coupon");
            console.error(err);
        }
    };

    // Handle add save (POST)
    const handleAddSave = async (couponData) => {
        const body = {
            ...couponData,
            validFrom: couponData.validFrom ? new Date(couponData.validFrom).toISOString() : new Date().toISOString(),
            validTo: couponData.validTo ? new Date(couponData.validTo).toISOString() : new Date().toISOString(),
        };


        try {
            const res = await fetch(
                `https://api.elrayan.acwad.tech/api/v1/coupons`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                }
            );

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("✅ Coupon added successfully");
                setShowAdd(false);
                fetchCoupons();
            } else {
                toast.error("⚠️ " + (data.message || "Failed to add coupon"));
                console.error("POST error:", data);
            }
        } catch (err) {
            toast.error("❌ Error adding coupon");
            console.error(err);
        }
    };

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <ToastContainer />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800">🎟️ Coupons</h1>
                <Button
                    onClick={() => setShowAdd(true)}
                    type="primary"
                    className="flex items-center gap-2 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    <FaPlus /> Add Coupon
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6 items-end">
                <div className="flex flex-col items-start ">
                    <span className="font-medium text-gray-700">Status</span>
                    <Select value={status} onChange={setStatus} style={{ width: 150 }}>
                        <Select.Option value="active">Active</Select.Option>
                        <Select.Option value="inactive">Inactive</Select.Option>
                    </Select>
                </div>
                <div className="flex flex-col items-start ">
                    <span className="font-medium text-gray-700">Page</span>
                    <InputNumber min={1} value={page} onChange={setPage} placeholder="Page" />

                </div>
                <div className="flex flex-col items-start ">
                    <span className="font-medium text-gray-700">Limit</span>
                    <InputNumber min={1} value={limit} onChange={setLimit} placeholder="Limit" />
                </div>

                <div className="flex flex-col items-start ">
                    <span className="font-medium text-gray-700">Sort Order</span>
                    <Select value={sortOrder} onChange={setSortOrder} style={{ width: 150 }}>
                        <Select.Option value="ASC">ASC</Select.Option>
                        <Select.Option value="DESC">DESC</Select.Option>
                    </Select>
                </div>
                <div className="flex flex-col items-start ">
                    <span className="font-medium text-gray-700">Discount Type</span>
                <Select value={discountType} onChange={setDiscountType} style={{ width: 180 }} placeholder="Discount Type" allowClear>
                    <Select.Option disabled value="">Coupon Type</Select.Option>
                    <Select.Option value="percentage">Percentage</Select.Option>
                    <Select.Option value="fixed_amount">Fixed Amount</Select.Option>
                    <Select.Option value="category_specific">Category Specific</Select.Option>
                    <Select.Option value="product_specific">Product Specific</Select.Option>
                    <Select.Option value="free_shipping">Free shipping</Select.Option>
                </Select>
                </div>

                <Button onClick={fetchCoupons} type="primary">Apply Filters</Button>
            </div>

            {loading ? (
               <div className="flex justify-center">
                 <Spin size="large" className="mx-auto mt-20" />
               </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className="bg-white rounded-2xl shadow-lg p-6 relative hover:shadow-2xl transition"
                        >
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                {coupon.code}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {coupon.discountType} - {coupon.discountValue}
                            </p>
                            <div className="flex gap-4 mt-4 text-gray-500">
                                <FaEdit
                                    className="cursor-pointer hover:text-blue-600"
                                    onClick={() => openEditModal(coupon)}
                                />
                                <FaChartBar
                                    className="cursor-pointer hover:text-green-600"
                                    onClick={() => handleAnalytics(coupon.id, coupon.code)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Add */}
            {showAdd && (
                <AddCouponModal
                    open={showAdd}
                    onCancel={() => setShowAdd(false)}
                    onSave={handleAddSave}
                    token={token}
                />
            )}

            {/* Modal Edit */}
            {showEdit && editData && (
                <EditCouponModal
                    open={showEdit}
                    editData={editData}
                    setEditData={setEditData}
                    onSave={handleEditSave}
                    onCancel={() => setShowEdit(false)}
                    token={token}
                />
            )}

            {/* Modal Analytics */}
            {showAnalytics && analyticsData && (
                <Modal
                    title={`📊 Analytics - ${analyticsData?.code}`}
                    open={showAnalytics && analyticsData}
                    onCancel={() => setShowAnalytics(false)}
                    footer={null}
                    width={800}
                >

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-blue-50 rounded-lg shadow text-center">
                            <p className="text-sm text-gray-600">Total Uses</p>
                            <p className="text-xl font-bold text-blue-700">
                                {analyticsData.analytics.totalUses}
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg shadow text-center">
                            <p className="text-sm text-gray-600">Total Discount</p>
                            <p className="text-xl font-bold text-green-700">
                                {analyticsData.analytics.totalDiscount}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg shadow text-center">
                            <p className="text-sm text-gray-600">Avg Order</p>
                            <p className="text-xl font-bold text-yellow-700">
                                {analyticsData.analytics.avgOrderTotal}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg shadow text-center">
                            <p className="text-sm text-gray-600">Unique Users</p>
                            <p className="text-xl font-bold text-purple-700">
                                {analyticsData.analytics.uniqueUsers}
                            </p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* PieChart */}
                        <div className="h-64">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={[
                                            {
                                                name: "Uses",
                                                value: analyticsData.analytics.totalUses,
                                            },
                                            {
                                                name: "Unique Users",
                                                value: analyticsData.analytics.uniqueUsers,
                                            },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label
                                    >
                                        {[
                                            analyticsData.analytics.totalUses,
                                            analyticsData.analytics.uniqueUsers,
                                        ].map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* BarChart */}
                        <div className="h-64">
                            <ResponsiveContainer>
                                <BarChart
                                    data={[
                                        {
                                            name: "Total Uses",
                                            value: analyticsData.analytics.totalUses,
                                        },
                                        {
                                            name: "Unique Users",
                                            value: analyticsData.analytics.uniqueUsers,
                                        },
                                        {
                                            name: "Total Discount",
                                            value: analyticsData.analytics.totalDiscount,
                                        },
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>



                </Modal>
            )
            }
        </div >
    );
}