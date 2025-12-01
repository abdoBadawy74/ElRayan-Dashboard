// src/pages/SettingsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Tabs,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Spin,
  Space,
  DatePicker,
} from "antd";
import {
  Mail,
  Phone,
  PlusCircle,
  Trash2,
  Edit3,
  FileText,
  HelpCircle,
  Calendar,
} from "lucide-react";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const API_BASE = "https://api.maghni.acwad.tech/api/v1/setting";
const tokenHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function SettingsPage() {
  return (
    <div style={{ padding: 24, background: "#f3f4f6", minHeight: "100vh" }}>
      <Card style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>⚙️ Settings</h1>
        <p style={{ marginTop: 8, color: "#6b7280" }}>
          Manage Contact info, Help Center FAQs and Policies.
        </p>
      </Card>

      <Card>
        <Tabs defaultActiveKey="contact" type="card">
          <TabPane
            tab={
              <span className="flex items-center">
                <Mail size={14} style={{ marginRight: 6 }} />
                Contact Us
              </span>
            }
            key="contact"
          >
            <ContactTab />
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center">
                <HelpCircle size={14} style={{ marginRight: 6 }} />
                Help Center
              </span>
            }
            key="help"
          >
            <HelpTab />
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center">
                <FileText size={14} style={{ marginRight: 6 }} />
                Policies
              </span>
            }
            key="policies"
          >
            <PoliciesTab />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

/* ------------------ ContactTab ------------------ */
function ContactTab() {
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState([]); // [{ type, value }]
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchContact = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/contact-us`, {
        headers: tokenHeader(),
      });
      const data = res.data;
      if (!data.success || !data.data) {
        setContact([]);
      } else {
        // API returns object { email: "...", phone: "...", ... }
        const obj = data.data;
        const arr = Object.keys(obj).map((k) => ({ type: k, value: obj[k] }));
        setContact(arr);
      }
    } catch (err) {
      message.error("Error fetching contact information");
      setContact([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleAdd = async (values) => {
    // values: { type, value }
    console.log(values)
    try {

      const res = await axios.post(`${API_BASE}/contact-us`, values, {
        headers: { "Content-Type": "application/json", ...tokenHeader() },
      });

      if (res.data?.success) {
        message.success("Contact info updated");
        setAddModalOpen(false);
        form.resetFields();
        fetchContact();
      } else {
        message.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      message.error("Error updating contact info");
    }
  };

  const handleDelete = async (type) => {
    try {
      // API expects delete with body (axios allows data in delete)
      await axios.delete(`${API_BASE}/contact-us/`, {
        headers: tokenHeader(),
        params: { value: type },
      });
      message.success("Contact info deleted");
      fetchContact();
    } catch (err) {
      message.error("Error deleting contact info");
    }
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (t) => (
        <Space>
          {t === "email" ? <Mail size={14} /> : <Phone size={14} />}
          <span style={{ textTransform: "capitalize" }}>{t}</span>
        </Space>
      ),
    },
    { title: "Value", dataIndex: "value", key: "value" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title={`Delete ${record.type}?`}
            onConfirm={() => handleDelete(record.value)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<Trash2 size={14} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusCircle size={14} />} onClick={() => setAddModalOpen(true)}>
          Add Contact
        </Button>
      </Space>

      {loading ? (
        <div style={{ padding: 24, textAlign: "center" }}>
          <Spin />
        </div>
      ) : (
        <Table dataSource={contact} columns={columns} rowKey={(r) => r.type} pagination={false} className="overflow-x-auto" />
      )}

      <Modal
        title="Add / Update Contact"
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleAdd}>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select placeholder="Select type">
              <Option value="email">Email</Option>
              <Option value="phone">Phone</Option>
              <Option value="whatsapp">Whatsapp</Option>
              <Option value="facebook">Facebook</Option>
              <Option value="twitter">Twitter</Option>
              <Option value="instagram">Instagram</Option>
              <Option value="linkedin">LinkedIn</Option>
              <Option value="tiktok">TikTok</Option>
              <Option value="website">Website</Option>
            </Select>
          </Form.Item>

          <Form.Item name="value" label="Value" rules={[{ required: true }]}>
            <Input placeholder="Enter value" />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => { setAddModalOpen(false); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/* ------------------ HelpTab ------------------ */
function HelpTab() {
  const [loading, setLoading] = useState(true);
  const [helpCenter, setHelpCenter] = useState([]); // array of items
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // item or null
  const [form] = Form.useForm();

  const fetchHelp = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/help-center`, {
        headers: tokenHeader(),
      });
      if (res.data?.success) {
        setHelpCenter(res.data.data || []);
      } else {
        setHelpCenter([]);
      }
    } catch (err) {
      message.error("Error fetching help center");
      setHelpCenter([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelp();
  }, []);

  const handleAdd = async (values) => {
    const body = {
      question: { en: values.question_en, ar: values.question_ar },
      answer: { en: values.answer_en, ar: values.answer_ar },
    };
    try {
      const res = await axios.post(`${API_BASE}/help-center`, body, {
        headers: { "Content-Type": "application/json", ...tokenHeader() },
      });
      if (res.data?.success) {
        message.success("Added successfully");
        setAddOpen(false);
        form.resetFields();
        fetchHelp();
      } else {
        message.error(res.data?.message || "Add failed");
      }
    } catch (err) {
      message.error("Error adding item");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/help-center/${id}`, {
        headers: tokenHeader(),
      });
      if (res.data?.success) {
        message.success("Deleted successfully");
        fetchHelp();
      } else {
        message.error(res.data?.message || "Delete failed");
      }
    } catch (err) {
      message.error("Error deleting item");
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    form.setFieldsValue({
      question_en: item.question.en,
      question_ar: item.question.ar,
      answer_en: item.answer.en,
      answer_ar: item.answer.ar,
    });
  };

  const handleUpdate = async (values) => {
    const body = {
      question: { en: values.question_en, ar: values.question_ar },
      answer: { en: values.answer_en, ar: values.answer_ar },
    };
    try {
      const res = await axios.patch(`${API_BASE}/help-center/${editItem.id}`, body, {
        headers: { "Content-Type": "application/json", ...tokenHeader() },
      });
      if (res.data?.success) {
        message.success("Updated successfully");
        setEditItem(null);
        form.resetFields();
        fetchHelp();
      } else {
        message.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      message.error("Error updating item");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      render: (q) => (
        <div>
          <div><b>EN:</b> {q.en}</div>
          <div><b>AR:</b> {q.ar}</div>
        </div>
      ),
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
      render: (a) => (
        <div>
          <div><b>EN:</b> {a.en}</div>
          <div><b>AR:</b> {a.ar}</div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<Edit3 size={14} />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button danger icon={<Trash2 size={14} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusCircle size={14} />} onClick={() => { setAddOpen(true); form.resetFields(); }}>
          Add FAQ
        </Button>
      </Space>

      {loading ? (
        <div style={{ padding: 24, textAlign: "center" }}>
          <Spin />
        </div>
      ) : (
        <Table dataSource={helpCenter} columns={columns} rowKey="id" className="overflow-x-auto"/>
      )}

      {/* Add Modal */}
      <Modal
        title="Add Help Item"
        open={addOpen}
        onCancel={() => { setAddOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleAdd}>
          <Form.Item name="question_en" label="Question (EN)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="question_ar" label="Question (AR)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="answer_en" label="Answer (EN)" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="answer_ar" label="Answer (AR)" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => { setAddOpen(false); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Add</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Help Item"
        open={!!editItem}
        onCancel={() => { setEditItem(null); form.resetFields(); }}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleUpdate}>
          <Form.Item name="question_en" label="Question (EN)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="question_ar" label="Question (AR)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="answer_en" label="Answer (EN)" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="answer_ar" label="Answer (AR)" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => { setEditItem(null); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/* ------------------ PoliciesTab ------------------ */
function PoliciesTab() {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/policies`, { headers: tokenHeader() });
      if (res.data?.success) {
        setPolicies(res.data.data || []);
      } else {
        setPolicies([]);
      }
    } catch (err) {
      message.error("Error fetching policies");
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleAdd = async (values) => {
    const body = {
      title: { en: values.title_en, ar: values.title_ar },
      content: { en: values.content_en, ar: values.content_ar },
    };
    try {
      const res = await axios.post(`${API_BASE}/policies`, body, {
        headers: { "Content-Type": "application/json", ...tokenHeader() },
      });
      if (res.data?.success) {
        message.success("Policy added");
        setAddOpen(false);
        form.resetFields();
        fetchPolicies();
      } else {
        message.error(res.data?.message || "Add failed");
      }
    } catch (err) {
      message.error("Error adding policy");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/policies/${id}`, { headers: tokenHeader() });
      if (res.data?.success) {
        message.success("Policy deleted");
        fetchPolicies();
      } else {
        message.error(res.data?.message || "Delete failed");
      }
    } catch (err) {
      message.error("Error deleting policy");
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    form.setFieldsValue({
      title_en: item.title.en,
      title_ar: item.title.ar,
      content_en: item.content.en,
      content_ar: item.content.ar,
    });
  };

  const handleUpdate = async (values) => {
    const body = {
      title: { en: values.title_en, ar: values.title_ar },
      content: { en: values.content_en, ar: values.content_ar },
    };
    try {
      const res = await axios.patch(`${API_BASE}/policies/${editItem.id}`, body, {
        headers: { "Content-Type": "application/json", ...tokenHeader() },
      });
      if (res.data?.success) {
        message.success("Policy updated");
        setEditItem(null);
        form.resetFields();
        fetchPolicies();
      } else {
        message.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      message.error("Error updating policy");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (t) => (
        <div>
          <div><b>EN:</b> {t.en}</div>
          <div><b>AR:</b> {t.ar}</div>
        </div>
      ),
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (c) => (
        <div>
          <div><b>EN:</b> {c.en}</div>
          <div><b>AR:</b> {c.ar}</div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<Edit3 size={14} />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button danger icon={<Trash2 size={14} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusCircle size={14} />} onClick={() => { setAddOpen(true); form.resetFields(); }}>
          Add Policy
        </Button>
      </Space>

      {loading ? (
        <div style={{ padding: 24, textAlign: "center" }}><Spin /></div>
      ) : (
        <Table dataSource={policies} columns={columns} rowKey="id" className="overflow-x-auto"/>
      )}

      {/* Add Modal */}
      <Modal
        title="Add Policy"
        open={addOpen}
        onCancel={() => { setAddOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleAdd}>
          <Form.Item name="title_en" label="Title (EN)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="title_ar" label="Title (AR)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content_en" label="Content (EN)" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="content_ar" label="Content (AR)" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="dates" label="Optional Active Dates">
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => { setAddOpen(false); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Add</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Policy"
        open={!!editItem}
        onCancel={() => { setEditItem(null); form.resetFields(); }}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleUpdate}>
          <Form.Item name="title_en" label="Title (EN)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="title_ar" label="Title (AR)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content_en" label="Content (EN)" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="content_ar" label="Content (AR)" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => { setEditItem(null); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
