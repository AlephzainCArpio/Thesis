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

const AdminDesignersPage = () => {
  const [designers, setDesigners] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDesigner, setSelectedDesigner] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [filteredInfo, setFilteredInfo] = useState({})
  const [sortedInfo, setSortedInfo] = useState({})

  useEffect(() => {
    fetchDesigners()
  }, [])

  const fetchDesigners = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/designers")
      setDesigners(response.data)
    } catch (error) {
      message.error("Failed to fetch designers")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const showDesignerDetails = (designer) => {
    setSelectedDesigner(designer)
    setDrawerVisible(true)
  }

  const showRejectModal = (designer) => {
    setSelectedDesigner(designer)
    setRejectModalVisible(true)
    form.resetFields()
  }

  const showEditModal = (designer) => {
    setSelectedDesigner(designer)
    setEditModalVisible(true)

    // Parse the design styles and services JSON strings to arrays
    const designStyles = designer.designStyles ? JSON.parse(designer.designStyles) : []
    const designServices = designer.designServices ? JSON.parse(designer.designServices) : []

    editForm.setFieldsValue({
      ...designer,
      designStyles,
      designServices,
    })
  }

  const handleApprove = async (designerId) => {
    confirm({
      title: "Are you sure you want to approve this designer?",
      icon: <ExclamationCircleOutlined />,
      content: "Once approved, the designer will be visible to all users.",
      onOk: async () => {
        try {
          setActionLoading(true)
          await api.patch(`/admin/designers/${designerId}/approve`)
          message.success("Designer approved successfully")
          fetchDesigners() // Refresh the list
          setDrawerVisible(false)
        } catch (error) {
          message.error("Failed to approve designer")
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
      await api.patch(`/admin/designers/${selectedDesigner.id}/reject`, {
        reason: values.reason,
      })
      message.success("Designer rejected")
      setRejectModalVisible(false)
      fetchDesigners() // Refresh the list
      setDrawerVisible(false)
    } catch (error) {
      message.error("Failed to reject designer")
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditDesigner = async (values) => {
    try {
      setActionLoading(true)

      // Format the arrays to JSON strings
      const updatedValues = {
        ...values,
        designStyles: JSON.stringify(values.designStyles),
        designServices: JSON.stringify(values.designServices),
      }

      await api.put(`/admin/designers/${selectedDesigner.id}`, updatedValues)
      message.success("Designer updated successfully")
      fetchDesigners() // Refresh the list
      setEditModalVisible(false)

      // If drawer is open, update the selected designer
      if (drawerVisible) {
        const updatedDesigner = {
          ...selectedDesigner,
          ...updatedValues,
          designStyles: values.designStyles, // Keep as array for display
          designServices: values.designServices,
        }
        setSelectedDesigner(updatedDesigner)
      }
    } catch (error) {
      message.error("Failed to update designer")
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (designerId) => {
    confirm({
      title: "Are you sure you want to delete this designer?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/admin/designers/${designerId}`)
          message.success("Designer deleted successfully")
          fetchDesigners() // Refresh the list
          setDrawerVisible(false)
        } catch (error) {
          message.error("Failed to delete designer")
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
      title: "Experience Level",
      dataIndex: "experienceLevel",
      key: "experienceLevel",
      filters: [
        { text: "Beginner", value: "BEGINNER" },
        { text: "Intermediate", value: "INTERMEDIATE" },
        { text: "Expert", value: "EXPERT" },
      ],
      filteredValue: filteredInfo.experienceLevel || null,
      onFilter: (value, record) => record.experienceLevel === value,
      render: (level) => {
        const levels = {
          BEGINNER: { color: "green" },
          INTERMEDIATE: { color: "blue" },
          EXPERT: { color: "purple" },
        }

        return <Tag color={levels[level]?.color || "default"}>{level}</Tag>
      },
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
          <Button type="primary" icon={<EyeOutlined />} onClick={() => showDesignerDetails(record)} size="small" />
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
        <Button type="primary" onClick={() => fetchDesigners()}>
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={designers}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={{ pageSize: 10 }}
      />

      {/* Designer Detail Drawer */}
      <Drawer
        title={selectedDesigner?.name}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
        footer={
          selectedDesigner?.status === "PENDING" ? (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button danger onClick={() => showRejectModal(selectedDesigner)}>
                Reject
              </Button>
              <Button type="primary" onClick={() => handleApprove(selectedDesigner?.id)}>
                Approve
              </Button>
            </div>
          ) : null
        }
      >
        {selectedDesigner && (
          <>
            {/* Designer Portfolio Images */}
            {selectedDesigner.portfolioImages && JSON.parse(selectedDesigner.portfolioImages).length > 0 ? (
              <Carousel autoplay>
                {JSON.parse(selectedDesigner.portfolioImages).map((image, index) => (
                  <div key={index}>
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${selectedDesigner.name} portfolio ${index + 1}`}
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

            <Descriptions title="Designer Information" layout="vertical" bordered style={{ marginTop: 16 }}>
              <Descriptions.Item label="Name" span={3}>
                {selectedDesigner.name}
              </Descriptions.Item>
              <Descriptions.Item label="Provider" span={3}>
                {selectedDesigner.provider?.name || "Unknown Provider"}
              </Descriptions.Item>
              <Descriptions.Item label="Provider Email" span={3}>
                {selectedDesigner.provider?.email || "Email not available"}
              </Descriptions.Item>
              <Descriptions.Item label="Provider Phone" span={3}>
                {selectedDesigner.provider?.phone || "Phone not available"}
              </Descriptions.Item>
              <Descriptions.Item label="Experience Level" span={1}>
                <Tag
                  color={
                    selectedDesigner.experienceLevel === "BEGINNER"
                      ? "green"
                      : selectedDesigner.experienceLevel === "INTERMEDIATE"
                        ? "blue"
                        : selectedDesigner.experienceLevel === "EXPERT"
                          ? "purple"
                          : "default"
                  }
                >
                  {selectedDesigner.experienceLevel}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                {getStatusTag(selectedDesigner.status)}
                {selectedDesigner.status === "REJECTED" && (
                  <span style={{ marginLeft: 8 }}>Reason: {selectedDesigner.rejectionReason || "Not specified"}</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Base Price" span={1}>
                ₱{selectedDesigner.basePrice?.toLocaleString() || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="Rush Fee" span={2}>
                ₱{selectedDesigner.rushFee?.toLocaleString() || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="Design Styles" span={3}>
                {selectedDesigner.designStyles
                  ? (typeof selectedDesigner.designStyles === "string"
                      ? JSON.parse(selectedDesigner.designStyles)
                      : selectedDesigner.designStyles
                    ).map((style, index) => (
                      <Tag key={index} color="blue" style={{ margin: "2px" }}>
                        {style}
                      </Tag>
                    ))
                  : "No design styles specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Design Services" span={3}>
                {selectedDesigner.designServices
                  ? (typeof selectedDesigner.designServices === "string"
                      ? JSON.parse(selectedDesigner.designServices)
                      : selectedDesigner.designServices
                    ).map((service, index) => (
                      <Tag key={index} color="green" style={{ margin: "2px" }}>
                        {service}
                      </Tag>
                    ))
                  : "No design services specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Bio" span={3}>
                {selectedDesigner.bio || "No bio available"}
              </Descriptions.Item>
              <Descriptions.Item label="Created At" span={3}>
                {new Date(selectedDesigner.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At" span={3}>
                {new Date(selectedDesigner.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>

      {/* Reject Modal */}
      <Modal
        title="Reject Designer"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[{ required: true, message: "Please provide a rejection reason" }]}
          >
            <TextArea rows={4} placeholder="Why are you rejecting this designer application?" />
          </Form.Item>
          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button style={{ marginRight: 8 }} onClick={() => setRejectModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" danger htmlType="submit" loading={actionLoading}>
                Reject
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Designer Modal */}
      <Modal
        title="Edit Designer"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditDesigner}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter designer name" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="experienceLevel"
            label="Experience Level"
            rules={[{ required: true, message: "Please select experience level" }]}
          >
            <Select>
              <Option value="BEGINNER">Beginner</Option>
              <Option value="INTERMEDIATE">Intermediate</Option>
              <Option value="EXPERT">Expert</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="basePrice"
            label="Base Price (₱)"
            rules={[{ required: true, message: "Please enter base price" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="rushFee" label="Rush Fee (₱)" rules={[{ required: true, message: "Please enter rush fee" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="designStyles"
            label="Design Styles"
            rules={[{ required: true, message: "Please select at least one design style" }]}
          >
            <Select mode="multiple" placeholder="Select design styles">
              <Option value="Modern">Modern</Option>
              <Option value="Minimalist">Minimalist</Option>
              <Option value="Industrial">Industrial</Option>
              <Option value="Traditional">Traditional</Option>
              <Option value="Scandinavian">Scandinavian</Option>
              <Option value="Bohemian">Bohemian</Option>
              <Option value="Contemporary">Contemporary</Option>
              <Option value="Rustic">Rustic</Option>
              <Option value="Coastal">Coastal</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="designServices"
            label="Design Services"
            rules={[{ required: true, message: "Please select at least one design service" }]}
          >
            <Select mode="multiple" placeholder="Select design services">
              <Option value="Interior Design">Interior Design</Option>
              <Option value="Space Planning">Space Planning</Option>
              <Option value="3D Visualization">3D Visualization</Option>
              <Option value="Furniture Selection">Furniture Selection</Option>
              <Option value="Color Consultation">Color Consultation</Option>
              <Option value="Lighting Design">Lighting Design</Option>
              <Option value="Home Staging">Home Staging</Option>
              <Option value="Renovation Planning">Renovation Planning</Option>
            </Select>
          </Form.Item>

          <Form.Item name="bio" label="Bio">
            <TextArea rows={4} placeholder="Designer bio" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button style={{ marginRight: 8 }} onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={actionLoading}>
                Save Changes
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminDesignersPage
