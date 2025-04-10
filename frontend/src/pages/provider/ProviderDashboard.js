"use client"

import { useState, useEffect } from "react"
import { Table, Button, Tag, Modal, Form, Input, Select, Upload, message, Spin, Space } from "antd"
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"

const { Option } = Select

const ProviderDashboard = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [form] = Form.useForm()

  const { currentUser } = useAuth()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await api.get("/provider/services")
      setServices(response.data)
    } catch (error) {
      console.error("Failed to fetch services:", error)
      message.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    form.setFieldsValue({
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category,
      location: service.location,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (serviceId) => {
    try {
      await api.delete(`/provider/services/${serviceId}`)
      message.success("Service deleted successfully")
      fetchServices()
    } catch (error) {
      console.error("Failed to delete service:", error)
      message.error("Failed to delete service")
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingService(null)
    form.resetFields()
  }

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingService) {
        await api.put(`/provider/services/${editingService.id}`, values)
        message.success("Service updated successfully")
      } else {
        await api.post("/provider/services", values)
        message.success("Service added successfully")
      }

      setIsModalVisible(false)
      setEditingService(null)
      form.resetFields()
      fetchServices()
    } catch (error) {
      console.error("Failed to save service:", error)
      message.error("Failed to save service")
    }
  }

  const getStatusTag = (status) => {
    switch (status) {
      case "approved":
        return (
          <Tag color="green">
            <CheckCircleOutlined /> Approved
          </Tag>
        )
      case "pending":
        return (
          <Tag color="gold">
            <ClockCircleOutlined /> Pending
          </Tag>
        )
      case "rejected":
        return (
          <Tag color="red">
            <CloseCircleOutlined /> Rejected
          </Tag>
        )
      default:
        return <Tag color="default">{status}</Tag>
    }
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "Venue", value: "venue" },
        { text: "Catering", value: "catering" },
        { text: "Photography", value: "photography" },
        { text: "Design", value: "design" },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Approved", value: "approved" },
        { text: "Pending", value: "pending" },
        { text: "Rejected", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Bookings",
      dataIndex: "bookingsCount",
      key: "bookingsCount",
      sorter: (a, b) => a.bookingsCount - b.bookingsCount,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => (window.location.href = `/provider/services/${record.id}`)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            disabled={record.status === "rejected"}
          />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="provider-service-manager">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Manage Services</h2>
        <Button
          type="primary"
          onClick={() => {
            setEditingService(null)
            form.resetFields()
            setIsModalVisible(true)
          }}
        >
          Add New Service
        </Button>
      </div>

      <Table columns={columns} dataSource={services} rowKey="id" pagination={{ pageSize: 10 }} />

      <Modal
        title={editingService ? "Edit Service" : "Add New Service"}
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalSubmit}
        okText={editingService ? "Update" : "Create"}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Service Name"
            rules={[{ required: true, message: "Please enter the service name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true, message: "Please select a category" }]}>
            <Select>
              <Option value="venue">Venue</Option>
              <Option value="catering">Catering</Option>
              <Option value="photography">Photography</Option>
              <Option value="design">Design</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[
              { required: true, message: "Please enter the price" },
              { type: "number", min: 0, message: "Price must be a positive number" },
            ]}
          >
            <Input type="number" prefix="$" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please enter the location" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="images" label="Images">
            <Upload listType="picture" beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>Upload Images</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProviderDashboard
