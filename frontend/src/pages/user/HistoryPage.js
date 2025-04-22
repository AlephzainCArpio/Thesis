import { useState, useEffect } from "react"
import { Table, Tag, Button, Card, Typography, Spin, Empty, Tabs, message, Space } from "antd"
import {
  EyeOutlined,
  HistoryOutlined,
  HomeOutlined,
  ShopOutlined,
  CameraOutlined,
  BgColorsOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"
import api from "../../services/api"

const { Title, Paragraph } = Typography
const { TabPane } = Tabs

const HistoryPage = () => {
  const [loading, setLoading] = useState(true)
  const [viewHistory, setViewHistory] = useState([])
  const [activeTab, setActiveTab] = useState("views")

  useEffect(() => {
    if (activeTab === "views") {
      fetchViewHistory()
    }
  }, [activeTab])

  const fetchViewHistory = async () => {
    try {
      setLoading(true)
      const response = await api.get("/users/history")
      setViewHistory(response.data)
    } catch (error) {
      console.error("Error fetching view history:", error)
      message.error("Failed to load view history")
    } finally {
      setLoading(false)
    }
  }

  const deleteViewHistory = async (id) => {
    try {
      await api.delete(`/users/history/${id}`)
      message.success("View history entry deleted")
      fetchViewHistory()
    } catch (error) {
      console.error("Error deleting view history:", error)
      message.error("Failed to delete view history entry")
    }
  }

  const getServiceIcon = (type) => {
    switch (type) {
      case "venue":
        return <HomeOutlined />
      case "catering":
        return <ShopOutlined />
      case "photographer":
        return <CameraOutlined />
      case "designer":
        return <BgColorsOutlined />
      default:
        return <EyeOutlined />
    }
  }

  const getServiceUrl = (type, id) => {
    switch (type) {
      case "venue":
        return `/user/venues/${id}`
      case "catering":
        return `/user/catering/${id}`
      case "photographer":
        return `/user/photographers/${id}`
      case "designer":
        return `/user/designers/${id}`
      default:
        return "#"
    }
  }

  const viewHistoryColumns = [
    {
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
      render: (type) => (
        <Tag
          icon={getServiceIcon(type)}
          color={
            type === "venue" ? "blue" : type === "catering" ? "orange" : type === "photographer" ? "green" : "purple"
          }
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
      filters: [
        { text: "Venue", value: "venue" },
        { text: "Catering", value: "catering" },
        { text: "Photographer", value: "photographer" },
        { text: "Designer", value: "designer" },
      ],
      onFilter: (value, record) => record.serviceType === value,
    },
    {
      title: "Name",
      dataIndex: "serviceName",
      key: "serviceName",
      sorter: (a, b) => a.serviceName.localeCompare(b.serviceName),
    },
    {
      title: "Viewed On",
      dataIndex: "viewedAt",
      key: "viewedAt",
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.viewedAt) - new Date(b.viewedAt),
      defaultSortOrder: "descend",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            as={Link}
            to={getServiceUrl(record.serviceType, record.serviceId)}
          >
            View
          </Button>
          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => deleteViewHistory(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ]


  return (
    <div className="history-page">
      <Title level={2}>My History</Title>
      <Paragraph>Track your viewed services.</Paragraph>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <HistoryOutlined /> View History
            </span>
          }
          key="views"
        >
          <Card>
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <Spin size="large" />
              </div>
            ) : viewHistory.length > 0 ? (
              <Table columns={viewHistoryColumns} dataSource={viewHistory} rowKey="id" pagination={{ pageSize: 10 }} />
            ) : (
              <Empty description="No view history found" />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default HistoryPage
