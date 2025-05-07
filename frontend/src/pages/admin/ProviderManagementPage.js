import { useState, useEffect } from "react"
import { Table, Button, Modal, Space, Card, Typography, Image, message, Spin, Tag } from "antd"
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons"
import api from "../../services/api"

const { Title, Text } = Typography

const ProviderManagementPage = () => {
  const [pendingProviders, setPendingProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewingProvider, setViewingProvider] = useState(null)
  const [documentVisible, setDocumentVisible] = useState(false)
  const [documentUrl, setDocumentUrl] = useState("")
  const [documentLoading, setDocumentLoading] = useState(false)

  useEffect(() => {
    fetchPendingProviders()
  }, [])

  const fetchPendingProviders = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/admin/pending-providers")
      setPendingProviders(response.data)
    } catch (error) {
      message.error("Failed to fetch pending providers")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = async (provider) => {
    try {
      setDocumentLoading(true)
      setViewingProvider(provider)
      setDocumentUrl(`${api.defaults.baseURL}/uploads/${provider.verificationDoc}`)
      setDocumentVisible(true)
    } catch (error) {
      message.error("Failed to load document")
      console.error(error)
    } finally {
      setDocumentLoading(false)
    }
  }

  const handleApproveProvider = async (id) => {
    try {
      await api.put(`/api/admin/approve-provider/${id}`)
      message.success("Provider approved successfully")
      fetchPendingProviders()
    } catch (error) {
      message.error("Failed to approve provider")
      console.error(error)
    }
  }

  const handleRejectProvider = async (id) => {
    try {
      await api.put(`/api/admin/reject-provider/${id}`)
      message.success("Provider rejected and converted to regular user")
      fetchPendingProviders()
    } catch (error) {
      message.error("Failed to reject provider")
      console.error(error)
    }
  }

  const getProviderTypeColor = (type) => {
    switch (type) {
      case "VENUE":
        return "blue"
      case "CATERING":
        return "orange"
      case "PHOTOGRAPHER":
        return "green"
      case "DESIGNER":
        return "purple"
      default:
        return "default"
    }
  }

  const formatProviderType = (type) => {
    if (!type) return "Not specified"
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() 
  }
  
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
      render: (type) => <Tag color={getProviderTypeColor(type)}>{formatProviderType(type)}</Tag>,
    },
    {
      title: "Registration Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, provider) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDocument(provider)}
            title="View verification document"
          >
            View Document
          </Button>
          <Button 
            type="primary" 
            icon={<CheckOutlined />} 
            onClick={() => handleApproveProvider(provider.id)}
            title="Approve provider"
          >
            Approve
          </Button>
          <Button 
            danger 
            icon={<CloseOutlined />} 
            onClick={() => handleRejectProvider(provider.id)}
            title="Reject provider"
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="provider-management">
      <Title level={2}>Provider Verification</Title>
      <Text type="secondary">
        Review and verify service providers who have applied for an account.
      </Text>

      <Card style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p style={{ marginTop: "20px" }}>Loading providers...</p>
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={pendingProviders} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "No pending provider applications" }}
          />
        )}
      </Card>

      <Modal
        title={`Verification Document - ${viewingProvider?.name}`}
        open={documentVisible}
        onCancel={() => setDocumentVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDocumentVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {documentLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p style={{ marginTop: "20px" }}>Loading document...</p>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <Image
              src={documentUrl}
              alt="Verification Document"
              style={{ maxWidth: "100%" }}
              fallback="https://via.placeholder.com/800x600.png?text=Document+Not+Available"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProviderManagementPage