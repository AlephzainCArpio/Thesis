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

const getImagesArray = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    if (images.includes(",")) return images.split(",").map((s) => s.trim());
    return [images];
  }
  return [];
};

const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("/uploads/")) return img;
  if (/^https?:\/\//.test(img)) return img;
  return `/uploads/${img.replace(/^\/?uploads\//, "")}`;
};

const AdminPhotographersPage = () => {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const fetchPhotographers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/photographers");
      setPhotographers(response.data);
    } catch (error) {
      message.error("Failed to fetch photographers");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/admin/approve/photographer/${id}`);
      message.success("Photographer approved");
      fetchPhotographers();
    } catch (error) {
      message.error("Failed to approve photographer");
    }
  };

  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      await api.put(`/api/admin/reject/photographer/${selectedPhotographer.id}`, {
        reason: values.reason,
      });
      message.success("Photographer rejected");
      fetchPhotographers();
      setRejectModalVisible(false);
    } catch (error) {
      message.error("Failed to reject photographer");
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: "Are you sure you want to delete this photographer?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await api.delete(`/api/admin/photographers/${id}`);
          message.success("Photographer deleted");
          fetchPhotographers();
        } catch (error) {
          message.error("Failed to delete photographer");
        }
      },
    });
  };

  const showEditModal = (photographer) => {
    setSelectedPhotographer(photographer);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      name: photographer.name,
      location: photographer.location,
      description: photographer.description,
      style: photographer.style,
      experienceYears: photographer.experienceYears,
      copyType: photographer.copyType,
      priceRange: photographer.priceRange,
    });
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      await api.put(`/api/admin/photographers/${selectedPhotographer.id}`, values);
      message.success("Photographer updated");
      fetchPhotographers();
      setEditModalVisible(false);
    } catch (error) {
      message.error("Failed to update photographer");
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
      title: "Style",
      dataIndex: "style",
      key: "style",
    },
    {
      title: "Experience (Years)",
      dataIndex: "experienceYears",
      key: "experienceYears",
    },
    {
      title: "Price Range",
      dataIndex: "priceRange",
      key: "priceRange",
    },
    {
      title: "Images",
      key: "images",
      render: (_, record) => {
        const arr = getImagesArray(record.images);
        return arr.length > 0 ? (
          <img
            src={getImageUrl(arr[0])}
            alt=""
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ) : (
          "No image"
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
              setSelectedPhotographer(record);
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
                  setSelectedPhotographer(record);
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
        dataSource={photographers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title="Photographer Details"
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={500}
      >
        {selectedPhotographer && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">{selectedPhotographer.name}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedPhotographer.location}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedPhotographer.description}</Descriptions.Item>
            <Descriptions.Item label="Style">{selectedPhotographer.style}</Descriptions.Item>
            <Descriptions.Item label="Experience (Years)">{selectedPhotographer.experienceYears}</Descriptions.Item>
            <Descriptions.Item label="Copy Type">{selectedPhotographer.copyType}</Descriptions.Item>
            <Descriptions.Item label="Price Range">{selectedPhotographer.priceRange}</Descriptions.Item>
            <Descriptions.Item label="Images">
              {(() => {
                const images = getImagesArray(selectedPhotographer.images);
                return images.length ? (
                  <Carousel autoplay>
                    {images.map((img, index) => (
                      <img
                        key={index}
                        src={getImageUrl(img)}
                        alt={`photographer-${index}`}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
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
        title="Reject Photographer"
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
        title="Edit Photographer"
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
            name="style"
            label="Style"
            rules={[{ required: true, message: "Please enter a style" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="experienceYears"
            label="Experience (Years)"
            rules={[{ required: true, message: "Please enter the years of experience" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="copyType"
            label="Copy Type"
            rules={[{ required: true, message: "Please enter the copy type" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="priceRange"
            label="Price Range"
            rules={[{ required: true, message: "Please enter the price range" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPhotographersPage;