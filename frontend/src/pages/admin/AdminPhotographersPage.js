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

const AdminPhotographersPage = () => {
  const [photographers, setPhotographers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhotographer, setSelectedPhotographer] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [filteredInfo, setFilteredInfo] = useState({})
  const [sortedInfo, setSortedInfo] = useState({})

  useEffect(() => {
    fetchPhotographers()
  }, [])

  const fetchPhotographers = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/photographers")
      setPhotographers(response.data)
    } catch (error) {
      message.error("Failed to fetch photographers")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const showPhotographerDetails = (photographer) => {
    setSelectedPhotographer(photographer)
    setDrawerVisible(true)
  }

  const showRejectModal = (photographer) => {
    setSelectedPhotographer(photographer)
    setRejectModalVisible(true)
    form.resetFields()
  }

  const showEditModal = (photographer) => {
    setSelectedPhotographer(photographer)
    setEditModalVisible(true)

    // Parse the styles and specialties JSON strings to arrays
    const photographyStyles = photographer.photographyStyles ? JSON.parse(photographer.photographyStyles) : []
    const specialties = photographer.specialties ? JSON.parse(photographer.specialties) : []

    editForm.setFieldsValue({
      ...photographer,
      photographyStyles,
      specialties,
    })
  }

  const handleApprove = async (photographerId) => {
    confirm({
      title: "Are you sure you want to approve this photographer?",
      icon: <ExclamationCircleOutlined />,
      content: "Once approved, the photographer will be visible to all users.",
      onOk: async () => {
        try {
          setActionLoading(true)
          await api.patch(`/admin/photographers/${photographerId}/approve`)
          message.success("Photographer approved successfully")
          fetchPhotographers() // Refresh the list
          setDrawerVisible(false)
        } catch (error) {
          message.error("Failed to approve photographer")
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
      await api.patch(`/admin/photographers/${selectedPhotographer.id}/reject`, {
        reason: values.reason,
      })
      message.success("Photographer rejected")
      setRejectModalVisible(false)
      fetchPhotographers() // Refresh the list
      setDrawerVisible(false)
    } catch (error) {
      message.error("Failed to reject photographer")
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditPhotographer = async (values) => {
    try {
      setActionLoading(true)

      // Format the arrays to JSON strings
      const updatedValues = {
        ...values,
        photographyStyles: JSON.stringify(values.photographyStyles),
        specialties: JSON.stringify(values.specialties),
      }

      await api.put(`/admin/photographers/${selectedPhotographer.id}`, updatedValues)
      message.success("Photographer updated successfully")
      fetchPhotographers() // Refresh the list
      setEditModalVisible(false)

      // If drawer is open, update the selected photographer
      if (drawerVisible) {
        const updatedPhotographer = {
          ...selectedPhotographer,
          ...updatedValues,
          photographyStyles: values.photographyStyles, // Keep as array for display
          specialties: values.specialties,
        }
        setSelectedPhotographer(updatedPhotographer)
      }
    } catch (error) {
      message.error("Failed to update photographer")
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (photographerId) => {
    confirm({
      title: "Are you sure you want to delete this photographer?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/admin/photographers/${photographerId}`)
          message.success("Photographer deleted successfully")
          fetchPhotographers() // Refresh the list
          setDrawerVisible(false)
        } catch (error) {
          message.error("Failed to delete photographer")
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
      title: "Years of Experience",
      dataIndex: "yearsOfExperience",
      key: "yearsOfExperience",
      sorter: (a, b) => a.yearsOfExperience - b.yearsOfExperience,
      sortOrder: sortedInfo.columnKey === "yearsOfExperience" && sortedInfo.order,
    },
    {
      title: "Base Price",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price) => `₱${price?.toLocaleString() || "0"}`,
      sorter: (a, b) => a.basePrice - b.basePrice,
      sortOrder: sortedInfo.columnKey === "basePrice" && sortedInfo.order,
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
          <Button type="primary" icon={<EyeOutlined />} onClick={() => showPhotographerDetails(record)} size="small" />
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
        <Button type="primary" onClick={() => fetchPhotographers()}>
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={photographers}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={{ pageSize: 10 }}
      />

      {/* Photographer Detail Drawer */}
      <Drawer
        title={selectedPhotographer?.name}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
        footer={
          selectedPhotographer?.status === "PENDING" ? (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button danger onClick={() => showRejectModal(selectedPhotographer)}>
                Reject
              </Button>
              <Button type="primary" onClick={() => handleApprove(selectedPhotographer?.id)}>
                Approve
              </Button>
            </div>
          ) : null
        }
      >
        {selectedPhotographer && (
          <>
            {/* Photographer Portfolio Images */}
            {selectedPhotographer.portfolioImages && JSON.parse(selectedPhotographer.portfolioImages).length > 0 ? (
              <Carousel autoplay>
                {JSON.parse(selectedPhotographer.portfolioImages).map((image, index) => (
                  <div key={index}>
                    <img
                      src={image}
                      alt={`${selectedPhotographer.name} portfolio ${index + 1}`}
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
                No portfolio images available
              </div>
            )}

            <Descriptions title="Photographer Information" layout="vertical" bordered style={{ marginTop: 16 }}>
              <Descriptions.Item label="Name" span={3}>
                {selectedPhotographer.name}
              </Descriptions.Item>
              <Descriptions.Item label="Provider" span={3}>
                {selectedPhotographer.provider?.name || "Unknown Provider"}
              </Descriptions.Item>
              <Descriptions.Item label="Provider Email" span={3}>
                {selectedPhotographer.provider?.email || "Email not available"}
              </Descriptions.Item>
              <Descriptions.Item label="Provider Phone" span={3}>
                {selectedPhotographer.provider?.phone || "Phone not available"}
              </Descriptions.Item>
              <Descriptions.Item label="Years of Experience" span={1}>
                {selectedPhotographer.yearsOfExperience} years
              </Descriptions.Item>
              <Descriptions.Item label="Base Price" span={2}>
                ₱{selectedPhotographer.basePrice?.toLocaleString() || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={3}>
                {getStatusTag(selectedPhotographer.status)}
                {selectedPhotographer.rejectionReason && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Rejection Reason:</strong> {selectedPhotographer.rejectionReason}
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Photography Styles" span={3}>
                {selectedPhotographer.photographyStyles
                  ? typeof selectedPhotographer.photographyStyles === "string"
                    ? JSON.parse(selectedPhotographer.photographyStyles).map((style, index) => (
                        <Tag key={index} color="blue" style={{ margin: "2px" }}>
                          {style}
                        </Tag>
                      ))
                    : selectedPhotographer.photographyStyles.map((style, index) => (
                        <Tag key={index} color="blue" style={{ margin: "2px" }}>
                          {style}
                        </Tag>
                      ))
                  : "No photography styles listed"}
              </Descriptions.Item>
              <Descriptions.Item label="Specialties" span={3}>
                {selectedPhotographer.specialties
                  ? typeof selectedPhotographer.specialties === "string"
                    ? JSON.parse(selectedPhotographer.specialties).map((specialty, index) => (
                        <Tag key={index} color="purple" style={{ margin: "2px" }}>
                          {specialty}
                        </Tag>
                      ))
                    : selectedPhotographer.specialties.map((specialty, index) => (
                        <Tag key={index} color="purple" style={{ margin: "2px" }}>
                          {specialty}
                        </Tag>
                      ))
                  : "No specialties listed"}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {selectedPhotographer.description}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
              <Button danger onClick={() => handleDelete(selectedPhotographer.id)}>
                Delete Photographer
              </Button>
              <Button type="primary" onClick={() => showEditModal(selectedPhotographer)}>
                Edit Photographer
              </Button>
            </div>
          </>
        )}
      </Drawer>

      {/* Reject Modal */}
      <Modal
        title="Reject Photographer"
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
            <TextArea rows={4} placeholder="Explain why this photographer is being rejected" />
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
        title="Edit Photographer"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditPhotographer}>
          <Form.Item
            name="name"
            label="Photographer Name"
            rules={[{ required: true, message: "Please enter photographer name!" }]}
          >
            <Input placeholder="Enter photographer name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description!" }]}
          >
            <TextArea rows={4} placeholder="Describe the photographer's services" />
          </Form.Item>

          <Form.Item
            name="yearsOfExperience"
            label="Years of Experience"
            rules={[{ required: true, message: "Please enter years of experience!" }]}
          >
            <InputNumber min={0} placeholder="Years of experience" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="basePrice"
            label="Base Price (₱)"
            rules={[{ required: true, message: "Please enter base price!" }]}
          >
            <InputNumber min={0} placeholder="Basic package price" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={actionLoading}>
              Update Photographer
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminPhotographersPage
