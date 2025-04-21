"use client"

import { useState, useEffect } from "react"
import { Row, Col, Card, Typography, Spin, Empty } from "antd"
import { Link } from "react-router-dom"
import api from "../../services/api"

const { Title, Paragraph } = Typography
const { Meta } = Card

const CateringListPage = () => {
  const [caterings, setCaterings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCaterings()
  }, [])

  const fetchCaterings = async () => {
    try {
      setLoading(true)
      const response = await api.get("/catering")
      setCaterings(response.data.caterings || response.data)
    } catch (error) {
      console.error("Error fetching catering services:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderCateringCard = (catering) => {
    // Parse images from JSON string
    const images = catering.images ? JSON.parse(catering.images) : []
    const firstImage = images.length > 0 ? images[0] : "/placeholder.svg?height=200&width=300"

    // Parse dietary options from JSON string
    const dietaryOptions = catering.dietaryOptions ? JSON.parse(catering.dietaryOptions) : []

    return (
      <Col xs={24} sm={12} lg={8} key={catering.id}>
        <Card
          hoverable
          cover={
            <div style={{ height: 200, overflow: "hidden" }}>
              <img
                alt={catering.name}
                src={firstImage || "/placeholder.svg"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          }
          actions={[
            <Link key="view-details" to={`/user/catering/${catering.id}`}>
              View Details
            </Link>,
          ]}
        >
          <Meta
            title={catering.name}
            description={
              <>
                <div style={{ marginBottom: 8 }}>Location: {catering.location}</div>
                <div style={{ marginBottom: 8 }}>Max People: {catering.maxPeople}</div>
                <div style={{ marginBottom: 8 }}>
                  Price Per Person: ₱{catering.pricePerPerson?.toLocaleString() || "0"}
                </div>
                <div style={{ marginBottom: 8 }}>Cuisine Type: {catering.cuisineType}</div>
              </>
            }
          />
        </Card>
      </Col>
    )
  }

  return (
    <div className="catering-list-page">
      <Title level={2}>Find Your Perfect Catering Service</Title>
      <Paragraph>Browse through our collection of catering services for your special event.</Paragraph>

      {/* Caterings List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : caterings.length > 0 ? (
        <Row gutter={[24, 24]}>{caterings.map(renderCateringCard)}</Row>
      ) : (
        <Empty description="No catering services found" style={{ margin: "40px 0" }} />
      )}
    </div>
  )
}

export default CateringListPage
