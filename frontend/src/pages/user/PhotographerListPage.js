import { useState, useEffect } from "react"
import { Card, Typography, Row, Col, Spin, Empty } from "antd"
import { Link } from "react-router-dom"
import api from "../../services/api"

const { Title, Paragraph } = Typography
const { Meta } = Card
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
    return `${process.env.REACT_APP_API_URL || ""}/uploads/photographers/${imgArr[0]}`
  }
  return "/placeholder.svg?height=200&width=300"
}

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

  const renderPhotographerCard = (photographer) => {
    const firstImage = getFirstImageUrl(photographer.images || photographer.portfolio)

    return (
      <Col xs={24} sm={12} md={8} key={photographer.id}>
        <Card
          hoverable
          cover={
            <div style={{ height: 200, overflow: "hidden" }}>
              <img
                alt={photographer.name}
                src={firstImage}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.onerror = null; e.target.src = "/placeholder.svg?height=200&width=300" }}
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