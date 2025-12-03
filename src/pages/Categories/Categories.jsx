import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Upload, Popconfirm, Spin, Tag, message } from "antd";
import { Plus, Edit3, Trash2, Upload as UploadIcon, Eye } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function Categories() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // main modal (add/edit)
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCat, setSelectedCat] = useState(null);

    // subcategories modal
    const [subOpen, setSubOpen] = useState(false);
    const [subList, setSubList] = useState([]);

    const [form] = Form.useForm();

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`,
        "lang": "en",
    };

    // ============================
    // Fetch categories
    // ============================
    const fetchCategories = async () => {
        try {
            const res = await axios.get("https://api.elrayan.acwad.tech/api/v1/category", { headers });
            setCategories(res.data.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ============================
    // Add modal
    // ============================
    const openAdd = () => {
        setEditMode(false);
        setSelectedCat(null);
        form.resetFields();
        setModalOpen(true);
    };

    // ============================
    // Edit modal
    // ============================
    const openEdit = async (catId) => {
        try {
            setEditMode(true);

            const res = await axios.get(`https://api.elrayan.acwad.tech/api/v1/category/${catId}`, { headers });
            const c = res.data.data;

            setSelectedCat(c);

            form.setFieldsValue({
                name_en: c.name.en,
                name_ar: c.name.ar,
            });

            setModalOpen(true);

        } catch (e) {
            console.log(e);
        }
    };

    // ============================
    // Show Subcategories
    // ============================
    const showSub = async (catId) => {
        try {
            const res = await axios.get(
                `https://api.elrayan.acwad.tech/api/v1/sub-categories?main_category=${catId}`,
                { headers }
            );

            const list = res.data.data;

            if (!list || list.length === 0) {
                toast.warning("No subcategories available");
                return; // ❌ متفتحش الموديل
            }

            setSubList(list);
            setSelectedCat(catId); // مهم
            setSubOpen(true);
        } catch (e) {
            console.log(e);
        }
    };


    // ============================
    // delete
    // ============================
    const deleteCat = async (id) => {
        try {
            await axios.delete(`https://api.elrayan.acwad.tech/api/v1/category/${id}`, { headers });
            fetchCategories();
        } catch (e) {
            console.log(e);
        }
    };

    // ============================
    // SUBMIT FORM (ADD + EDIT)
    // ============================
    const onSubmit = async (values) => {
        try {
            const fd = new FormData();
            fd.append("name[en]", values.name_en);
            fd.append("name[ar]", values.name_ar);

            // icon can be undefined, an Upload file object, or a raw File.
            let file;
            if (values && values.icon) {
                // Antd Upload file object usually has originFileObj
                if (values.icon.originFileObj) {
                    file = values.icon.originFileObj;
                } else if (values.icon.file && values.icon.file.originFileObj) {
                    file = values.icon.file.originFileObj;
                } else if (values.icon instanceof File) {
                    file = values.icon;
                } else {
                    // fallback: sometimes the value is already the file-like object
                    file = values.icon;
                }
            }

            if (file) {
                fd.append("icon", file);
            }

            console.log(fd.get("name[en]"));

            if (editMode) {
                await axios.patch(`https://api.elrayan.acwad.tech/api/v1/category/${selectedCat.id}`, fd, { headers });
            } else {
                await axios.post("https://api.elrayan.acwad.tech/api/v1/category", fd, { headers });
            }

            setModalOpen(false);
            fetchCategories();

        } catch (e) {
            console.log(e);
        }
    };
    // ============================
    // TABLE COLUMNS
    // ============================
    const columns = [
        {
            title: "Icon",
            dataIndex: "icon",
            render: (icon) => <img src={icon} width={45} height={45} style={{ borderRadius: 8 }} />
        },
        {
            title: "Name (EN)",
            dataIndex: "name",
            render: (n) => n.en
        },
        {
            title: "Name (AR)",
            dataIndex: "name",
            render: (n) => n.ar
        },
        {
            title: "Subcategories",
            dataIndex: "id",
            render: (catId) =>
                <Button size="small" icon={<Eye size={14} />} onClick={() => showSub(catId)}>
                    Manage
                </Button>
        }
        ,
        {
            title: "Actions",
            render: (_, row) => (
                <div style={{ display: "flex", gap: 10 }}>
                    <Button type="primary" icon={<Edit3 size={14} />} onClick={() => openEdit(row.id)}>
                        Edit
                    </Button>
                    <Popconfirm title="Delete this category?" onConfirm={() => deleteCat(row.id)}>
                        <Button danger icon={<Trash2 size={14} />}>Delete</Button>
                    </Popconfirm>
                </div>
            )
        }
    ];




    const [subForm] = Form.useForm();
    const [subEditMode, setSubEditMode] = useState(false);
    const [subModal, setSubModal] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);
    const openAddSub = () => {
        setSubEditMode(false);
        setSelectedSub(null);
        subForm.resetFields();
        setSubModal(true);
    };

    const openEditSub = (sub) => {
        setSubEditMode(true);
        setSelectedSub(sub);

        subForm.setFieldsValue({
            name_en: sub.name.en,
            name_ar: sub.name.ar,
        });

        setSubModal(true);
    };

    const submitSub = async (values) => {
        try {
            const fd = new FormData();
            fd.append("name[en]", values.name_en);
            fd.append("name[ar]", values.name_ar);
            fd.append("main_category_id", selectedCat);

            let file;
            if (values && values.icon) {
                // Antd Upload file object usually has originFileObj
                if (values.icon.originFileObj) {
                    file = values.icon.originFileObj;
                } else if (values.icon.file && values.icon.file.originFileObj) {
                    file = values.icon.file.originFileObj;
                } else if (values.icon instanceof File) {
                    file = values.icon;
                } else {
                    // fallback: sometimes the value is already the file-like object
                    file = values.icon;
                }
            }

            if (file) {
                fd.append("icon", file);
            }

            if (subEditMode) {
                await axios.patch(
                    `https://api.elrayan.acwad.tech/api/v1/sub-categories/${selectedSub.id}`,
                    fd,
                    { headers }
                );
            } else {
                await axios.post(
                    `https://api.elrayan.acwad.tech/api/v1/sub-categories`,
                    fd,
                    { headers }
                );
            }

            setSubModal(false);
            showSub(selectedCat);

        } catch (e) {
            console.log(e);
        }
    };

    const deleteSub = async (id) => {
        try {
            await axios.delete(
                `https://api.elrayan.acwad.tech/api/v1/sub-categories/${id}`,
                { headers }
            );
            showSub(selectedCat);
        } catch (e) {
            console.log(e);
        }
    };
    if (loading) return <div className="w-full h-[500px] flex justify-center items-center">
        <Spin size="large" />
    </div>

    return (
        <div style={{ padding: 20 }}>
            <ToastContainer theme="colored" />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h2>Categories</h2>
                <Button type="primary" icon={<Plus size={16} />} onClick={openAdd}>
                    Add Category
                </Button>
            </div>

            <Table columns={columns} dataSource={categories} rowKey="id" />

            {/* ======================
          ADD / EDIT MODAL
       ====================== */}
            <Modal
                title={editMode ? "Edit Category" : "Add Category"}
                open={modalOpen}
                onOk={() => form.submit()}
                onCancel={() => setModalOpen(false)}
            >
                <Form form={form} layout="vertical" onFinish={onSubmit}>
                    <Form.Item name="name_en" label="Name (EN)" rules={[{ required: true }]}>
                        <Input placeholder="name in English" />
                    </Form.Item>

                    <Form.Item name="name_ar" label="Name (AR)" rules={[{ required: true }]}>
                        <Input placeholder="name in Arabic" />
                    </Form.Item>

                    <Form.Item name="icon" label="Icon">
                        <Upload beforeUpload={() => false} maxCount={1} listType="picture"
                            onChange={({ fileList }) => {
                                if (fileList.length > 1) {
                                    fileList = fileList.slice(-1);
                                }
                                form.setFieldsValue({ icon: fileList[0] });
                            }}
                        >
                            <Button icon={<UploadIcon size={16} />}>Upload Icon</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            {/* ======================
          SUBCATEGORIES MODAL
       ====================== */}
            <Modal
                title="Manage Subcategories"
                open={subOpen}
                onCancel={() => setSubOpen(false)}
                footer={false}
                width={650}
            >
                <Button
                    type="primary"
                    icon={<Plus size={14} />}
                    onClick={openAddSub}
                    style={{ marginBottom: 15 }}
                >
                    Add Subcategory
                </Button>

                <Table
                    dataSource={subList}
                    rowKey="id"
                    columns={[
                        {
                            title: "Icon",
                            dataIndex: "icon",
                            render: (i) => <img src={i} width={40} style={{ borderRadius: 6 }} />
                        },
                        {
                            title: "EN",
                            dataIndex: "name",
                            render: n => n.en
                        },
                        {
                            title: "AR",
                            dataIndex: "name",
                            render: n => n.ar
                        },
                        {
                            title: "Actions",
                            render: (_, row) => (
                                <div style={{ display: "flex", gap: 8 }}>
                                    <Button size="small" onClick={() => openEditSub(row)} icon={<Edit3 size={13} />}>
                                        Edit
                                    </Button>
                                    <Popconfirm
                                        title="Delete this subcategory?"
                                        onConfirm={() => deleteSub(row.id)}
                                    >
                                        <Button danger size="small" icon={<Trash2 size={13} />}>Delete</Button>
                                    </Popconfirm>
                                </div>
                            )
                        }
                    ]}
                />
            </Modal>
            {/* ======================
          ADD / EDIT SUBCATEGORY MODAL
       ====================== */}
            <Modal
                title={subEditMode ? "Edit Subcategory" : "Add Subcategory"}
                open={subModal}
                onCancel={() => setSubModal(false)}
                onOk={() => subForm.submit()}
            >
                <Form layout="vertical" form={subForm} onFinish={submitSub}>
                    <Form.Item name="name_en" label="Name (EN)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="name_ar" label="Name (AR)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="icon" label="Icon (optional)">
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            listType="picture"
                            onChange={({ fileList }) => {
                                subForm.setFieldsValue({ icon: fileList[0] });
                            }}
                        >
                            <Button icon={<UploadIcon size={16} />}>Upload Icon</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
}
