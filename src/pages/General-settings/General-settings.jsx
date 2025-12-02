import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, Button, Spin, Form, Input, Modal, Row, Col, Switch, Typography } from "antd";
const { Text } = Typography;

export default function AppVersionSettings() {
  const token = localStorage.getItem("token");

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [versionData, setVersionData] = useState(null);
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [modalHtml, setModalHtml] = useState("");
  const [form] = Form.useForm();

  // Check version
  const checkVersion = async () => {
    try {
      setChecking(true);
      const res = await axios.get(
        "https://api.elrayan.acwad.tech/api/v1/app-version/check",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVersionData(res.data);
      toast.success("Version info loaded ✔️");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch version info");
    } finally {
      setChecking(false);
    }
  };

  // Toggle app status
  const toggleAppStatus = async (checked) => {
    try {
      setUpdating(true);
      const res = await axios.patch(
        "https://api.elrayan.acwad.tech/api/v1/app-version/toggle-app-status",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVersionData(prev => ({ ...prev, isOpen: res.data.isOpen }));
      toast.success(`App is now ${res.data.isOpen ? "open" : "closed"}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle app status");
    } finally {
      setUpdating(false);
    }
  };

  // Update version
  const updateVersion = async (values) => {
    try {
      setUpdating(true);
      await axios.put(
        "https://api.elrayan.acwad.tech/api/v1/app-version/update",
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Version updated successfully ✔️");
      setShowUpdateModal(false);
      checkVersion();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update version");
    } finally {
      setUpdating(false);
    }
  };

  // Fetch HTML page
  const fetchHtml = async (url) => {
    try {
      setLoading(true);
      const res = await axios.get(url);
      setModalHtml(res.data);
      setHtmlModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch page");
    } finally {
      setLoading(false);
    }
  };

  return (<div className="p-6"> <ToastContainer />

    {/* CHECK VERSION CARD */}
    <Card title="App Version Info" className="mb-4">
      <Button type="primary" onClick={checkVersion} loading={checking}>
        Load Version Info
      </Button>
      {versionData && (
        <Spin spinning={checking || updating} className="mt-4">
          <Row gutter={16} className="mt-2">
            <Col span={12}>
              <Text strong>Android Version:</Text> {versionData.androidVersion}
            </Col>
            <Col span={12}>
              <Text strong>End Date:</Text> {versionData.androidEndDate}
            </Col>
          </Row>
          <Row gutter={16} className="mt-2">
            <Col span={12}>
              <Text strong>iOS Version:</Text> {versionData.iosVersion}
            </Col>
            <Col span={12}>
              <Text strong>End Date:</Text> {versionData.iosEndDate}
            </Col>
          </Row>
          <Row gutter={16} className="mt-2" align="middle">
            <Col span={12}>
              <Text strong>Status:</Text>
            </Col>
            <Col span={12}>
              <Switch
                checked={versionData.isOpen}
                onChange={toggleAppStatus}
                loading={updating}
                checkedChildren="Open"
                unCheckedChildren="Closed"
              />
            </Col>
          </Row>
        </Spin>
      )}
    </Card>

    {/* UPDATE VERSION CARD */}
    <Card title="Update App Version" className="mb-4">
      <Button type="primary" onClick={() => setShowUpdateModal(true)}>
        Open Update Form
      </Button>
    </Card>

    {/* MODAL FORM */}
    <Modal
      title="Update App Version"
      open={showUpdateModal}
      onCancel={() => setShowUpdateModal(false)}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={updateVersion}
        initialValues={{
          androidVersion: versionData?.androidVersion || "",
          androidEndDate: versionData?.androidEndDate || "",
          androidUrl: versionData?.androidUrl || "",
          iosVersion: versionData?.iosVersion || "",
          iosEndDate: versionData?.iosEndDate || "",
          iosUrl: versionData?.iosUrl || "",
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
          <Button onClick={() => setShowUpdateModal(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={updating}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>

    {/* HTML PAGES CARD */}
    <Card title="Policy & Deletion Pages">
      <div className="flex gap-3">
        <Button onClick={() => fetchHtml("https://api.elrayan.acwad.tech/api/v1/app-version/privacy-policy-link")}>
          Privacy Policy
        </Button>
        <Button onClick={() => fetchHtml("https://api.elrayan.acwad.tech/api/v1/app-version/deletion-link")}>
          Deletion Policy
        </Button>
      </div>
    </Card>

    {/* HTML MODAL */}
    <Modal
      title="HTML Page"
      open={htmlModalOpen}
      onCancel={() => setHtmlModalOpen(false)}
      footer={null}
      width={900}
    >
      {loading ? <Spin tip="Loading..." /> : <div dangerouslySetInnerHTML={{ __html: modalHtml }} />}
    </Modal>
  </div>

  );
}
