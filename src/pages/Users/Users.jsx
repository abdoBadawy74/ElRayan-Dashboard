import { useEffect, useState } from "react";
import axios from "axios";
import {
    Table,
    Input,
    Button,
    Modal,
    Tag,
    Pagination,
    Spin,
    Card,
    Space,
    Avatar,
    message,
} from "antd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import {
    EyeOutlined,
    DeleteOutlined,
    StopOutlined,
    CheckOutlined,
} from "@ant-design/icons";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const token = localStorage.getItem("token");
    const baseHeaders = { Authorization: `Bearer ${token}` };

    const fetchUsers = async (opts = {}) => {
        setLoading(true);
        try {
            const p = opts.page ?? page;
            const l = opts.limit ?? limit;
            const kw = opts.keyword ?? keyword;

            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/user`,
                {
                    headers: baseHeaders,
                    params: {
                        keyword: kw || undefined,
                        page: p,
                        limit: l,
                        sortOrder: "ASC",
                    },
                }
            );

            const items = res.data?.data?.items || [];
            const totalPages = res.data?.data?.metadata?.totalPages || 1;

            setUsers(items);
            setTotalPages(totalPages);
        } catch (err) {
            console.error("fetchUsers error:", err);
            toast.error("❌ Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit]);

    const fetchUserDetails = async (id) => {
        try {
            const res = await axios.get(`https://api.maghni.acwad.tech/api/v1/user/${id}`, {
                headers: baseHeaders,
            });
            setSelectedUser(res.data.data);
            setModalOpen(true);
        } catch (err) {
            console.error("fetchUserDetails error:", err);
            toast.error("❌ Failed to fetch user details");
        }
    };

    const toggleBlock = async (id) => {
        try {
            const hide = message.loading("Processing...", 0);
            const res = await axios.patch(
                `https://api.maghni.acwad.tech/api/v1/user/${id}/toggle-block`,
                {},
                { headers: baseHeaders }
            );
            hide();

            // If response indicates success, update local users state immediately
            if (res.status === 200) {
                toast.success("🔄 " + (res.data?.message || "Status updated"));
                setUsers((prev) =>
                    prev.map((u) => {
                        if (u.id === id) {
                            // API toggles block — detect from response if provided, otherwise toggle based on current status
                            const newStatus =
                                res.data?.data?.status ?? (u.status === "blocked" ? "active" : "blocked");
                            return { ...u, status: newStatus };
                        }
                        return u;
                    })
                );
                // also refresh just in case to sync with server
                fetchUsers();
            } else {
                toast.error("Failed to toggle block");
            }
        } catch (err) {
            console.error("toggleBlock error:", err);
            toast.error("❌ Failed to toggle block status");
        }
    };

    const deleteUser = (id) => {
        Modal.confirm({
            title: "Confirm Deletion",
            content: "Are you sure you want to delete this user?",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    const res = await axios.delete(`https://api.maghni.acwad.tech/api/v1/user/${id}`, {
                        headers: baseHeaders,
                    });

                    if (res.status === 200 && (res.data?.success ?? true)) {
                        // remove locally for instant UX
                        setUsers((prev) => prev.filter((u) => u.id !== id));
                        toast.success("🗑️ User deleted successfully");
                        // sync from server
                        fetchUsers();
                    } else {
                        console.error("deleteUser response:", res.data);
                        toast.error(res.data?.message || "Failed to delete user");
                    }
                } catch (err) {
                    console.error("deleteUser error:", err);
                    toast.error("❌ Failed to delete user");
                }
            },
        });
    };

    const columns = [
        {
            title: "#",
            key: "index",
            render: (_, __, idx) => (page - 1) * limit + idx + 1,
            width: 60,
        },
        {
            title: "Full Name",
            dataIndex: "fullName",
            key: "fullName",
            render: (text, record) => (
                <Space>
                    <Avatar
                        src={record.profileImage || null}
                        alt={text}
                        size="small"
                        style={{ background: !record.profileImage ? "#87d068" : undefined }}
                    >
                        {!record.profileImage && (text ? text[0] : "?")}
                    </Avatar>
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role) => <Tag color="blue">{role}</Tag>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) =>
                status === "blocked" ? <Tag color="red">Blocked</Tag> : <Tag color="green">Active</Tag>,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, user) => (
                <Space wrap>
                    <Button icon={<EyeOutlined />} type="primary" onClick={() => fetchUserDetails(user.id)}>
                        View
                    </Button>

                    <Button
                        icon={user.status === "blocked" ? <CheckOutlined /> : <StopOutlined />}
                        type={user.status === "blocked" ? "default" : "dashed"}
                        danger={user.status !== "blocked"}
                        onClick={() => toggleBlock(user.id)}
                    >
                        {user.status === "blocked" ? "Unblock" : "Block"}
                    </Button>

                    <Button danger icon={<DeleteOutlined />} onClick={() => deleteUser(user.id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <ToastContainer position="top-right" autoClose={2000} />
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Users Management</h2>

            <Card className="mb-6">
                <Space wrap>
                    <Input
                        placeholder="Search user..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ width: 260 }}
                        onPressEnter={() => {
                            setPage(1);
                            fetchUsers({ page: 1, limit, keyword });
                        }}
                    />

                    <Button
                        type="primary"
                        onClick={() => {
                            setPage(1);
                            fetchUsers({ page: 1, limit, keyword });
                        }}
                    >
                        Search
                    </Button>

                    <Input
                        type="number"
                        min={1}
                        value={limit}
                        onChange={(e) => {
                            const val = Number(e.target.value) || 1;
                            setLimit(val);
                            setPage(1);
                        }}
                        style={{ width: 110 }}
                        addonBefore="Limit"
                    />

                    <Link to="/users/growth-trend">
                        <Button type="primary" style={{ background: "green" }}>
                            View Growth Trend
                        </Button>
                    </Link>
                </Space>
            </Card>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    pagination={false}
                    bordered
                    className="overflow-x-auto"
                />
            )}

            <div className="mt-6 flex justify-center">
                <Pagination
                    current={page}
                    total={totalPages * limit}
                    pageSize={limit}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                />
            </div>

            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                title="User Details"
                width={700}
            >
                {selectedUser ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={selectedUser.profileImage || null}
                                size={80}
                                alt={selectedUser.fullName}
                            >
                                {!selectedUser.profileImage && (selectedUser.fullName ? selectedUser.fullName[0] : "?")}
                            </Avatar>

                            <div>
                                <h3 style={{ fontSize: 18, margin: 0 }}>{selectedUser.fullName}</h3>
                                <div style={{ color: "#666" }}>{selectedUser.email}</div>
                                <div style={{ color: "#999", fontSize: 12 }}>Role: {selectedUser.role}</div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div><b>Phone:</b> {selectedUser.phoneNumber || "—"}</div>
                            <div><b>Gender:</b> {selectedUser.gender || "—"}</div>
                            <div><b>Status:</b> {selectedUser.status}</div>
                            <div><b>Email Verified:</b> {selectedUser.isEmailVerified ? "Yes" : "No"}</div>
                            <div><b>Created:</b> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "—"}</div>
                            <div><b>Last Login:</b> {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : "N/A"}</div>
                        </div>

                        {selectedUser.vendor && (
                            <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
                                <h4 style={{ marginBottom: 8 }}>Vendor Details</h4>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <Avatar
                                        src={selectedUser.vendor.logo || null}
                                        size={64}
                                        alt={selectedUser.vendor.name}
                                    />
                                    <div>
                                        <div><b>Name:</b> {selectedUser.vendor.name}</div>
                                        <div><b>Country:</b> {selectedUser.vendor.country?.name || "—"}</div>
                                        <div><b>Category:</b> {selectedUser.vendor.publicCategory?.name?.ar || "—"}</div>
                                        <div><b>Delivery Fee:</b> {selectedUser.vendor.deliveryFee ?? "—"} EGP</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Spin />
                )}
            </Modal>
        </div>
    );
}
