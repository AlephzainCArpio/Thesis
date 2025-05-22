import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Drawer,
  Descriptions,
  Carousel,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { confirm } = Modal;
const { TextArea } = Input;

// Use same image parsing as AdminDashboard
const safeJsonParse = (jsonString) => {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
};

const AdminCateringPage = () => {
  const [caterings, setCaterings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedCatering, setSelectedCatering] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchCaterings();
  }, []);

  const fetchCaterings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/caterings");
      setCaterings(response.data);
    } catch (error) {
      message.error("Failed to fetch catering services");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/admin/approve/catering/${id}`);
      message.success("Catering approved");
      fetchCaterings();
    } catch (error) {
      message.error("Failed to approve catering");
    }
  };

  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      await api.put(`/api/admin/reject/catering/${selectedCatering.id}`, {
        reason: values.reason,
      });
      message.success("Catering rejected");
      fetchCaterings();
      setRejectModalVisible(false);
    } catch (error) {
      message.error("Failed to reject catering");
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: "Are you sure you want to delete this catering service?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await api.delete(`/api/admin/caterings/${id}`);
          message.success("Catering deleted");
          fetchCaterings();
        } catch (error) {
          message.error("Failed to delete catering service");
        }
      },
    });
  };

  const showEditModal = (catering) => {
    setSelectedCatering(catering);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      name: catering.name,
      location: catering.location,
      description: catering.description,
      cuisineType: catering.cuisineType,
      maxPeople: catering.maxPeople,
      pricePerPerson: catering.pricePerPerson,
    });
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      await api.put(`/api/admin/caterings/${selectedCatering.id}`, values);
      message.success("Catering updated");
      fetchCaterings();
      setEditModalVisible(false);
    } catch (error) {
      message.error("Failed to update catering");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Cuisine Type",
      dataIndex: "cuisineType",
      key: "cuisineType",
    },
    {
      title: "Max People",
      dataIndex: "maxPeople",
      key: "maxPeople",
    },
    {
      title: "Price Per Person",
      dataIndex: "pricePerPerson",
      key: "pricePerPerson",
      render: (price) => `₱${price?.toLocaleString() || "0"}`,
    },
    {
      title: "Images",
      key: "images",
      render: (_, record) => {
        const parsedImages = safeJsonParse(record.images);
        const firstImage = Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0] : "default.jpg";
        return (
          <img
            src={record.images ? `${API_URL}/uploads/caterings/${firstImage}` : "/placeholder.jpg"}
            alt=""
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
            onError={e => {
              e.target.onerror = null;
              e.target.src = "/placeholder.jpg";
            }}
          />
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
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
      },
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
              setSelectedCatering(record);
              setDrawerVisible(true);
            }}
            size="small"
          />
          {record.status === "PENDING" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                size="small"
              />
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setSelectedCatering(record);
                  setRejectModalVisible(true);
                }}
                size="small"
              />
            </>
          )}
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={caterings}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title="Catering Details"
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={500}
      >
        {selectedCatering && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">{selectedCatering.name}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedCatering.location}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedCatering.description}</Descriptions.Item>
            <Descriptions.Item label="Cuisine Type">{selectedCatering.cuisineType}</Descriptions.Item>
            <Descriptions.Item label="Max People">{selectedCatering.maxPeople}</Descriptions.Item>
            <Descriptions.Item label="Price Per Person">₱{selectedCatering.pricePerPerson?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Images">
              {(() => {
                const parsedImages = safeJsonParse(selectedCatering.images);
                return Array.isArray(parsedImages) && parsedImages.length > 0 ? (
                  <Carousel autoplay>
                    {parsedImages.map((img, i) => (
                      <img
                        key={i}
                        src={selectedCatering.images ? `${API_URL}/uploads/caterings/${img}` : "/placeholder.jpg"}
                        alt={`catering-${i}`}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                        }}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                    ))}
                  </Carousel>
                ) : (
                  "No images"
                );
              })()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Modal
        title="Reject Catering"
        visible={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Reason for Rejection"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Catering"
        visible={editModalVisible}
        onOk={handleEdit}
        onCancel={() => setEditModalVisible(false)}
        okText="Save"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please enter a location" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="cuisineType"
            label="Cuisine Type"
            rules={[{ required: true, message: "Please enter a cuisine type" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="maxPeople"
            label="Max People"
            rules={[{ required: true, message: "Please enter the maximum capacity" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="pricePerPerson"
            label="Price Per Person"
            rules={[{ required: true, message: "Please enter the price per person" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCateringPage;
