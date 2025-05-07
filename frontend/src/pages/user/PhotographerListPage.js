import { useState, useEffect } from "react"
import { Card, Typography, Row, Col, Spin, Empty } from "antd"
import { Link } from "react-router-dom"
import api from "../../services/api"

const { Title, Paragraph } = Typography
const { Meta } = Card

const PhotographerListPage = () => {
  const [photographers, setPhotographers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPhotographers()
  }, [])

  const fetchPhotographers = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/photographers")
      setPhotographers(response.data.photographers || response.data)
    } catch (error) {
      console.error("Failed to fetch photographers:", error)
    } finally {
      setLoading(false)
    }
  }

  const safeJsonParse = (jsonString) => {
    try {
      return jsonString ? JSON.parse(jsonString) : []
    } catch (error) {
      console.warn('Failed to parse JSON:', error)
      return []
    }
  }

  const renderPhotographerCard = (photographer) => {
    // Safely parse the portfolio JSON
    const images = safeJsonParse(photographer.portfolio)
    const firstImage = images.length > 0 ? images[0] : "/placeholder.svg?height=200&width=300"

    return (
      <Col xs={24} sm={12} md={8} key={photographer.id}>
        <Card
          hoverable
          cover={
            <div style={{ height: 200, overflow: "hidden" }}>
              <img
                alt={photographer.name}
                src={firstImage || "/placeholder.svg"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          }
          actions={[
            <Link key="view-details" to={`/user/photographers/${photographer.id}`}>
              View Details
            </Link>,
          ]}
        >
          <Meta
            title={photographer.name}
            description={
              <>
                <div style={{ marginBottom: 8 }}>Location: {photographer.location}</div>
                <div style={{ marginBottom: 8 }}>Experience: {photographer.experienceYears} years</div>
                <div style={{ marginBottom: 8 }}>Style: {photographer.style}</div>
                <div style={{ marginBottom: 8 }}>Price Range: {photographer.priceRange}</div>
              </>
            }
          />
        </Card>
      </Col>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Find Your Perfect Photographer</Title>
      <Paragraph>
        Browse our curated selection of professional photographers for your event, portrait session, or commercial
        needs.
      </Paragraph>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : photographers.length === 0 ? (
        <Empty description="No photographers found" style={{ margin: "40px 0" }} />
      ) : (
        <Row gutter={[16, 16]}>{photographers.map(renderPhotographerCard)}</Row>
      )}
    </div>
  )
}

export default PhotographerListPage