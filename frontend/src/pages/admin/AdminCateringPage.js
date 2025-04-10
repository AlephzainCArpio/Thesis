"use client"

import { useState, useEffect } from "react"
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
  Select,
  InputNumber,
} from "antd"
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
const { Option } = Select
const { confirm } = Modal

const AdminCateringPage = () => {
  const [caterings, setCaterings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCatering, setSelectedCatering] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [filteredInfo, setFilteredInfo] = useState({})
  const [sortedInfo, setSortedInfo] = useState({})

  useEffect(() => {
    fetchCaterings()
  }, [])

  const fetchCaterings = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/caterings")
      setCaterings(response.data)
    } catch (error) {
      message.error("Failed to fetch catering services")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const showCateringDetails = (catering) => {
    setSelectedCatering(catering)
    setDrawerVisible(true)
  }

  const showRejectModal = (catering) => {
    setSelectedCatering(catering)
    setRejectModalVisible(true)
    form.resetFields()
  }

  const showEditModal = (catering) => {
    setSelectedCatering(catering)
    setEditModalVisible(true)

    // Parse the menu items JSON string to array
    const menuItems = catering.menuItems ? JSON.parse(catering.menuItems) : []
    const cuisineTypes = catering.cuisineTypes ? JSON.parse(catering.cuisineTypes) : []

    editForm.setFieldsValue({
      ...catering,
      menuItems,
      cuisineTypes,
    })
  }

  const handleApprove = async (cateringId) => {
    confirm({
      title: "Are you sure you want to approve this catering service?",
      icon: <ExclamationCircleOutlined />,
      content: "Once approved, the catering service will be visible to all users.",
      onOk: async () => {
        try {
          setActionLoading(true)
          await api.patch(`/admin/caterings/${cateringId}/approve`)
          message.success("Catering service approved successfully")
          fetchCaterings() // Refresh the list
          setDrawerVisible(false)
        } catch (error) {
          message.error("Failed to approve catering service")
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
      await api.patch(`/admin/caterings/${selectedCatering.id}/reject`, {
        reason: values.reason,
      })
      message.success("Catering service rejected")
      setRejectModalVisible(false)
      fetchCaterings() // Refresh the list
      setDrawerVisible(false)
    } catch (error) {
      message.error("Failed to reject catering service")
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditCatering = async (values) => {
    try {
      setActionLoading(true)

      // Format the arrays to JSON strings
      const updatedValues = {
        ...values,
        menuItems: JSON.stringify(values.menuItems),
        cuisineTypes: JSON.stringify(values.cuisineTypes),
      }

      await api.put(`/admin/caterings/${selectedCatering.id}`, updatedValues)
      message.success("Catering service updated successfully")
      fetchCaterings() // Refresh the list
      setEditModalVisible(false)

      // If drawer is open, update the selected catering
      if (drawerVisible) {
        const updatedCatering = {
          ...selectedCatering,
          ...updatedValues,
          menuItems: values.menuItems, // Keep as array for display
          cuisineTypes: values.cuisineTypes,
        }
        setSelectedCatering(updatedCatering)
      }
    } catch (error) {
      message.error("Failed to update catering service")
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (cateringId) => {
    confirm({
      title: "Are you sure you want to delete this catering service?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/admin/caterings/${cateringId}`)
          message.success("Catering service deleted successfully")
          fetchCaterings() // Refresh the list
          setDrawerVisible(false)
        } catch (error) {
          message.error("Failed to delete catering service")
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
      title: "Min. Order",
      dataIndex: "minimumOrder",
      key: "minimumOrder",
      render: (minimumOrder) => `${minimumOrder} pax`,
      sorter: (a, b) => a.minimumOrder - b.minimumOrder,
      sortOrder: sortedInfo.columnKey === "minimumOrder" && sortedInfo.order,
    },
    {
      title: "Price Per Head",
      dataIndex: "pricePerHead",
      key: "pricePerHead",
      render: (price) => `₱${price?.toLocaleString() || "0"}`,
      sorter: (a, b) => a.pricePerHead - b.pricePerHead,
      sortOrder: sortedInfo.columnKey === "pricePerHead" && sortedInfo.order,
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
          <Button type="primary" icon={<EyeOutlined />} onClick={() => showCateringDetails(record)} size="small" />
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
        <Button type="primary" onClick={() => fetchCaterings()}>
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={caterings}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={{ pageSize: 10 }}
      />

      {/* Catering Detail Drawer */}
      <Drawer
        title={selectedCatering?.name}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
        footer={
          selectedCatering?.status === "PENDING" ? (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button danger onClick={() => showRejectModal(selectedCatering)}>
                Reject
              </Button>
              <Button type="primary" onClick={() => handleApprove(selectedCatering?.id)}>
                Approve
              </Button>
            </div>
          ) : null
        }
      >
        {selectedCatering && (
          <>
            {/* Catering Images */}
            {selectedCatering.images && JSON.parse(selectedCatering.images).length > 0 ? (
              <Carousel autoplay>
                {JSON.parse(selectedCatering.images).map((image, index) => (
                  <div key={index}>
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${selectedCatering.name} ${index + 1}`}
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

            <Descriptions title="Catering Information" layout="vertical" bordered style={{ marginTop: 16 }}>
              <Descriptions.Item label="Name" span={3}>
                {selectedCatering.name}
              </Descriptions.Item>
              <Descriptions.Item label="Provider" span={3}>
                {selectedCatering.provider?.name || "Unknown Provider"}
              </Descriptions.Item>
              <Descriptions.Item label="Provider Email" span={3}>
                {selectedCatering.provider?.email || "Email not available"}
              </Descriptions.Item>
              <Descriptions.Item label="Provider Phone" span={3}>
                {selectedCatering.provider?.phone || "Phone not available"}
              </Descriptions.Item>
              <Descriptions.Item label="Minimum Order" span={1}>
                {selectedCatering.minimumOrder} pax
              </Descriptions.Item>
              <Descriptions.Item label="Price Per Head" span={2}>
                ₱{selectedCatering.pricePerHead?.toLocaleString() || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={3}>
                {getStatusTag(selectedCatering.status)}
                {selectedCatering.rejectionReason && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Rejection Reason:</strong> {selectedCatering.rejectionReason}
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Cuisine Types" span={3}>
                {selectedCatering.cuisineTypes
                  ? typeof selectedCatering.cuisineTypes === "string"
                    ? JSON.parse(selectedCatering.cuisineTypes).map((cuisine, index) => (
                        <Tag key={index} color="green" style={{ margin: "2px" }}>
                          {cuisine}
                        </Tag>
                      ))
                    : selectedCatering.cuisineTypes.map((cuisine, index) => (
                        <Tag key={index} color="green" style={{ margin: "2px" }}>
                          {cuisine}
                        </Tag>
                      ))
                  : "No cuisine types listed"}
              </Descriptions.Item>
              <Descriptions.Item label="Menu Items" span={3}>
                <ul>
                  {selectedCatering.menuItems ? (
                    typeof selectedCatering.menuItems === "string" ? (
                      JSON.parse(selectedCatering.menuItems).map((item, index) => <li key={index}>{item}</li>)
                    ) : (
                      selectedCatering.menuItems.map((item, index) => <li key={index}>{item}</li>)
                    )
                  ) : (
                    <li>No menu items listed</li>
                  )}
                </ul>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {selectedCatering.description}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
              <Button danger onClick={() => handleDelete(selectedCatering.id)}>
                Delete Catering Service
              </Button>
              <Button type="primary" onClick={() => showEditModal(selectedCatering)}>
                Edit Catering Service
              </Button>
            </div>
          </>
        )}
      </Drawer>

      {/* Reject Modal */}
      <Modal
        title="Reject Catering Service"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label="Reason for Rejection"
            rules={[{ required: true, message: "Please provide a reason for rejection" }]}
          >
            <TextArea rows={4} placeholder="Explain why this catering service is being rejected" />
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
        title="Edit Catering Service"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditCatering}>
          <Form.Item
            name="name"
            label="Catering Service Name"
            rules={[{ required: true, message: "Please enter service name!" }]}
          >
            <Input placeholder="Enter catering service name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description!" }]}
          >
            <TextArea rows={4} placeholder="Describe your catering service" />
          </Form.Item>

          <Form.Item
            name="minimumOrder"
            label="Minimum Order (pax)"
            rules={[{ required: true, message: "Please enter minimum order!" }]}
          >
            <InputNumber min={1} placeholder="Minimum number of guests" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="pricePerHead"
            label="Price Per Head (₱)"
            rules={[{ required: true, message: "Please enter price per head!" }]}
          >
            <InputNumber min={0} placeholder="Price per person" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={actionLoading}>
              Update Catering Service
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminCateringPage
