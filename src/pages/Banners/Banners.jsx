import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, X, Pencil, Trash } from "lucide-react";
import { Spin, Button, Modal, Input, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const API_URL = "https://api.elrayan.acwad.tech/api/v1/banners";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBanner, setSelectedBanner] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // form states
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [productId, setProductId] = useState(0);
  const [type, setType] = useState("discount");

  // ------------------ FETCH ------------------
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (response.ok) setBanners(result.data);
      else toast.error(result.message);
    } catch (err) {
      toast.error("Error fetching banners");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ------------------ ADD ------------------
  const addBanner = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("imagePath", imageFile);
    formData.append("title", title);
    formData.append("link", link);
    formData.append("productId", productId);
    formData.append("type", type);

    // console.log(imageFile)

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const res = await response.json();

      if (response.ok) {
        toast.success("Banner added");
        fetchBanners();
        setIsAddModalOpen(false);
        resetForm();
      } else toast.error(res.message);
    } catch {
      toast.error("Error adding banner");
    }
  };

  // ------------------ EDIT ------------------
  const editBanner = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (imageFile) formData.append("imagePath", imageFile);
    formData.append("title", title);
    formData.append("link", link);
    formData.append("productId", productId);
    formData.append("type", type);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${selectedBanner.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const res = await response.json();
      if (response.ok) {
        toast.success("Banner updated");
        fetchBanners();
        setIsEditModalOpen(false);
        resetForm();
      } else toast.error(res.message);
    } catch {
      toast.error("Error updating banner");
    }
  };

  // ------------------ DELETE ------------------
  const deleteBanner = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Banner deleted");
        setBanners(banners.filter((b) => b.id !== id));
        setIsModalOpen(false);
      } else toast.error("Delete failed");
    } catch {
      toast.error("Error deleting banner");
    }
  };

  const resetForm = () => {
    setTitle("");
    setLink("");
    setProductId(0);
    setType("discount");
    setImageFile(null);
  };


  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>

        <Button
          type="primary"
          icon={<Plus size={18} />}
          style={{ background: "#e3010f" }}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Banner
        </Button>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center items-center"><Spin size="large" /></div>
      ) : banners.length === 0 ? (
        <p className="text-gray-500">No banners found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition"
              onClick={() => {
                setSelectedBanner(banner);
                setIsModalOpen(true);
              }}
            >
              <img src={banner.imagePath} className="w-full h-48 object-cover" />
              <div className="p-4">
                <p className="text-gray-600 text-sm">ID: {banner.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------ VIEW MODAL ------------------ */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        {selectedBanner && (
          <div>
            <img src={selectedBanner.imagePath} className="w-full h-60 object-cover rounded mb-4" />

            <div className="flex justify-end gap-2">
              <Button
                danger
                icon={<Trash size={16} />}
                onClick={() => deleteBanner(selectedBanner.id)}
              >
                Delete
              </Button>

              <Button
                type="primary"
                icon={<Pencil size={16} />}
                style={{ background: "#e3010f" }}
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditModalOpen(true);
                  setTitle(selectedBanner.title || "");
                  setLink(selectedBanner.link || "");
                  setProductId(selectedBanner.productId || 0);
                  setType(selectedBanner.type || "discount");
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------ ADD MODAL ------------------ */}
      <Modal
        open={isAddModalOpen}
        title="Add Banner"
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <form onSubmit={addBanner} className="space-y-4">

          <Upload
            beforeUpload={() => false}
            maxCount={1}
            onChange={({ fileList }) => setImageFile(fileList[0]?.originFileObj || null)}
          >
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>


          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input placeholder="Link" value={link} onChange={(e) => setLink(e.target.value)} />
          <Input placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />

          <Select
            value={type}
            onChange={setType}
            options={[
              { value: "discount", label: "discount" },
              { value: "new", label: "new" },
            ]}
            className="w-full"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button htmlType="submit" type="primary" style={{ background: "#e3010f" }}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------ EDIT MODAL ------------------ */}
      <Modal
        open={isEditModalOpen}
        title="Edit Banner"
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <form onSubmit={editBanner} className="space-y-4">

          <Upload
            beforeUpload={() => false}
            maxCount={1}
            onChange={({ fileList }) => setImageFile(fileList[0]?.originFileObj || null)}
          >
            <Button icon={<UploadOutlined />}>Upload New (Optional)</Button>
          </Upload>

          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input placeholder="Link" value={link} onChange={(e) => setLink(e.target.value)} />
          <Input placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />

          <Select
            value={type}
            onChange={setType}
            options={[
              { value: "discount", label: "discount" },
              { value: "new", label: "new" },
            ]}
            className="w-full"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button htmlType="submit" type="primary" style={{ background: "#e3010f" }}>
              Update
            </Button>
          </div>
        </form>
      </Modal>

      <ToastContainer />
    </div>
  );
}
