import { useState, useEffect } from "react"
import { Card, Row, Col, Typography, Spin, Empty } from "antd"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const { Title, Text } = Typography

const DesignerListPage = () => {
  const navigate = useNavigate()
  const [designers, setDesigners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDesigners()
  }, [])

  const fetchDesigners = async () => {
    try {
      setLoading(true)
      const response = await api.get("/designers")
      setDesigners(response.data.designers || response.data)
    } catch (error) {
      console.error("Error fetching designers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (id) => {
    navigate(`/user/designers/${id}`)
  }

  const renderDesignerCard = (designer) => {
    // Parse images from JSON string
    const images = designer.portfolio ? JSON.parse(designer.portfolio) : []
    const firstImage = images.length > 0 ? images[0] : "/placeholder.svg?height=200&width=300"

    return (
      <Col xs={24} sm={12} md={8} key={designer.id}>
        <Card
          hoverable
          style={{ marginBottom: 16 }}
          cover={
            <div style={{ height: 200, overflow: "hidden" }}>
              <img
                alt={designer.name}
                src={firstImage || "/placeholder.svg"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          }
          onClick={() => handleViewDetails(designer.id)}
        >
          <Card.Meta
            title={designer.name}
            description={
              <>
                <div style={{ marginBottom: 8 }}>Location: {designer.location}</div>
                <div style={{ marginBottom: 8 }}>Style: {designer.style}</div>
                <div style={{ marginBottom: 8 }}>Price Range: {designer.priceRange}</div>
              </>
            }
          />
        </Card>
      </Col>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Event Designers</Title>
      <Text type="secondary" style={{ marginBottom: 24, display: "block" }}>
        Find the perfect designer to make your event beautiful and memorable
      </Text>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : designers.length > 0 ? (
        <Row gutter={16}>{designers.map((designer) => renderDesignerCard(designer))}</Row>
      ) : (
        <Empty description="No designers found" style={{ margin: "40px 0" }} />
      )}
    </div>
  )
}

export default DesignerListPage
  