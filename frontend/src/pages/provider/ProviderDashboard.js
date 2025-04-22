import React, { useState, useEffect } from "react"
import { Table, Button, Tag, message, Spin } from "antd"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"

const ProviderDashboard = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
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
      message.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status) => {
    switch (status) {
      case "approved":
        return <Tag color="green">Approved</Tag>
      case "pending":
        return <Tag color="gold">Pending</Tag>
      case "rejected":
        return <Tag color="red">Rejected</Tag>
      default:
        return <Tag color="default">{status}</Tag>
    }
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => (window.location.href = `/provider/services/${record.id}`)}>
          View
        </Button>
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

  return <Table columns={columns} dataSource={services} rowKey="id" pagination={{ pageSize: 10 }} />
}

export default ProviderDashboard