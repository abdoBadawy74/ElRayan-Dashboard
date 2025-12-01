import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
    Table,
    Spin,
    Tag,
    Button,
    Popconfirm,
    Space,
} from "antd";
import {
    Lock,
    LockOpen,
    Trash2,
    Store,
    CheckCircle,
    XCircle
} from "lucide-react";

export default function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    // ------------ FETCH VENDORS ------------
    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                "https://api.maghni.acwad.tech/api/v1/vendor?page=1&limit=10&sortOrder=ASC",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await res.json();
            if (res.ok && data.success) {
                setVendors(data.data.items);
            } else {
                toast.error(data.message || "Failed to fetch vendors");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error while fetching vendors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    // ------------ DELETE ------------
    const deleteVendor = async (id) => {
        try {
            const res = await fetch(
                `https://api.maghni.acwad.tech/api/v1/vendor/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Vendor deleted successfully");
                fetchVendors();
            } else {
                toast.error(data.message || "Failed to delete vendor");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting vendor");
        }
    };

    // ------------ TOGGLE BLOCK ------------
    const toggleBlock = async (id) => {
        try {
            const res = await fetch(
                `https://api.maghni.acwad.tech/api/v1/vendor/${id}/toggle-block`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await res.json();
            if (res.ok) {
                toast.success("Vendor block status updated");
                fetchVendors();
            } else {
                toast.error(data.message || "Failed to toggle block");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error toggling block status");
        }
    };

    // ------------ TOGGLE STATUS ------------
    const toggleStatus = async (id) => {
        try {
            const res = await fetch(
                `https://api.maghni.acwad.tech/api/v1/vendor/${id}/toggle-status`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await res.json();
            if (res.ok) {
                toast.success("Vendor open/close status updated");
                fetchVendors();
            } else {
                toast.error(data.message || "Failed to toggle status");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error toggling status");
        }
    };

    // ------------ TABLE COLUMNS ------------
    const columns = [
        {
            title: "#",
            dataIndex: "index",
            render: (_, __, index) => index + 1,
            width: 60,
        },
        {
            title: "Logo",
            dataIndex: "logo",
            render: (logo) => (
                <img
                    src={logo}
                    alt="logo"
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            ),
        },
        {
            title: "Name",
            dataIndex: "name",
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: "Category",
            dataIndex: ["publicCategory", "name"],
            render: (text) => text || "—",
        },
        {
            title: "Country",
            dataIndex: ["country", "name"],
            render: (text) => text || "—",
        },
        {
            title: "Rate",
            dataIndex: "rate",
        },
        {
            title: "Orders",
            dataIndex: "orderCount",
        },
        {
            title: "Status",
            dataIndex: "isOpen",
            render: (isOpen) =>
                isOpen ? (
                    <Tag icon={<CheckCircle size={14} />} color="green" className="flex gap-1 items-center">
                        Open
                    </Tag>
                ) : (
                    <Tag icon={<XCircle size={14} />} color="red" className="flex gap-1 items-center">
                        Closed
                    </Tag>
                ),
        },
        {
            title: "Blocked",
            dataIndex: "isBlocked",
            render: (isBlocked) =>
                isBlocked ? (
                    <Tag icon={<Lock size={14} />} color="red" className="flex gap-1 items-center">
                        Blocked
                    </Tag>
                ) : (
                    <Tag icon={<LockOpen size={14} />} color="blue" className="flex gap-1 items-center">
                        Active
                    </Tag>
                ),
        },
        {
            title: "Actions",
            render: (_, vendor) => (
                <Space>
                    <Button
                        size="small"
                        type={vendor.isOpen ? "default" : "primary"}
                        onClick={() => toggleStatus(vendor.id)}
                    >
                        {vendor.isOpen ? "Close" : "Open"}
                    </Button>

                    <Button
                        size="small"
                        danger={!vendor.isBlocked}
                        onClick={() => toggleBlock(vendor.id)}
                    >
                        {vendor.isBlocked ? "Unblock" : "Block"}
                    </Button>

                    <Popconfirm
                        title="Delete vendor"
                        description="Are you sure you want to delete this vendor?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => deleteVendor(vendor.id)}
                    >
                        <Button danger size="small" icon={<Trash2 size={14} />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // ------------ UI ------------
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <ToastContainer />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Store size={30} /> Vendors
                </h1>

                <Link
                    to="/vendors/overview"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Go to Overview
                </Link>
            </div>

            <Spin spinning={loading} size="large">
                <Table
                    dataSource={vendors}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    className="bg-white p-4 rounded shadow overflow-x-auto"
                />
            </Spin>
        </div>
    );
}
