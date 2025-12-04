// EditCouponModal.jsx
import { useEffect, useState } from "react";
import { Modal, Input, Select, Checkbox, InputNumber } from "antd";
import { toast } from "react-toastify";

export default function EditCouponModal({ open, editData, setEditData, onSave, onCancel, token }) {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await fetch("https://api.elrayan.acwad.tech/api/v1/category", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } catch (err) {
            toast.error("⚠️ Failed to load categories");
        }
    };

    // Fetch products
    const fetchProducts = async () => {
        try {
            const res = await fetch("https://api.elrayan.acwad.tech/api/v1/product", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setProducts(data.data.items);
        } catch (err) {
            toast.error("⚠️ Failed to load products");
        }
    };

    useEffect(() => {
        if (open) {
            fetchCategories();
            fetchProducts();
        }
    }, [open]);

    if (!editData) return null;

    return (
        <Modal
            title="✏️ Edit Coupon"
            open={open}
            onCancel={onCancel}
            onOk={onSave}
            okText="Save"
            cancelText="Cancel"
            width={700}
        >
            {/* Code */}
            <label>Code</label>
            <Input
                value={editData.code}
                onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                className="mb-3"
            />

            {/* Name */}
            <div className="grid grid-cols-2 gap-4 mb-3">
                <Input
                    placeholder="Name EN"
                    value={editData?.name?.en}
                    onChange={(e) =>
                        setEditData({ ...editData, name: { ...editData.name, en: e.target.value } })
                    }
                />
                <Input
                    placeholder="Name AR"
                    value={editData?.name?.ar}
                    onChange={(e) =>
                        setEditData({ ...editData, name: { ...editData.name, ar: e.target.value } })
                    }
                />
            </div>

            {/* Description */}
            <div className="grid grid-cols-2 gap-4 mb-3">
                <Input.TextArea
                    placeholder="Description EN"
                    value={editData.description?.en}
                    onChange={(e) =>
                        setEditData({ ...editData, description: { ...editData.description, en: e.target.value } })
                    }
                />
                <Input.TextArea
                    placeholder="Description AR"
                    value={editData.description?.ar}
                    onChange={(e) =>
                        setEditData({ ...editData, description: { ...editData.description, ar: e.target.value } })
                    }
                />
            </div>

            {/* Discount */}
            <div className="grid grid-cols-2 gap-4 mb-3">
                <Select
                    value={editData.discountType}
                    onChange={(val) => setEditData({ ...editData, discountType: val })}
                    options={[
                        { value: 'percentage', label: 'Percentage' },
                        { value: 'fixed_amount', label: 'Fixed' },
                        { value: 'product_specific', label: 'Product Specific' },
                    ]}
                />
                <InputNumber
                    min={0}
                    value={editData.discountValue}
                    onChange={(val) => setEditData({ ...editData, discountValue: val })}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Categories */}
            <div className="mb-3">
                <label>Applicable Categories</label>
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Select categories"
                    value={editData.applicableCategories?.map(c => c.id)}
                    onChange={(ids) => {
                        const selected = categories.filter(c => ids.includes(c.id));
                        setEditData({ ...editData, applicableCategories: selected.id });
                    }}
                    optionLabelProp="label"
                >
                    {categories.map(cat => (
                        <Select.Option key={cat.id} value={cat.id} label={cat.name.en}>
                            <div className="flex items-center gap-2">
                                {cat.icon && <img src={cat.icon} className="w-5 h-5" />}
                                <span>{cat.name.en}</span>
                            </div>
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* Products */}
            <div className="mb-3">
                <label>Applicable Products</label>
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Select products"
                    value={editData.applicableProducts.map(p => p.id)}
                    onChange={(ids) => {
                        const selected = products.filter(p => ids.includes(p.id));
                        setEditData({ ...editData, applicableProducts: selected });
                    }}
                    optionLabelProp="label"
                >
                    {products.map(p => (
                        <Select.Option key={p.id} value={p.id} label={p.name.en}>
                            <div className="flex items-center gap-2">
                                {p.images[0]?.attach && <img src={p.images[0].attach} className="w-5 h-5" />}
                                <span>{p.name.en}</span>
                            </div>
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* Status + Stackable */}
            <div className="grid grid-cols-2 gap-4">
                <Select
                    value={editData.status}
                    onChange={(val) => setEditData({ ...editData, status: val })}
                    options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                    ]}
                />
                <Checkbox
                    checked={editData.isStackable}
                    onChange={(e) => setEditData({ ...editData, isStackable: e.target.checked })}
                >
                    Is Stackable
                </Checkbox>
            </div>
        </Modal>
    );
}
