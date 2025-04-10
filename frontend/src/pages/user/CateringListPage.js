"use client"

import { useState, useEffect } from "react"
import { Row, Col, Card, Input, Select, Button, Slider, Tag, Pagination, Empty, Spin, message, Typography } from "antd"
import {
  SearchOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  SortAscendingOutlined,
  CoffeeOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"
import api from "../../services/api"

const { Title, Paragraph } = Typography
const { Option } = Select
const { Meta } = Card

const CateringListPage = () => {
  const [caterings, setCaterings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: "",
    minPeople: 0,
    maxPeople: 1000,
    minPrice: 0,
    maxPrice: 10000,
    cuisineType: [],
    serviceType: [],
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0,
  })
  const [sortBy, setSortBy] = useState("price_asc")

  useEffect(() => {
    fetchCaterings()
  }, [pagination.current, sortBy])

  const fetchCaterings = async () => {
    try {
      setLoading(true)

      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy,
        ...filters,
      }

      const response = await api.get("/catering", { params })

      setCaterings(response.data.caterings)
      setPagination({
        ...pagination,
        total: response.data.total,
      })
    } catch (error) {
      console.error("Error fetching catering services:", error)
      message.error("Failed to load catering services. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({
      ...pagination,
      current: 1,
    })
    fetchCaterings()
  }

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    })
  }

  const handleSortChange = (value) => {
    setSortBy(value)
  }

  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      current: page,
    })
  }

  const renderCateringCard = (catering) => {
    // Parse images from JSON string
    const images = catering.images ? JSON.parse(catering.images) : []
    const firstImage = images.length > 0 ? images[0] : "https://via.placeholder.com/300x200?text=No+Image"

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
                <div style={{ marginBottom: 8 }}>
                  <EnvironmentOutlined /> {catering.location}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <TeamOutlined /> Max People: {catering.maxPeople}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <DollarOutlined /> ₱{catering.pricePerPerson?.toLocaleString()} per person
                </div>
                <div style={{ marginBottom: 8 }}>
                  <CoffeeOutlined /> {catering.cuisineType}
                </div>
                <div>
                  {dietaryOptions.slice(0, 3).map((option, index) => (
                    <Tag key={index} color="green">
                      {option}
                    </Tag>
                  ))}
                  {dietaryOptions.length > 3 && <Tag>+{dietaryOptions.length - 3} more</Tag>}
                </div>
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

      {/* Filters Section */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Location"
              prefix={<EnvironmentOutlined />}
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Max People"
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("minPeople", value)}
            >
              <Option value={0}>Any</Option>
              <Option value={50}>50+ people</Option>
              <Option value={100}>100+ people</Option>
              <Option value={200}>200+ people</Option>
              <Option value={500}>500+ people</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <div>
              <div style={{ marginBottom: 6 }}>Price Per Person (₱)</div>
              <Slider
                range
                min={0}
                max={10000}
                step={100}
                defaultValue={[filters.minPrice, filters.maxPrice]}
                onChange={(values) => {
                  handleFilterChange("minPrice", values[0])
                  handleFilterChange("maxPrice", values[1])
                }}
                tipFormatter={(value) => `₱${value.toLocaleString()}`}
              />
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} style={{ width: "100%" }}>
              Search
            </Button>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Select
                mode="multiple"
                placeholder="Cuisine Type"
                style={{ width: "100%" }}
                onChange={(values) => handleFilterChange("cuisineType", values)}
              >
                <Option value="filipino">Filipino</Option>
                <Option value="chinese">Chinese</Option>
                <Option value="japanese">Japanese</Option>
                <Option value="korean">Korean</Option>
                <Option value="italian">Italian</Option>
                <Option value="american">American</Option>
                <Option value="mediterranean">Mediterranean</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <Select
                mode="multiple"
                placeholder="Service Type"
                style={{ width: "100%" }}
                onChange={(values) => handleFilterChange("serviceType", values)}
              >
                <Option value="buffet">Buffet</Option>
                <Option value="plated">Plated Service</Option>
                <Option value="family-style">Family Style</Option>
                <Option value="cocktail">Cocktail Reception</Option>
                <Option value="food-stations">Food Stations</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="Sort by"
                style={{ width: "100%" }}
                defaultValue={sortBy}
                onChange={handleSortChange}
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="price_asc">Price: Low to High</Option>
                <Option value="price_desc">Price: High to Low</Option>
                <Option value="maxPeople_asc">Capacity: Low to High</Option>
                <Option value="maxPeople_desc">Capacity: High to Low</Option>
                <Option value="name_asc">Name: A to Z</Option>
              </Select>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Caterings List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : caterings.length > 0 ? (
        <>
          <Row gutter={[24, 24]}>{caterings.map(renderCateringCard)}</Row>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Empty description="No catering services found matching your criteria" style={{ margin: "40px 0" }} />
      )}
    </div>
  )
}

export default CateringListPage
