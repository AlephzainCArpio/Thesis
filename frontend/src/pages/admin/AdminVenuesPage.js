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


const safeJsonParse = (jsonString) => {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
};

const AdminVenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

 
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/venues");
      setVenues(response.data);
    } catch (error) {
      message.error("Failed to fetch venues");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/admin/approve/venue/${id}`);
      message.success("Venue approved");
      fetchVenues();
    } catch (error) {
      message.error("Failed to approve venue");
    }
  };

  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      await api.put(`/api/admin/reject/venue/${selectedVenue.id}`, {
        reason: values.reason,
      });
      message.success("Venue rejected");
      fetchVenues();
      setRejectModalVisible(false);
    } catch (error) {
      message.error("Failed to reject venue");
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: "Are you sure you want to delete this venue?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await api.delete(`/api/admin/venues/${id}`);
          message.success("Venue deleted");
          fetchVenues();
        } catch (error) {
          message.error("Failed to delete venue");
        }
      },
    });
  };

  const showEditModal = (venue) => {
    setSelectedVenue(venue);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      name: venue.name,
      location: venue.location,
      description: venue.description,
      capacity: venue.capacity,
      price: venue.price,
    });
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      await api.put(`/api/admin/venues/${selectedVenue.id}`, values);
      message.success("Venue updated");
      fetchVenues();
      setEditModalVisible(false);
    } catch (error) {
      message.error("Failed to update venue");
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
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
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
            src={record.images ? `${API_URL}/uploads/venues/${firstImage}` : "/placeholder.jpg"}
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
              setSelectedVenue(record);
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
                  setSelectedVenue(record);
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
        dataSource={venues}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title="Venue Details"
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={500}
      >
        {selectedVenue && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">{selectedVenue.name}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedVenue.location}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedVenue.description}</Descriptions.Item>
            <Descriptions.Item label="Capacity">{selectedVenue.capacity}</Descriptions.Item>
            <Descriptions.Item label="Price">₱{selectedVenue.price?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Images">
              {(() => {
                const parsedImages = safeJsonParse(selectedVenue.images);
                return Array.isArray(parsedImages) && parsedImages.length > 0 ? (
                  <Carousel autoplay>
                    {parsedImages.map((img, i) => (
                      <img
                        key={i}
                        src={selectedVenue.images ? `${API_URL}/uploads/venues/${img}` : "/placeholder.jpg"}
                        alt={`venue-${i}`}
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
        title="Reject Venue"
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
        title="Edit Venue"
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
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: "Please enter the capacity" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please enter the price" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminVenuesPage;
