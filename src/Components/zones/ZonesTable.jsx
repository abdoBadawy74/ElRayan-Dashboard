import React from "react";
import { Table, Button, Tag, Popconfirm, Switch, Space, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  AimOutlined,
} from "@ant-design/icons";

export default function ZonesTable({
  zones,
  loading,
  onShowMap,
  onEdit,
  onDelete,
  onToggle,
}) {
  const columns = [
    {
      title: "Zone Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b style={{ fontSize: 15 }}>{text}</b>,
    },

    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) =>
        v ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },

    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Show on map">
            <Button
              icon={<AimOutlined />}
              onClick={() => onShowMap(record)}
              type="default"
            />
          </Tooltip>

          <Tooltip title="Edit zone">
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              type="primary"
            />
          </Tooltip>

          <Popconfirm
            title="Delete this zone?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => onDelete(record.id)}
          >
            <Tooltip title="Delete zone">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>

          <Tooltip title="Toggle active state">
            <Switch
              checked={record.isActive}
              onChange={(checked) => onToggle(record.id, checked)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={zones}
      columns={columns}
      loading={loading}
      pagination={{ pageSize: 10 }}
      bordered
      size="middle"
      style={{
        background: "white",
        borderRadius: 12,
        padding: 8,
      }}
      tableLayout="fixed"
      className="overflow-x-auto"
    />
  );
}
