import { useEffect, useState } from "react";
import axios from "axios";
import {
    Table,
    Button,
    Modal,
    Tag,
    Popconfirm,
    Spin,
    Typography,
    Select,

} from "antd";
import { Eye, Trash2, EyeOff, EyeIcon, Edit } from "lucide-react";
import { Link } from "react-router-dom";

const { Title } = Typography;

export default function Products() {
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);


    const [viewModal, setViewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    const [selectedMain, setSelectedMain] = useState("");
    const [selectedSub, setSelectedSub] = useState("");



    const token = localStorage.getItem("token");

    const api = axios.create({
        baseURL: "https://api.elrayan.acwad.tech/api/v1",
        headers: { Authorization: `Bearer ${token}`, lang: "en" },
    });

    // ===========================
    // Fetch Products
    // ===========================
    const fetchProducts = async () => {
        try {
            setLoading(true);

            const res = await api.get(
                `/product?page=${page}&limit=${limit}&sortOrder=ASC${selectedMain ? `&categoryId=${selectedMain}` : ""
                }${selectedSub ? `&subCategoryId=${selectedSub}` : ""
                }`
            );

            if (res.data.success) {
                setProducts(res.data.data.items);
                setMeta(res.data.data.metadata);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    // ===========================
    // Delete Product
    // ===========================
    const deleteProduct = async (id) => {
        try {
            await api.delete(`/product/${id}`);
            fetchProducts();
        } catch (e) {
            console.log(e);
        }
    };

    // ===========================
    // Toggle Hidden
    // ===========================
    const toggleHidden = async (id) => {
        try {
            await api.patch(`/product/toggle-hidden/${id}`);
            fetchProducts();
        } catch (e) {
            console.log(e);
        }
    };

    // ===========================
    // Open View Modal
    // ===========================
    const openView = async (id) => {
        try {
            const res = await api.get(`/product/${id}`);
            if (res.data.success) {
                setSelectedProduct(res.data.data);
                setViewModal(true);
            }
        } catch (e) {
            console.log(e);
        }
    };


    // ===========================
    // Fetch Categories
    // ==========================
    useEffect(() => {
        const fetchMain = async () => {
            try {
                const res = await api.get("/category", {
                    headers: { lang: "en" }
                });
                if (res.data.success) setMainCategories(res.data.data);
            } catch (e) { console.log(e); }
        };
        fetchMain();
    }, []);

    console.log(mainCategories)
    // ===========================
    // Fetch Sub Categories
    // =========================
    useEffect(() => {
        if (!selectedMain) return;
        const fetchSubs = async () => {
            try {
                const res = await api.get(`/sub-categories?main_category=${selectedMain}`, {
                    headers: { lang: "en" }
                });
                if (res.data.success) setSubCategories(res.data.data);
            } catch (e) { console.log(e); }
        };
        fetchSubs();
    }, [selectedMain]);


    // Fetch products on page/limit change
    useEffect(() => {
        fetchProducts();
    }, [page, limit]);


    // ===========================
    // Table Columns
    // ===========================
    const columns = [
        {
            title: "Image",
            dataIndex: "images",
            render: (img) => (
                <img
                    src={img?.[0]?.attach}
                    style={{ width: 55, height: 55, objectFit: "cover", borderRadius: 6 }}
                />
            ),
        },
        {
            title: "Name",
            dataIndex: "name",
            render: (n) => n.en,
        },
        {
            title: "Price",
            dataIndex: "price_after_discount",
            render: (p) => `${p} EGP`,
        },
        {
            title: "Stock",
            dataIndex: "stock",
        },
        {
            title: "Status",
            dataIndex: "isHidden",
            render: (h) =>
                h ? <Tag color="red">Hidden</Tag> : <Tag color="green">Visible</Tag>,
        },
        {
            title: "Actions",
            render: (_, row) => (
                <div style={{ display: "flex", gap: 10 }}>

                    <Link to={`/products/${row.id}`}>
                        <Edit
                            size={18}
                            style={{ cursor: "pointer" }}
                            title="Edit Product"
                            className="text-blue-600"
                        />
                    </Link>

                    <Eye
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => openView(row.id)}
                    />

                    <Popconfirm
                        title="Are you sure you want to delete this product?"
                        okText="Delete"
                        okType="danger"
                        onConfirm={() => deleteProduct(row.id)}
                    >
                        <Trash2 size={18} color="red" style={{ cursor: "pointer" }} />
                    </Popconfirm>

                    {row.isHidden ? (
                        <EyeIcon
                            size={18}
                            color="green"
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleHidden(row.id)}
                            title="Make Visible"
                        />
                    ) : (
                        <EyeOff
                            size={18}
                            color="red"
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleHidden(row.id)}
                            title="Make Hidden"
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            {/* Header */}
            <div>
                <Title level={2} style={{ marginBottom: 20 }}>
                    Product Management
                </Title>

                <div style={{ marginBottom: 20, textAlign: "right" }}>
                    <Link to="/products/add">
                        <Button type="primary">Add New Product</Button>
                    </Link>
                </div>
            </div>



            <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <p className="self-start m-0 text-red-500">Filter by Category:</p>
                    <Select
                        value={selectedMain}
                        placeholder="Select Main Category"
                        style={{ width: 200 }}
                        onChange={(value) => {
                            setSelectedMain(value);
                            setSelectedSub("");
                        }}
                        options={mainCategories.map(c => ({
                            value: c.id,
                            label: c.name.en,
                        }))}
                    />
                </div>


                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <p className="self-start m-0 text-red-500">Filter by Sub Category:</p>
                    <Select
                        value={selectedSub}
                        placeholder="Select Sub Category"
                        disabled={!selectedMain}
                        style={{ width: 200 }}
                        onChange={(value) => setSelectedSub(value)}
                        options={subCategories.map(s => ({
                            value: s.id,
                            label: s.name.en,
                        }))}
                    />
                </div>

                <Button
                    onClick={() => {
                        setSelectedMain("");
                        setSelectedSub("");
                        setPage(1);
                        setLimit(10);
                        fetchProducts();
                    }}
                    style={{ marginTop: 20 }}
                >
                    Clear Filters
                </Button>

                <Button type="primary" style={{ marginTop: 20 }} onClick={() => fetchProducts()}>
                    Filter
                </Button>
            </div>



            {/* Table */}
            {!loading && (
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={products}
                    pagination={{
                        current: meta.currentPage,
                        total: meta.totalItems,
                        pageSize: limit,
                        onChange: (p, pageSize) => {
                            setPage(p);
                            setLimit(pageSize);
                        },
                    }}
                />
            )}
            {/* Loading */}
            {loading && (
                <div style={{ textAlign: "center", marginTop: 50 }}>
                    <Spin size="large" />
                </div>
            )}

            {/* VIEW MODAL */}
            <Modal
                open={viewModal}
                onCancel={() => setViewModal(false)}
                footer={null}
                title="Product Details"
                width={600}
            >
                {selectedProduct && (
                    <div>
                        {
                            selectedProduct.images.length === 1 ? (
                                <img
                                    src={selectedProduct.images?.[0]?.attach}
                                    style={{
                                        width: "100%",
                                        borderRadius: 10,
                                        marginBottom: 10,
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 10,
                                        overflowX: "auto",
                                        justifyContent: "start",
                                        marginBottom: 10,
                                    }}
                                >
                                    {selectedProduct.images.map((img) => (
                                        <img
                                            key={img.id}
                                            src={img.attach}
                                            style={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: 10,
                                                objectFit: "cover",
                                            }}
                                        />
                                    ))}
                                </div>
                            )
                        }
                        <h2>{selectedProduct.name.en}</h2>
                        <p>{selectedProduct.description.en}</p>

                        <p>
                            <strong>Price:</strong> {selectedProduct.price_after_discount} EGP
                        </p>

                        <p>
                            <strong>Stock:</strong> {selectedProduct.stock}
                        </p>

                        <p>
                            <strong>Main Category:</strong>{" "}
                            {selectedProduct.mainCategory?.name}
                        </p>

                        <p>
                            <strong>Sub Category:</strong>{" "}
                            {selectedProduct.subCategory?.name}
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
