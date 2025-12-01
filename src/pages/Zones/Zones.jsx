import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import ZonesTable from "../../Components/zones/ZonesTable";
import ZoneMapModal from "../../Components/zones/ZoneMapModal";
import ZoneEditorModal from "../../Components/zones/ZoneEditorModal";
import * as api from "../../Api/Api";

export default function ZonesDashboard() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedZone, setSelectedZone] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await api.getZones();
      // API response shape: { success, message, data: [...] }
      setZones(res.data.data || []);
    } catch (err) {
      message.error("Failed to fetch zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleShowMap = (zone) => {
    setSelectedZone(zone);
    setMapVisible(true);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setEditorVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteZone(id);
      message.success("Deleted");
      fetchZones();
    } catch (err) {
      message.error("Failed to delete");
    }
  };

  const handleToggle = async (id, checked) => {
    try {
      // send PATCH with isActive only (note from you)
      await api.updateZone(id, { isActive: checked });
      message.success("Updated");
      fetchZones();
    } catch (err) {
      message.error("Failed to update");
    }
  };

  const handleAddClick = () => {
    setEditingZone(null);
    setEditorVisible(true);
  };

  const handleSubmitZone = async (body) => {
    try {
      if (editingZone) {
        await api.updateZone(editingZone.id, body);
        message.success("Zone updated");
      } else {
        await api.addZone(body);
        message.success("Zone added");
      }
      setEditorVisible(false);
      fetchZones();
    } catch (err) {
      message.error("Failed to save zone");
    }
  };

  const PageHeader = ({ title, extra }) => (
    <div
      style={{
        background: "#fff",
        padding: "16px 24px",
        borderRadius: 8,
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      <div>{extra}</div>
    </div>
  );


  return (
    <div style={{ padding: 20 }}>
      <PageHeader
        title="Zones Management"
        extra={[
          <Button key="1" type="primary" onClick={handleAddClick}>
            Add Zone
          </Button>,
        ]}
      />

      <ZonesTable
        zones={zones}
        loading={loading}
        onShowMap={handleShowMap}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      <ZoneMapModal visible={mapVisible} onClose={() => setMapVisible(false)} zone={selectedZone} />

      <ZoneEditorModal
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
        onSubmit={handleSubmitZone}
        initialZone={editingZone}
      />
    </div>
  );
}
