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

const AdminPhotographersPage = () => {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const fetchPhotographers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/photographers");
      setPhotographers(response.data);
    } catch (error) {
      message.error("Failed to fetch photographers.");
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
      title: "Style",
      dataIndex: "style",
      key: "style",
      ellipsis: true,
    },
    {
      title: "Experience (Years)",
      dataIndex: "experienceYears",
      key: "experienceYears",
      sorter: (a, b) => a.experienceYears - b.experienceYears,
    },
    {
      title: "Copy Type",
      dataIndex: "copyType",
      key: "copyType",
    },
    {
      title: "Style",
      dataIndex: "style",
      key: "Style",
    },
    {
      title: "Price Range",
      dataIndex: "priceRange",
      key: "priceRange",
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
              setSelectedPhotographer(record);
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
      title: "Are you sure you want to delete this photographer?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await api.delete(`/api/admin/photographers/${id}`);
          message.success("Photographer deleted.");
          fetchPhotographers();
        } catch (error) {
          message.error("Failed to delete photographer.");
        }
      },
    });
  };

  return (
    <div>
      <Button onClick={fetchPhotographers} style={{ marginBottom: 16 }}>
        Refresh
      </Button>
      <Table
        columns={columns}
        dataSource={photographers}
        rowKey="id"
        loading={loading}
        onChange={(pagination, filters, sorter) => {
          setFilteredInfo(filters);
          setSortedInfo(sorter);
        }}
        pagination={{ pageSize: 10 }}
      />
      <Drawer
        title={selectedPhotographer?.name}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={700}
      >
        {selectedPhotographer && (
          <Descriptions bordered layout="vertical" column={2}>
            <Descriptions.Item label="Name">{selectedPhotographer.name}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedPhotographer.location}</Descriptions.Item>
            <Descriptions.Item label="Style">{selectedPhotographer.style}</Descriptions.Item>
            <Descriptions.Item label="Experience (Years)">{selectedPhotographer.experienceYears}</Descriptions.Item>
            <Descriptions.Item label="Copy Type">{selectedPhotographer.copyType}</Descriptions.Item>
            <Descriptions.Item label="Style">{selectedPhotographer.style}</Descriptions.Item>
            <Descriptions.Item label="Price Range">{selectedPhotographer.priceRange}</Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedPhotographer.description}
            </Descriptions.Item>
            <Descriptions.Item label="Portfolio" span={2}>
              {selectedPhotographer.portfolio || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default AdminPhotographersPage;
