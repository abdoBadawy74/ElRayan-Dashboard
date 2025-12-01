import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Row,
    Col,
    Card,
    Button,
    Modal,
    Input,
    Upload,
    Image,
    Space,
    message,
    Spin,
} from "antd";
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const API_URL = "https://api.maghni.acwad.tech/api/v1/public-category";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add/Edit Modal
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ en: "", ar: "", image: null });
    const [selectedId, setSelectedId] = useState(null);

    const token = localStorage.getItem("token");

    // Fetch categories
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setCategories(data.data || []);
        } catch (err) {
            toast.error("⚠️ Failed to load categories");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle Add/Edit submit
    const handleSave = async () => {
        if (!formData.en || !formData.ar || (!formData.image && !editMode)) {
            toast.error("Please fill all fields (EN, AR, and Icon)");
            return;
        }

        const body = new FormData();
        body.append("name[en]", formData.en);
        body.append("name[ar]", formData.ar);
        if (formData.image && typeof formData.image !== "string") {
            body.append("icon", formData.image);
        }

        try {
            const res = await fetch(editMode ? `${API_URL}/${selectedId}` : API_URL, {
                method: editMode ? "PATCH" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body,
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(editMode ? "✅ Category updated" : "✅ Category added");
                setShowModal(false);
                setFormData({ en: "", ar: "", image: null });
                fetchCategories();
            } else {
                toast.error("⚠️ " + (data.message || "Operation failed"));
            }
        } catch (err) {
            toast.error("❌ Error saving category");
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        Modal.confirm({
            title: "Are you sure you want to delete this category?",
            okText: "Yes",
            cancelText: "No",
            onOk: async () => {
                try {
                    const res = await fetch(`${API_URL}/${id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        toast.success("🗑️ Category deleted");
                        fetchCategories();
                    } else {
                        toast.error("⚠️ " + (data.message || "Failed to delete"));
                    }
                } catch (err) {
                    toast.error("❌ Error deleting category");
                }
            },
        });
    };

    // Handle Image Removal
    const removeSelectedImage = () => {
        setFormData({ ...formData, image: null });
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <ToastContainer />

            <Space style={{ marginBottom: 24, width: "100%" }} align="start">
                <h1 className="text-3xl font-extrabold text-gray-800">📂 Categories</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditMode(false);
                        setFormData({ en: "", ar: "", image: null });
                        setShowModal(true);
                    }}
                >
                    Add Category
                </Button>
            </Space>

            <Row gutter={[16, 16]}>
                {loading ? (
                    <Col span={24} style={{ textAlign: "center", padding: 50 }}>
                        <Spin size="large" />
                    </Col>
                ) : (
                    categories.map((cat) => (
                        <Col key={cat.id} xs={24} sm={12} md={8}>
                            <Card
                                hoverable
                                cover={
                                    <Image
                                        src={cat.icon}
                                        alt={cat.name}
                                        height={200}
                                        style={{ objectFit: "cover", margin: "0 auto", borderRadius: "50%", display: "block", width: "100%", }}
                                    />
                                }
                                actions={[
                                    <EditOutlined
                                        key="edit"
                                        onClick={() => {
                                            setEditMode(true);
                                            setSelectedId(cat.id);
                                            setFormData({ en: cat.name, ar: cat.name, image: cat.icon });
                                            setShowModal(true);
                                        }}
                                    />,
                                    <DeleteOutlined key="delete" onClick={() => handleDelete(cat.id)} />,
                                ]}
                            >
                                <Card.Meta
                                    title={cat.name}
                                    description={cat.name}
                                    style={{ textAlign: "center" }}
                                />
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            {/* Modal */}
            <Modal
                title={editMode ? "✏️ Edit Category" : "➕ Add Category"}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
                        {editMode ? "Save Changes" : "Add Category"}
                    </Button>,
                ]}
            >
                <Input
                    placeholder="Name (EN)"
                    value={formData.en}
                    onChange={(e) => setFormData({ ...formData, en: e.target.value })}
                    style={{ marginBottom: 12 }}
                />
                <Input
                    placeholder="Name (AR)"
                    value={formData.ar}
                    onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
                    style={{ marginBottom: 12 }}
                />

                <div style={{ marginBottom: 12 }}>
                    {formData.image && (
                        <div style={{ marginBottom: 8 }}>
                            <Image
                                src={
                                    typeof formData.image === "string"
                                        ? formData.image
                                        : URL.createObjectURL(formData.image)
                                }
                                alt="Preview"
                                width={120}
                                height={120}
                                style={{ objectFit: "cover", borderRadius: "50%" }}
                            />
                            {typeof formData.image !== "string" && (
                                <Button
                                    danger
                                    size="small"
                                    style={{ marginLeft: 8 }}
                                    onClick={removeSelectedImage}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    )}

                    <Upload
                        beforeUpload={(file) => {
                            setFormData({ ...formData, image: file });
                            return false;
                        }}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>Choose Image</Button>
                    </Upload>
                </div>
            </Modal>
        </div>
    );
}
