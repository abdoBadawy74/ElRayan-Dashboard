import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Input, InputNumber, Select, Switch, Button, Spin, Upload } from "antd";
import { Plus, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Title from "antd/es/skeleton/Title";

const { Option } = Select;

const AddProduct = () => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState([]);
    const token = localStorage.getItem("token");
    const nav = useNavigate();

    const headers = {
        Authorization: `Bearer ${token}`,
        "Accept-Language": "en",
    };

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("http://109.106.244.200:3800/api/v1/category", { headers });
                setCategories(res.data.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load categories");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleMainCategoryChange = async (value) => {
        form.setFieldsValue({ sub_category_id: null });
        try {
            const res = await axios.get(`http://109.106.244.200:3800/api/v1/sub-categories?main_category=${value}`, { headers });
            setSubCategories(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load subcategories");
        }
    };

    const onFinish = async (values) => {
        try {
            const formData = new FormData();
            formData.append("name[ar]", values.name_ar);
            formData.append("name[en]", values.name_en);
            formData.append("description[ar]", values.description_ar);
            formData.append("description[en]", values.description_en);
            formData.append("price", values.price);
            formData.append("supplier_price", values.supplier_price);
            formData.append("discount", values.discount);
            formData.append("discount_type", values.discount_type);
            formData.append("main_category_id", values.main_category_id);
            formData.append("sub_category_id", values.sub_category_id);
            formData.append("stock", values.stock);
            // formData.append("isFeatured", values.isFeatured);
            // formData.append("isHidden", values.isHidden);

            // Append images
            fileList.forEach(file => {
                if (file.originFileObj) formData.append("images", file.originFileObj);
            });

            // POST for new product
            await axios.post(`http://109.106.244.200:3800/api/v1/product`, formData, {
                headers: { ...headers, "Content-Type": "multipart/form-data" },
            });

            toast.success("Product added successfully!");
            setTimeout(() => nav("/products"), 1500);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add product.");
        }
    };

    if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 800, margin: "auto" }}>
            <ToastContainer />
            <h1 style={{ textAlign: "center", marginBottom: 20, fontSize: 24 }}>Add New Product</h1>
            <Form.Item label="Name (AR)" name="name_ar" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Name (EN)" name="name_en" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Description (AR)" name="description_ar"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item label="Description (EN)" name="description_en"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item label="Price" name="price" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item label="Supplier Price" name="supplier_price" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item label="Discount" name="discount"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item label="Discount Type" name="discount_type">
                <Select><Option value="fixed">Fixed</Option><Option value="percent">Percent</Option></Select>
            </Form.Item>
            <Form.Item label="Main Category" name="main_category_id" rules={[{ required: true }]}>
                <Select onChange={handleMainCategoryChange}>
                    {categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.name.en}</Option>)}
                </Select>
            </Form.Item>
            <Form.Item label="Sub Category" name="sub_category_id" rules={[{ required: true }]}>
                <Select>{subCategories.map(sub => <Option key={sub.id} value={sub.id}>{sub.name.en}</Option>)}</Select>
            </Form.Item>
            <Form.Item label="Stock" name="stock"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item label="Featured" name="isFeatured" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item label="Hidden" name="isHidden" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item label="Images">
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    beforeUpload={() => false} // prevent auto upload
                    multiple
                >
                    {fileList.length >= 5 ? null : <div><Plus /><div style={{ marginTop: 8 }}>Upload</div></div>}
                </Upload>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" icon={<Save />}>Save</Button>
            </Form.Item>
        </Form>
    );
};

export default AddProduct;
