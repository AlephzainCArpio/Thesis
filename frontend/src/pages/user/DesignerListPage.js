"use client"

import { useState, useEffect } from "react"
import { Card, Row, Col, Typography, Input, Select, Button, Spin, Empty, Pagination, notification, Tag } from "antd"
import { SearchOutlined, DollarOutlined, EnvironmentOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const { Title, Text } = Typography
const { Option } = Select

const DesignerListPage = () => {
  const navigate = useNavigate()
  const [designers, setDesigners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [eventType, setEventType] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalDesigners, setTotalDesigners] = useState(0)
  const pageSize = 9

  const eventTypes = ["Wedding", "Corporate", "Birthday", "Anniversary", "Graduation", "Other"]

  useEffect(() => {
    fetchDesigners()
  }, [currentPage, sortBy, eventType])

  const fetchDesigners = async () => {
    setLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.append("page", currentPage)
      params.append("limit", pageSize)
      params.append("sortBy", sortBy)

      if (eventType) {
        params.append("eventType", eventType)
      }

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await api.get(`/designers?${params.toString()}`)
      setDesigners(response.data.designers)
      setTotalDesigners(response.data.total || response.data.designers.length)
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to load designers. Please try again.",
      })
      console.error("Error fetching designers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchDesigners()
  }

  const handleViewDetails = (id) => {
    navigate(`/designers/${id}`)
  }

  const renderDesignerCard = (designer) => (
    <Col xs={24} sm={12} md={8} key={designer.id}>
      <Card
        hoverable
        style={{ marginBottom: 16 }}
        cover={
          <div
            style={{
              height: 200,
              overflow: "hidden",
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {designer.images && designer.images.length > 0 ? (
              <img
                alt={designer.name}
                src={designer.images[0] || "/placeholder.svg"}
                style={{ width: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ color: "#999", fontSize: 24 }}>No Image Available</div>
            )}
          </div>
        }
        actions={[
          <Button key="view-details" type="primary" onClick={() => handleViewDetails(designer.id)}>
            View Details
          </Button>,
        ]}
      >
        <Card.Meta
          title={designer.name}
          description={
            <>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">
                  <DollarOutlined /> ${designer.price}
                </Text>
                <br />
                <Text type="secondary">
                  <EnvironmentOutlined /> {designer.location}
                </Text>
              </div>
              <div>
                {designer.eventTypes &&
                  designer.eventTypes.map((type) => (
                    <Tag color="blue" key={type} style={{ marginBottom: 4 }}>
                      {type}
                    </Tag>
                  ))}
              </div>
            </>
          }
        />
      </Card>
    </Col>
  )

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Event Designers</Title>
      <Text type="secondary" style={{ marginBottom: 24, display: "block" }}>
        Find the perfect designer to make your event beautiful and memorable
      </Text>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={8} lg={10}>
            <Input
              placeholder="Search designers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={8} md={8} lg={6}>
            <Select
              placeholder="Filter by event type"
              style={{ width: "100%" }}
              value={eventType}
              onChange={setEventType}
              allowClear
            >
              {eventTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={8} lg={6}>
            <Select placeholder="Sort by" style={{ width: "100%" }} value={sortBy} onChange={setSortBy}>
              <Option value="rating">Highest Rated</Option>
              <Option value="price_asc">Price: Low to High</Option>
              <Option value="price_desc">Price: High to Low</Option>
              <Option value="name">Name</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={2} style={{ textAlign: "right" }}>
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
              Search
            </Button>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : designers.length > 0 ? (
        <>
          <Row gutter={16}>{designers.map((designer) => renderDesignerCard(designer))}</Row>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalDesigners}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Empty description="No designers found matching your criteria" style={{ margin: "40px 0" }} />
      )}
    </div>
  )
}

export default DesignerListPage
