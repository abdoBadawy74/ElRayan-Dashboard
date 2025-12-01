import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, X, Pencil, Trash } from "lucide-react"; // أيقونات
import { Spin } from "antd";

const API_URL = "https://api.maghni.acwad.tech/api/v1/banners";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  

  // States for form (used for add & edit)
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [productId, setProductId] = useState(0);
  const [type, setType] = useState("discount");

  // fetch banners
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (response.ok) {
        setBanners(result.data);
      } else {
        toast.error(result.message || "Failed to fetch banners");
      }
    } catch (error) {
      toast.error("Error fetching banners");
    }
    setLoading(false);
  };

  // add banner
  const addBanner = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("imagePath", imageFile);
    formData.append("title", title);
    formData.append("link", link);
    formData.append("productId", productId);
    formData.append("type", type);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Banner added successfully!");
        fetchBanners();
        setIsAddModalOpen(false);
        resetForm();
      } else {
        toast.error(result.message || "Failed to add banner");
      }
    } catch (error) {
      toast.error("Error adding banner");
    }
  };

  // edit banner
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
        method:"PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Banner updated successfully!");
        fetchBanners();
        setIsEditModalOpen(false);
        resetForm();
      } else {
        toast.error(result.message || "Failed to update banner");
      }
    } catch (error) {
      toast.error("Error updating banner");
    }
  };

  // delete banner
  const deleteBanner = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Banner deleted successfully!");
        setBanners(banners.filter((banner) => banner.id !== id));
        setIsModalOpen(false);
      } else {
        toast.error("Failed to delete banner");
      }
    } catch (error) {
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

  useEffect(() => {
    fetchBanners();
  }, []);

  if(banners === null) {
    return (
      <div className="p-6">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <Plus size={20} /> Add Banner
        </button>
      </div>

      {/* banners grid */}
      {loading ? (
       <div className="flex justify-center items-center">
         <Spin size="large" />
       </div>
      ) : banners.length === 0 ? (
        <p className="text-gray-500">No banners found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition"
              onClick={() => {
                setSelectedBanner(banner);
                setIsModalOpen(true);
              }}
            >
              <img
                src={banner.imagePath}
                alt={`Banner ${banner.id}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-gray-600">ID: {banner.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Details */}
      {isModalOpen && selectedBanner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            <img
              src={selectedBanner.imagePath}
              alt="Selected Banner"
              className="w-full h-60 object-cover rounded-lg mb-4"
            />
            <p className="mb-2 text-gray-700">ID: {selectedBanner.id}</p>

            {/* icons */}
            <div className="flex justify-end gap-4 mt-4 text-gray-700">
              <X
                className="cursor-pointer hover:text-red-600"
                size={22}
                onClick={() => setIsModalOpen(false)}
              />
              <Pencil
                className="cursor-pointer hover:text-blue-600"
                size={22}
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditModalOpen(true);
                  setTitle(selectedBanner.title || "");
                  setLink(selectedBanner.link || "");
                  setProductId(selectedBanner.productId || 0);
                  setType(selectedBanner.type || "discount");
                  setImageFile(null);
                }}
              />
              <Trash
                className="cursor-pointer hover:text-red-600"
                size={22}
                onClick={() => deleteBanner(selectedBanner.id)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Banner */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4">Add New Banner</h2>
            <form onSubmit={addBanner} className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title *"
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Link"
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Product ID"
                className="w-full border p-2 rounded"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="discount">discount</option>
                <option value="new">new</option>
              </select>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Banner */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4">Edit Banner</h2>
            <form onSubmit={editBanner} className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title *"
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Link"
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Product ID"
                className="w-full border p-2 rounded"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="discount">discount</option>
                <option value="new">new</option>
              </select>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
