import { useState, useEffect } from "react"
import { Card, Row, Col, Typography, Spin, Empty } from "antd"
import { Link } from "react-router-dom" 
import api from "../../services/api"

const { Title, Text } = Typography


const getFirstImageUrl = (images) => {
  if (!images) return "/placeholder.svg?height=200&width=300"
  let imgArr
  try {
    imgArr = typeof images === "string" ? JSON.parse(images) : images
    if (!Array.isArray(imgArr)) return "/placeholder.svg?height=200&width=300"
  } catch {
    return "/placeholder.svg?height=200&width=300"
  }
  if (imgArr.length > 0 && typeof imgArr[0] === "string") {
    return `${process.env.REACT_APP_API_URL || ""}/uploads/designers/${imgArr[0]}`
  }
  return "/placeholder.svg?height=200&width=300"
}

const DesignerListPage = () => {
  const [designers, setDesigners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDesigners()
  }, [])

  const fetchDesigners = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/designers")
      setDesigners(response.data.designers || response.data)
    } catch (error) {
      console.error("Error fetching designers:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderDesignerCard = (designer) => {
    const firstImage = getFirstImageUrl(designer.images || designer.portfolio)

    return (
      <Col xs={24} sm={12} md={8} key={designer.id}>
        <Card
          hoverable
          style={{ marginBottom: 16 }}
          cover={
            <div style={{ height: 200, overflow: "hidden" }}>
              <img
                alt={designer.name}
                src={firstImage}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.onerror = null; e.target.src = "/placeholder.svg?height=200&width=300" }}
              />
            </div>
          }
          actions={[
            <Link key="view-details" to={`/user/designers/${designer.id}`}>
              View Details
            </Link>,
          ]}
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