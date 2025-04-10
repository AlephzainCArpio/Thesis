"use client"

import { useState, useEffect } from "react"
import { Table, Button, Space, Tag, Drawer, Descriptions, Carousel, Modal, Form, Input, message } from "antd"
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from "@ant-design/icons"
import api from "../../services/api"

const { TextArea } = Input
const { confirm } = Modal

const AdminVenuesPage = () => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [filteredInfo, setFilteredInfo] = useState({})
  const [sortedInfo, setSortedInfo] = useState({})

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/venues")
      setVenues(response.data)
    } catch (error) {
      message.error("Failed to fetch venues")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const showVenueDetails = (venue) => {
    setSelectedVenue(venue)
    setDrawerVisible(true)
  }

  const showRejectModal = (venue) => {
    setSelectedVenue(venue)
    setRejectModalVisible(true)
    form.resetFields()
  }

  const showEditModal = (venue) => {
    setSelectedVenue(venue)
    setEditModalVisible(true)

    // Parse the amenities JSON string to array
    const amenities = venue.amenities ? JSON.parse(venue.amenities) : []

    editForm.setFieldsValue({
      ...venue,
      amenities,
    })
  }

  const handleApprove = async (venueId) => {
    confirm({
      title: "Are you sure you want to approve this venue?",
      icon: <ExclamationCircleOutlined />,
      content: "Once approved, the venue will be visible to all users.",
      onOk: async () => {
        try {
          setActionLoading(true)
          await api.patch(`/admin/venues/${venueId}/approve`)
          message.success("Venue approved successfully")
          fetchVenues() // Refresh the list
          setDrawerVisible(false)
        } catch (error) {
          message.error("Failed to approve venue")
          console.error(error)
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  const handleReject = async (values) => {
    try {
      setActionLoading(true)
      await api.patch(`/admin/venues/${selectedVenue.id}/reject`, {
        reason: values.reason,
      })
      message.success("Venue rejected")
      setRejectModalVisible(false)
      fetchVenues() // Refresh the list
      setDrawerVisible(false)
    } catch (error) {
      message.error("Failed to reject venue")
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditVenue = async (values) => {
    try {
      setActionLoading(true)

      // Format the amenities array to JSON string
      const updatedValues = {
        ...values,
        amenities: JSON.stringify(values.amenities),
      }

      await api.put(`/admin/venues/${selectedVenue.id}`, updatedValues)
      message.success("Venue updated successfully")
      fetchVenues() // Refresh the list
      setEditModalVisible(false)

      // If drawer is open, update the selected venue
      if (drawerVisible) {
        const updatedVenue = {
          ...selectedVenue,
          ...updatedValues,
          amenities: values.amenities, // Keep as array for display
        }
        setSelectedVenue(updatedVenue)
      }
    } catch (error) {
      message.error("Failed to update venue")
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (venueId) => {
    confirm({
      title: "Are you sure you want to delete this venue?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/admin/venues/${venueId}`)
          message.success("Venue deleted successfully")
          fetchVenues() // Refresh the list
          setDrawerVisible(false)
        } catch (error) {
          message.error("Failed to delete venue")
          console.error(error)
        }
      },
    })
  }

  const handleTableChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters)
    setSortedInfo(sorter)
  }

  const clearFilters = () => {
    setFilteredInfo({})
  }

  const clearSorters = () => {
    setSortedInfo({})
  }

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="blue">Pending</Tag>
      case "APPROVED":
        return <Tag color="green">Approved</Tag>
      case "REJECTED":
        return <Tag color="red">Rejected</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

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
      title: "Provider",
      dataIndex: ["provider", "name"],
      key: "provider",
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
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
          <Button type="primary" icon={<EyeOutlined />} onClick={() => showVenueDetails(record)} size="small" />
          {record.status === "PENDING" && (
            <>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)} size="small" />
              <Button danger icon={<CloseOutlined />} onClick={() => showRejectModal(record)} size="small" />
            </>
          )}
          <Button type="default" icon={<EditOutlined />} onClick={() => showEditModal(record)} size="small" />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} size="small" />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <div>
          <Button onClick={clearFilters} style={{ marginRight: 8 }}>
            Clear Filters
          </Button>
          <Button onClick={clearSorters}>Clear Sorters</Button>
        </div>
        <Button type="primary" onClick={() => fetchVenues()}>
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={venues}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={{ pageSize: 10 }}
      />

      {/* Venue Detail Drawer */}
      <Drawer
        title={selectedVenue?.name}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={600}
        footer={
          selectedVenue?.status === "PENDING" ? (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button danger onClick={() => showRejectModal(selectedVenue)}>
                Reject
              </Button>
              <Button type="primary" onClick={() => handleApprove(selectedVenue?.id)}>
                Approve
              </Button>
            </div>
          ) : null
        }
      >
        {selectedVenue && (
          <>
            {/* Venue Images */}
            {selectedVenue.images && JSON.parse(selectedVenue.images).length > 0 ? (
              <Carousel autoplay>
                {JSON.parse(selectedVenue.images).map((image, index) => (
                  <div key={index}>
                    <img
                      src={image}
                      alt={`${selectedVenue.name} ${index + 1}`}
                      style={{ width: "100%", height: 300, objectFit: "cover" }}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 200,
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                No images available
              </div>
            )}

            <Descriptions title="Venue Information" layout="vertical" bordered style={{ marginTop: 16 }}>
              <Descriptions.Item label="Name" span={3}>
                {selectedVenue.name}
              </Descriptions.Item>
              <Descriptions.Item label="Provider" span={3}>
                {selectedVenue.provider?.name || "Unknown Provider"}
              </Descriptions.Item>
              <Descriptions.Item label="Provider Email" span={3}>
                {selectedVenue.provider?.email || "Email not available"}
              </Descriptions.Item>
              <Descriptions.Item label="Provider Phone" span={3}>
                {selectedVenue.provider?.phone || "Phone not available"}
              </Descriptions.Item>
              <Descriptions.Item label="Location" span={3}>
                {selectedVenue.location}
              </Descriptions.Item>
              <Descriptions.Item label="Capacity" span={1}>
                {selectedVenue.capacity} guests
              </Descriptions.Item>
              <Descriptions.Item label="Price" span={2}>
                ₱{selectedVenue.price?.toLocaleString() || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={3}>
                {getStatusTag(selectedVenue.status)}
                {selectedVenue.rejectionReason && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Rejection Reason:</strong> {selectedVenue.rejectionReason}
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Amenities" span={3}>
                {selectedVenue.amenities
                  ? typeof selectedVenue.amenities === "string"
                    ? JSON.parse(selectedVenue.amenities).map((amenity, index) => (
                        <Tag key={index} color="blue" style={{ margin: "2px" }}>
                          {amenity}
                        </Tag>
                      ))
                    : selectedVenue.amenities.map((amenity, index) => (
                        <Tag key={index} color="blue" style={{ margin: "2px" }}>
                          {amenity}
                        </Tag>
                      ))
                  : "No amenities listed"}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {selectedVenue.description}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
              <Button danger onClick={() => handleDelete(selectedVenue.id)}>
                Delete Venue
              </Button>
              <Button type="primary" onClick={() => showEditModal(selectedVenue)}>
                Edit Venue
              </Button>
            </div>
          </>
        )}
      </Drawer>

      {/* Reject Modal */}
      <Modal
        title="Reject Venue"
        visible={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label="Reason for Rejection"
            rules={[{ required: true, message: "Please provide a reason for rejection" }]}
          >
            <TextArea rows={4} placeholder="Explain why this venue is being rejected" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={actionLoading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Venue"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditVenue}>
          <Form.Item name="name" label="Venue Name" rules={[{ required: true, message: "Please enter venue name!" }]}>
            <Input placeholder="Enter venue name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description!" }]}
          >
            <TextArea rows={4} placeholder="Describe your venue" />
          </Form.Item>

          <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter location!" }]}>
            <Input placeholder="Full address" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Maximum Capacity"
            rules={[{ required: true, message: "Please enter capacity!" }]}
          >
            <Input type="number" min={1} placeholder="Max number of guests" />
          </Form.Item>

          <Form.Item name="price" label="Price (₱)" rules={[{ required: true, message: "Please enter price!" }]}>
            <Input type="number" min={0} placeholder="Rental fee" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={actionLoading}>
              Update Venue
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminVenuesPage
