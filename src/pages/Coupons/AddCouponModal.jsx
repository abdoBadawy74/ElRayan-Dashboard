import { useEffect, useState } from "react";
import { Modal, Input, Select, Checkbox, DatePicker, Button } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function AddCouponModal({ open, onCancel, onSave, token }) {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [coupon, setCoupon] = useState({
        code: "",
        discountType: "percentage",
        discountValue: 0,
        applicableCategories: [],
        applicableProducts: [],
        validFrom: null,
        validTo: null,
        usageLimit: 0,
        // usedCount: 0,
        usageLimitPerUser: 0,
        status: "active",
        isStackable: true,
    });

    // Fetch categories on mount
    useEffect(() => {
        fetch("https://api.elrayan.acwad.tech/api/v1/category", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setCategories(data.data);
            })
            .catch(console.error);
    }, []);

    // Fetch products based on selected categories
    useEffect(() => {
        if (coupon.applicableCategories.length === 0) {
            setProducts([]);
            return;
        }

        setLoadingProducts(true);
        Promise.all(
            coupon.applicableCategories.map((catId) =>
                fetch(`https://api.elrayan.acwad.tech/api/v1/product?categoryId=${catId}&subCategoryId=1`, {
                    headers: { Authorization: `Bearer ${token}` },
                }).then((res) => res.json())
            )
        )
            .then((results) => {
                const allProducts = results.flatMap((r) => r.data.items);
                setProducts(allProducts);
                setLoadingProducts(false);
            })
            .catch(() => setLoadingProducts(false));
    }, [coupon.applicableCategories]);

    // Disable other inputs if free_shipping
    const isFreeShipping = coupon.discountType === "free_shipping";

    return (
        <Modal
            title="➕ Add Coupon"
            open={open}
            onCancel={onCancel}
            onOk={() => onSave(coupon)}
            okText="Save"
            cancelText="Cancel"
            width={700}
        >
            {/* Coupon Code */}
            <label>Coupon Code</label>
            <Input
                value={coupon.code}
                onChange={(e) => setCoupon({ ...coupon, code: e.target.value })}
                className="mb-3"
            />

            {/* Discount Type */}
            <label>Discount Type</label>
            <Select
                value={coupon.discountType}
                onChange={(val) => setCoupon({ ...coupon, discountType: val, discountValue: 0 })}
                options={[
                    { value: "percentage", label: "Percentage" },
                    { value: "fixed_amount", label: "Fixed" },
                    { value: "category_specific", label: "Category Specific" },
                    { value: "product_specific", label: "Product Specific" },
                    { value: "free_shipping", label: "Free Shipping" },
                ]}
                className="mb-3"
            />

            {/* Discount Value */}
            {!isFreeShipping && (
                <div>
                    <label>Discount Value</label>
                    <Input
                        type="number"
                        value={coupon.discountValue}
                        max={coupon.discountType === "percentage" ? 100 : undefined}
                        onChange={(e) =>
                            setCoupon({ ...coupon, discountValue: Number(e.target.value) })
                        }
                        className="mb-3"
                    />
                </div>
            )}

            {/* Applicable Categories */}
            {(coupon.discountType === "category_specific" || coupon.discountType === "product_specific") && !isFreeShipping && (
                <div className="flex flex-col ">
                    <label>Applicable Categories</label>
                    <Select
                        mode="multiple"
                        value={coupon.applicableCategories}
                        onChange={(val) => setCoupon({ ...coupon, applicableCategories: val })}
                        options={categories.map((cat) => ({
                            value: cat.id,
                            label: cat.name.en,
                            icon: cat.icon,
                        }))}
                        className="mb-3"
                        dropdownMatchSelectWidth={false}
                        style={{ minWidth: 300 }}
                        tagRender={({ label, value, closable, onClose }) => {
                            const cat = categories.find(c => c.id === value);
                            return (
                                <span className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded px-2 py-0.5 mr-1">
                                    {cat?.icon && <img src={cat.icon} alt="" className="w-4 h-4" />}
                                    {label}
                                    {closable && (
                                        <span onClick={onClose} className="ml-1 cursor-pointer">&times;</span>
                                    )}
                                </span>
                            );
                        }}
                    />
                </div>
            )}

            {/* Applicable Products */}
            {coupon.discountType === "product_specific" && !isFreeShipping && (
                <div className="flex flex-col ">
                    <label>Applicable Products</label>
                    <Select
                        mode="multiple"
                        value={coupon.applicableProducts}
                        onChange={(val) => setCoupon({ ...coupon, applicableProducts: val })}
                        loading={loadingProducts}
                        options={products.map((p) => ({
                            value: p.id,
                            label: p.name.en,
                            icon: p.images?.[0]?.attach,
                        }))}
                        className="mb-3"
                        dropdownMatchSelectWidth={false}
                        style={{ minWidth: 300 }}
                        tagRender={({ label, value, closable, onClose }) => {
                            const prod = products.find(p => p.id === value);
                            return (
                                <span className="flex items-center gap-1 bg-green-100 text-green-800 rounded px-2 py-0.5 mr-1">
                                    {prod?.images?.[0]?.attach && <img src={prod.images[0].attach} alt="" className="w-4 h-4" />}
                                    {label}
                                    {closable && (
                                        <span onClick={onClose} className="ml-1 cursor-pointer">&times;</span>
                                    )}
                                </span>
                            );
                        }}
                    />
                </div>
            )}


            {/* Valid From & To */}
            <label>Valid Period</label>
            <RangePicker
                value={
                    coupon.validFrom && coupon.validTo
                        ? [dayjs(coupon.validFrom), dayjs(coupon.validTo)]
                        : []
                }
                onChange={(dates) =>
                    setCoupon({
                        ...coupon,
                        validFrom: dates[0]?.toISOString(),
                        validTo: dates[1]?.toISOString(),
                    })
                }
                className="mb-3 w-full"
            />

            {/* Usage Limits */}
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                    <label>Usage Limit</label>
                    <Input
                        type="number"
                        value={coupon.usageLimit}
                        onChange={(e) =>
                            setCoupon({ ...coupon, usageLimit: Number(e.target.value) })
                        }
                    />
                </div>
                {/* <div>
                    <label>Used Count</label>
                    <Input
                        type="number"
                        value={coupon.usedCount}
                        onChange={(e) =>
                            setCoupon({ ...coupon, usedCount: Number(e.target.value) })
                        }
                    />
                </div> */}
                <div>
                    <label>Usage Limit Per User</label>
                    <Input
                        type="number"
                        value={coupon.usageLimitPerUser}
                        onChange={(e) =>
                            setCoupon({ ...coupon, usageLimitPerUser: Number(e.target.value) })
                        }
                    />
                </div>
            </div>

            {/* Status & Stackable */}
            <div className="grid grid-cols-2 gap-4">
                <Select
                    value={coupon.status}
                    onChange={(val) => setCoupon({ ...coupon, status: val })}
                    options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                    ]}
                />
                <Checkbox
                    checked={coupon.isStackable}
                    onChange={(e) => setCoupon({ ...coupon, isStackable: e.target.checked })}
                >
                    Is Stackable
                </Checkbox>
            </div>
        </Modal>
    );
}
