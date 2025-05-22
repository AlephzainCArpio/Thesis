import { useState, useEffect } from "react"
import { Row, Col, Card, Typography, Spin, Empty } from "antd"
import { Link } from "react-router-dom"
import api from "../../services/api"

const { Title, Paragraph } = Typography
const { Meta } = Card

// AdminDashboard reference: expects images to be a JSON array of filenames, served as /uploads/caterings/[filename]
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
    return `${process.env.REACT_APP_API_URL || ""}/uploads/caterings/${imgArr[0]}`
  }
  return "/placeholder.svg?height=200&width=300"
}

const safeParse = (str) => {
  try {
    return str && str !== "" ? JSON.parse(str) : []
  } catch (err) {
    return []
  }
}

const CateringListPage = () => {
  const [caterings, setCaterings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCaterings()
  }, [])

  const fetchCaterings = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/catering")
      setCaterings(response.data.caterings || response.data)
    } catch (error) {
      console.error("Error fetching catering services:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderCateringCard = (catering) => {
    const images = safeParse(catering.images)
    const dietaryOptions = safeParse(catering.dietaryOptions)
    const firstImage = getFirstImageUrl(catering.images)

    return (
      <Col xs={24} sm={12} lg={8} key={catering.id}>
        <Card
          hoverable
          cover={
            <div style={{ height: 200, overflow: "hidden" }}>
              <img
                alt={catering.name}
                src={firstImage}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.onerror = null; e.target.src = "/placeholder.svg?height=200&width=300" }}
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
                <div style={{ marginBottom: 8 }}>Location:  {catering.location}</div>
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
