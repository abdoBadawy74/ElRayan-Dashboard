import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Input, InputNumber, Switch, Button, Popconfirm, Space, message, Tag } from "antd";
import { Edit2, Trash2, PlusCircle, } from "lucide-react";

const BASE_URL = "http://109.106.244.200:3800/api/v1";

function fmtDateForInput(iso) { if (!iso) return ""; const d = new Date(iso); const pad = (n) => String(n).padStart(2, '0'); const yyyy = d.getFullYear(); const mm = pad(d.getMonth() + 1); const dd = pad(d.getDate()); const hh = pad(d.getHours()); const min = pad(d.getMinutes()); return `${yyyy}-${mm}-${dd}T${hh}:${min}` }

export default function Rewards() {
    const [loading, setLoading] = useState(false);
    const [rewards, setRewards] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");

    async function load() {
        try { setLoading(true); const res = await fetch(`${BASE_URL}/rewards`, { headers: { Authorization: `Bearer ${token}` } }); const json = await res.json(); if (json && json.data) { setIsActive(Boolean(json.data.isActive)); setRewards(json.data.rewards || []) } else if (Array.isArray(json)) setRewards(json); else message.error('Failed to load'); } catch (e) { message.error('Error loading rewards') } finally { setLoading(false) }
    }

    useEffect(() => { load() }, []);

    function openCreate() { setEditing(null); form.resetFields(); setModalOpen(true) }
    function openEdit(rec) { setEditing(rec); form.setFieldsValue({ type: rec.type, discountType: rec.discountType, discountValue: Number(rec.discountValue), productId: rec.productId, displayText: rec.displayText, couponCode: rec.couponCode, probability: rec.probability, isActive: rec.isActive, description: rec.description, expiresAt: fmtDateForInput(rec.expiresAt), minOrderAmount: Number(rec.minOrderAmount) }); setModalOpen(true) }

    async function handleDelete(id) { try { setLoading(true); const res = await fetch(`${BASE_URL}/rewards/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { message.success('Deleted'); setRewards(s => s.filter(r => r.id !== id)) } else { message.error('Delete failed') } } catch (e) { message.error('Error deleting') } finally { setLoading(false) } }

    async function onFinish(vals) {
        const payload = { type: vals.type, discountType: vals.discountType, discountValue: Number(vals.discountValue || 0), productId: Number(vals.productId || 0), displayText: vals.displayText || '', couponCode: vals.couponCode || '', probability: Number(vals.probability || 1), isActive: Boolean(vals.isActive), description: vals.description || '', expiresAt: vals.expiresAt ? new Date(vals.expiresAt).toISOString() : null, minOrderAmount: Number(vals.minOrderAmount || 0) };
        try {
            setLoading(true); let res; if (editing) { res = await fetch(`${BASE_URL}/rewards/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }) } else { res = await fetch(`${BASE_URL}/rewards`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }) }
            if (res.ok) { message.success(editing ? 'Updated' : 'Created'); setModalOpen(false); load() } else { const txt = await res.text(); message.error('Save failed: ' + txt) }
        } catch (e) { message.error('Error saving') } finally { setLoading(false) }
    }

    const cols = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
        { title: 'Type', dataIndex: 'type', key: 'type' },
        { title: 'Display', dataIndex: 'displayText', key: 'displayText' },
        { title: 'Coupon', dataIndex: 'couponCode', key: 'couponCode' },
        { title: 'Discount', key: 'discount', render: (t, r) => `${r.discountValue}${r.discountType === 'percentage' ? '%' : ''}` },
        { title: 'Product', dataIndex: 'productId', key: 'productId' },
        { title: 'Expires', dataIndex: 'expiresAt', key: 'expiresAt', render: (t) => t ? new Date(t).toLocaleString() : '-' },
        { title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (t) => (t ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>) },
        {
            title: 'Actions', key: 'actions', width: 140, render: (_, rec) => (<Space>
                <Button size="small" onClick={() => openEdit(rec)} icon={<Edit2 size={14} />}>Edit</Button>
                <Popconfirm title="Are you sure to delete this reward?" onConfirm={() => handleDelete(rec.id)} okText="Yes" cancelText="No"><Button danger size="small" icon={<Trash2 size={14} />}>Del</Button></Popconfirm>
            </Space>)
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">Rewards</h1>
                <div className="flex items-center gap-3">
                    <Button type="primary" icon={<PlusCircle size={16} />} onClick={openCreate}>New Reward</Button>
                </div>
            </div>

            <Table rowKey="id" columns={cols} dataSource={rewards} loading={loading} pagination={{ pageSize: 10, showSizeChanger: true }} />

            <Modal title={editing ? 'Edit Reward' : 'Create Reward'} open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields(); setEditing(null) }} footer={null} destroyOnClose>
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: 'discount_coupon', discountType: 'percentage', probability: 1, isActive: true, minOrderAmount: 0 }}>
                    <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Select type' }]}>
                        <select className="border rounded w-full p-2">
                            <option value="discount_coupon">discount_coupon</option>
                            <option value="free_item">free_item</option>
                            <option value="cashback">cashback</option>
                        </select>
                    </Form.Item>
                    <Form.Item name="discountType" label="Discount Type" rules={[{ required: true, message: 'Select discount type' }]}>
                        <select className="border rounded w-full p-2">
                            <option value="percentage">percentage</option>
                            <option value="fixed">fixed</option>
                        </select>
                    </Form.Item>
                    <Form.Item name="discountValue" label="Discount Value" rules={[{ required: true, message: 'Required' }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="productId" label="Product ID"><InputNumber style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="displayText" label="Display Text"><Input /></Form.Item>
                    <Form.Item name="couponCode" label="Coupon Code"><Input /></Form.Item>
                    <Form.Item name="probability" label="Probability"><InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="isActive" label="Active" valuePropName="checked"><Switch /></Form.Item>
                    <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
                    <Form.Item name="expiresAt" label="Expires At"><Input type="datetime-local" /></Form.Item>
                    <Form.Item name="minOrderAmount" label="Min Order Amount"><InputNumber style={{ width: '100%' }} /></Form.Item>

                    <Form.Item>
                        <Space className="w-full justify-end">
                            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Save</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
