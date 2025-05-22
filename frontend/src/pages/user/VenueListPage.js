"use client"

import { useState, useEffect } from "react"
import { Row, Col, Card, Typography, Spin, Empty } from "antd"
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
    return `${process.env.REACT_APP_API_URL || ""}/uploads/venues/${imgArr[0]}`
  }
  return "/placeholder.svg?height=200&width=300"
}

const VenueListPage = () => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0,
  })

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/venues")
      setVenues(response.data.venues || response.data)
      if (response.data.total) {
        setPagination({
          ...pagination,
          total: response.data.total,
        })
      }
    } catch (error) {
      console.error("Error fetching venues:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderVenueCard = (venue) => {
    const firstImage = getFirstImageUrl(venue.images)

    return (
      <Col xs={24} sm={12} lg={8} key={venue.id}>
        <Card
          hoverable
          cover={
            <div style={{ height: 200, overflow: "hidden" }}>
              <img
                alt={venue.name}
                src={firstImage}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.onerror = null; e.target.src = "/placeholder.svg?height=200&width=300" }}
              />
            </div>
          }
          actions={[
            <Link key="view-details" to={`/user/venues/${venue.id}`}>
              View Details
            </Link>,
          ]}
        >
          <Meta
            title={venue.name}
            description={
              <>
                <div style={{ marginBottom: 8 }}>Location: {venue.location}</div>
                <div style={{ marginBottom: 8 }}>Capacity: {venue.capacity} guests</div>
                <div style={{ marginBottom: 8 }}>Price: ₱{venue.price?.toLocaleString() || "0"}</div>
              </>
            }
          />
        </Card>
      </Col>
    )
  }

  return (
    <div className="venue-list-page">
      <Title level={2}>Find Your Perfect Venue</Title>
      <Paragraph>Browse through our collection of venues for your special event.</Paragraph>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : venues.length > 0 ? (
        <Row gutter={[24, 24]}>{venues.map(renderVenueCard)}</Row>
      ) : (
        <Empty description="No venues found" style={{ margin: "40px 0" }} />
      )}
    </div>
  )
}

export default VenueListPage
