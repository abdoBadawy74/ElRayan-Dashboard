import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, Button, Spin, Form, Input, Modal, Row, Col } from "antd";

export default function AppVersionSettings() {
  const token = localStorage.getItem("token");
  const [showPopup, setShowPopup] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [form] = Form.useForm();

  // Fetch Countries
  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const res = await axios.get(
        "https://api.maghni.acwad.tech/api/v1/app-version/countries-data",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCountries(res.data);
    } catch (err) {
      toast.error("Failed to load countries");
    } finally {
      setLoadingCountries(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // Check version
  const checkVersion = async () => {
    try {
      setChecking(true);
      const res = await axios.get(
        "https://api.maghni.acwad.tech/api/v1/app-version/check",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) toast.success("Version is up to date ✔️");
      else toast.info("Unexpected response from server");
    } catch (err) {
      toast.error("Failed to check version");
    } finally {
      setChecking(false);
    }
  };

  // Update version
  const updateVersion = async (values) => {
    try {
      setUpdating(true);
      await axios.post(
        "https://api.maghni.acwad.tech/api/v1/app-version/update",
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Version updated successfully ✔️");
      setShowPopup(false);
    } catch (err) {
      toast.error("Failed to update version");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 grid gap-6">
      <ToastContainer />

      {/* CHECK VERSION CARD */}
      <Card title="Check App Version">
        <p className="text-gray-600 mb-4">
          Verify if the current app version is up to date.
        </p>
        <Button type="primary" onClick={checkVersion} loading={checking}>
          Check Version
        </Button>
      </Card>

      {/* COUNTRIES CARD */}
      <Card title="Countries Data">
        {loadingCountries ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : countries.length === 0 ? (
          <p className="text-gray-500">No countries data found.</p>
        ) : (
          <Row gutter={[16, 16]}>
            {countries.map((c) => (
              <Col xs={24} sm={12} lg={8} key={c.id}>
                <Card className="flex items-center gap-3" bordered>
                  <img src={c.flag} alt={c.name} className="w-12 h-12 rounded" />
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-gray-600">{c.phoneCode}</p>
                    <p className="text-xs">Currency: {c.currency}</p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* UPDATE VERSION CARD */}
      <Card title="Update App Version">
        <p className="text-gray-600 mb-4">Update both Android & iOS application versions.</p>
        <Button type="primary" onClick={() => setShowPopup(true)}>
          Open Update Form
        </Button>
      </Card>

      {/* MODAL FORM */}
      <Modal
        title="Update App Version"
        open={showPopup}
        onCancel={() => setShowPopup(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={updateVersion}
          initialValues={{
            androidVersion: "",
            androidEndDate: "",
            androidUrl: "",
            iosVersion: "",
            iosEndDate: "",
            iosUrl: "",
          }}
        >
          <Row gutter={16}>
            {[
              { name: "androidVersion", label: "Android Version" },
              { name: "androidEndDate", label: "Android End Date" },
              { name: "androidUrl", label: "Android URL" },
              { name: "iosVersion", label: "iOS Version" },
              { name: "iosEndDate", label: "iOS End Date" },
              { name: "iosUrl", label: "iOS URL" },
            ].map((field) => (
              <Col span={24} md={12} key={field.name}>
                <Form.Item label={field.label} name={field.name}>
                  <Input />
                </Form.Item>
              </Col>
            ))}
          </Row>
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setShowPopup(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
