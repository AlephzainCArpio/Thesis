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
  InputNumber,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { TextArea } = Input;
const { confirm } = Modal;

// Robust helper for extracting image URLs from any DB format
const getImagesArray = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === "string") {
    // Try JSON array first
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    // Comma-separated string
    if (images.includes(",")) return images.split(",").map((s) => s.trim());
    // Single string
    return [images];
  }
  return [];
};

// Helper to get public image URL
const getImageUrl = (img) => {
  // Already has /uploads prefix
  if (img.startsWith("/uploads/")) return img;
  // Already has http/https
  if (/^https?:\/\//.test(img)) return img;
  // Otherwise, prepend
  return `/uploads/${img.replace(/^\/?uploads\//, "")}`;
};

const AdminVenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const getStatusTag = (status) =>
    ({
      PENDING: <Tag color="blue">Pending</Tag>,
      APPROVED: <Tag color="green">Approved</Tag>,
      REJECTED: <Tag color="red">Rejected</Tag>,
    }[status] || <Tag>{status}</Tag>);

  const showVenueDetails = (venue) => {
    setSelectedVenue(venue);
    setDrawerVisible(true);
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await api.put(`/api/admin/approve/venue/${id}`);
      message.success("Venue approved");
      fetchVenues();
    } catch (error) {
      message.error("Failed to approve venue");
    } finally {
      setActionLoading(false);
    }
  };

  const showRejectModal = (venue) => {
    setSelectedVenue(venue);
    setRejectModalVisible(true);
    form.resetFields();
  };

  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      setActionLoading(true);
      await api.put(`/api/admin/reject/venue/${selectedVenue.id}`, {
        reason: values.reason,
      });
      message.success("Venue rejected");
      fetchVenues();
      setRejectModalVisible(false);
    } catch (error) {
      message.error("Failed to reject venue");
    } finally {
      setActionLoading(false);
    }
  };

  const showEditModal = (venue) => {
    setSelectedVenue(venue);
    setEditModalVisible(true);
    // Amenities: convert to comma string for editing
    let amenitiesInput = "";
    if (Array.isArray(venue.amenities)) {
      amenitiesInput = venue.amenities.join(", ");
    } else if (typeof venue.amenities === "string" && venue.amenities.length > 0) {
      try {
        const parsed = JSON.parse(venue.amenities);
        if (Array.isArray(parsed)) {
          amenitiesInput = parsed.join(", ");
        } else {
          amenitiesInput = venue.amenities;
        }
      } catch {
        amenitiesInput = venue.amenities;
      }
    }
    editForm.setFieldsValue({
      name: venue.name,
      location: venue.location,
      description: venue.description,
      capacity: venue.capacity,
      price: venue.price,
      amenities: amenitiesInput,
    });
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const updatedVenue = {
        ...values,
        amenities: values.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      setActionLoading(true);
      await api.put(`/api/admin/venues/${selectedVenue.id}`, updatedVenue);
      message.success("Venue updated");
      fetchVenues();
      setEditModalVisible(false);
    } catch (error) {
      message.error("Failed to update venue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: "Are you sure you want to delete this venue?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/api/admin/venues/${id}`);
          message.success("Venue deleted");
          fetchVenues();
        } catch (error) {
          message.error("Failed to delete venue");
        } finally {
          setActionLoading(false);
        }
      },
    });
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
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      sorter: (a, b) => a.capacity - b.capacity,
      sortOrder: sortedInfo.columnKey === "capacity" && sortedInfo.order,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₱${price?.toLocaleString() || "0"}`,
      sorter: (a, b) => a.price - b.price,
      sortOrder: sortedInfo.columnKey === "price" && sortedInfo.order,
    },
    {
      title: "Amenities",
      dataIndex: "amenities",
      key: "amenities",
      render: (amenities) => {
        let amenitiesArr = [];
        if (Array.isArray(amenities)) {
          amenitiesArr = amenities;
        } else if (typeof amenities === "string" && amenities.length > 0) {
          try {
            const parsed = JSON.parse(amenities);
            if (Array.isArray(parsed)) {
              amenitiesArr = parsed;
            } else {
              amenitiesArr = [amenities];
            }
          } catch {
            amenitiesArr = amenities.split(",").map((s) => s.trim());
          }
        }
        return amenitiesArr.length > 0
          ? amenitiesArr.map((amenity, index) => (
              <Tag key={index} color="blue">
                {amenity}
              </Tag>
            ))
          : "No amenities";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Approved", value: "APPROVED" },
        { text: "Rejected", value: "REJECTED" },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showVenueDetails(record)}
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
                onClick={() => showRejectModal(record)}
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
        onChange={handleTableChange}
        pagination={{ pageSize: 10 }}
      />

      {/* Drawer for venue details */}
      <Drawer
        title="Venue Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={500}
      >
        {selectedVenue && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">
              {selectedVenue.name}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedVenue.location}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedVenue.description}
            </Descriptions.Item>
            <Descriptions.Item label="Capacity">
              {selectedVenue.capacity}
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              ₱{selectedVenue.price?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Amenities">
              {(() => {
                let amenitiesArr = [];
                if (Array.isArray(selectedVenue.amenities)) {
                  amenitiesArr = selectedVenue.amenities;
                } else if (
                  typeof selectedVenue.amenities === "string" &&
                  selectedVenue.amenities.length > 0
                ) {
                  try {
                    const parsed = JSON.parse(selectedVenue.amenities);
                    if (Array.isArray(parsed)) {
                      amenitiesArr = parsed;
                    } else {
                      amenitiesArr = [selectedVenue.amenities];
                    }
                  } catch {
                    amenitiesArr = selectedVenue.amenities
                      .split(",")
                      .map((s) => s.trim());
                  }
                }
                return amenitiesArr.length > 0
                  ? amenitiesArr.map((a, i) => <Tag key={i}>{a}</Tag>)
                  : "None";
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Images">
              {(() => {
                const imagesArr = getImagesArray(selectedVenue.images);
                return imagesArr.length > 0 ? (
                  <Carousel autoplay>
                    {imagesArr.map((img, i) => (
                      <img
                        key={i}
                        src={getImageUrl(img)}
                        alt={`venue-${i}`}
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

      {/* Reject Modal */}
      <Modal
        title="Reject Venue"
        visible={rejectModalVisible}
        onOk={handleReject}
        confirmLoading={actionLoading}
        onCancel={() => setRejectModalVisible(false)}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Reason for rejection"
            rules={[{ required: true, message: "Please enter a reason" }]}
          >
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Venue"
        visible={editModalVisible}
        onOk={handleEdit}
        confirmLoading={actionLoading}
        onCancel={() => setEditModalVisible(false)}
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
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="capacity" label="Capacity">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="price" label="Price">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(value) => `₱ ${value}`}
            />
          </Form.Item>
          <Form.Item name="amenities" label="Amenities (comma separated)">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminVenuesPage;