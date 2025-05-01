import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Drawer,
  Descriptions,
  Modal,
  message,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { confirm } = Modal;

const AdminDesignersPage = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/designers");
      setDesigners(response.data);
    } catch (error) {
      message.error("Failed to fetch designers.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="blue">Pending</Tag>;
      case "APPROVED":
        return <Tag color="green">Approved</Tag>;
      case "REJECTED":
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
    },
    {
      title: "Design Style",
      dataIndex: "style",
      key: "style",
      ellipsis: true,
    },
    {
      title: "Price Range",
      dataIndex: "priceRange",
      key: "priceRange",
      ellipsis: true,
    },
    {
      title: "Event Types",
      dataIndex: "eventTypes",
      key: "eventTypes",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Approved", value: "APPROVED" },
        { text: "Rejected", value: "REJECTED" },
      ],
      onFilter: (value, record) => record.status === value,
      filteredValue: filteredInfo.status || null,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedDesigner(record);
              setDrawerVisible(true);
            }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const confirmDelete = async (id) => {
    confirm({
      title: "Are you sure you want to delete this designer?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await api.delete(`/admin/designers/${id}`);
          message.success("Designer deleted.");
          fetchDesigners();
        } catch (error) {
          message.error("Failed to delete designer.");
        }
      },
    });
  };

  return (
    <div>
      <Button onClick={fetchDesigners} style={{ marginBottom: 16 }}>
        Refresh
      </Button>
      <Table
        columns={columns}
        dataSource={designers}
        rowKey="id"
        loading={loading}
        onChange={(pagination, filters, sorter) => {
          setFilteredInfo(filters);
          setSortedInfo(sorter);
        }}
        pagination={{ pageSize: 10 }}
      />
      <Drawer
        title={selectedDesigner?.name}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={700}
      >
        {selectedDesigner && (
          <Descriptions bordered layout="vertical" column={2}>
            <Descriptions.Item label="Name">{selectedDesigner.name}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedDesigner.location}</Descriptions.Item>
            <Descriptions.Item label="Style">{selectedDesigner.style}</Descriptions.Item>
            <Descriptions.Item label="Price Range">{selectedDesigner.priceRange}</Descriptions.Item>
            <Descriptions.Item label="Event Types">{selectedDesigner.eventTypes || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedDesigner.description}
            </Descriptions.Item>
            <Descriptions.Item label="Portfolio" span={2}>
              {selectedDesigner.portfolio || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default AdminDesignersPage;
