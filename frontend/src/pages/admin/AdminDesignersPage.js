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

const AdminDesignersPage = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/designers");
      setDesigners(response.data);
    } catch (error) {
      message.error("Failed to fetch designers");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/admin/approve/designer/${id}`);
      message.success("Designer approved");
      fetchDesigners();
    } catch (error) {
      message.error("Failed to approve designer");
    }
  };

  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      await api.put(`/api/admin/reject/designer/${selectedDesigner.id}`, {
        reason: values.reason,
      });
      message.success("Designer rejected");
      fetchDesigners();
      setRejectModalVisible(false);
    } catch (error) {
      message.error("Failed to reject designer");
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: "Are you sure you want to delete this designer?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await api.delete(`/api/admin/designers/${id}`);
          message.success("Designer deleted");
          fetchDesigners();
        } catch (error) {
          message.error("Failed to delete designer");
        }
      },
    });
  };

  const showEditModal = (designer) => {
    setSelectedDesigner(designer);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      name: designer.name,
      location: designer.location,
      description: designer.description,
      style: designer.style,
      priceRange: designer.priceRange,
      eventTypes: designer.eventTypes,
    });
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      await api.put(`/api/admin/designers/${selectedDesigner.id}`, values);
      message.success("Designer updated");
      fetchDesigners();
      setEditModalVisible(false);
    } catch (error) {
      message.error("Failed to update designer");
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
      title: "Price Range",
      dataIndex: "priceRange",
      key: "priceRange",
    },
    {
      title: "Event Types",
      dataIndex: "eventTypes",
      key: "eventTypes",
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
              setSelectedDesigner(record);
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
                  setSelectedDesigner(record);
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
        dataSource={designers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title="Designer Details"
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={500}
      >
        {selectedDesigner && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">{selectedDesigner.name}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedDesigner.location}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedDesigner.description}</Descriptions.Item>
            <Descriptions.Item label="Style">{selectedDesigner.style}</Descriptions.Item>
            <Descriptions.Item label="Price Range">{selectedDesigner.priceRange}</Descriptions.Item>
            <Descriptions.Item label="Event Types">{selectedDesigner.eventTypes}</Descriptions.Item>
            <Descriptions.Item label="Images">
              {(() => {
                const images = getImagesArray(selectedDesigner.images);
                return images.length ? (
                  <Carousel autoplay>
                    {images.map((img, index) => (
                      <img
                        key={index}
                        src={getImageUrl(img)}
                        alt={`designer-${index}`}
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
        title="Reject Designer"
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
        title="Edit Designer"
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
            name="priceRange"
            label="Price Range"
            rules={[{ required: true, message: "Please enter the price range" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="eventTypes"
            label="Event Types"
            rules={[{ required: true, message: "Please enter event types" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDesignersPage;