"use client"

import { useState, useEffect } from "react"
import { Row, Col, Card, Input, Select, Button, Slider, Tag, Pagination, Empty, Spin, message, Typography } from "antd"
import {
  SearchOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"
import api from "../../services/api"

const { Title, Paragraph } = Typography
const { Option } = Select
const { Meta } = Card

const VenueListPage = () => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: "",
    minCapacity: 0,
    maxCapacity: 1000,
    minPrice: 0,
    maxPrice: 100000,
    amenities: [],
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0,
  })
  const [sortBy, setSortBy] = useState("price_asc")

  useEffect(() => {
    fetchVenues()
  }, [pagination.current, sortBy])

  const fetchVenues = async () => {
    try {
      setLoading(true)

      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy,
        ...filters,
      }

      const response = await api.get("/venues", { params })

      setVenues(response.data.venues)
      setPagination({
        ...pagination,
        total: response.data.total,
      })
    } catch (error) {
      console.error("Error fetching venues:", error)
      message.error("Failed to load venues. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({
      ...pagination,
      current: 1,
    })
    fetchVenues()
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

  const renderVenueCard = (venue) => {
    // Parse images from JSON string
    const images = venue.images ? JSON.parse(venue.images) : []
    const firstImage = images.length > 0 ? images[0] : "https://via.placeholder.com/300x200?text=No+Image"

    // Parse amenities from JSON string
    const amenities = venue.amenities ? JSON.parse(venue.amenities) : []

    return (
      <Col xs={24} sm={12} lg={8} key={venue.id}>
        <Card
          hoverable
          cover={
            <div style={{ height: 200, overflow: "hidden" }}>
              <img
                alt={venue.name}
                src={firstImage || "/placeholder.svg"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                <div style={{ marginBottom: 8 }}>
                  <EnvironmentOutlined /> {venue.location}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <TeamOutlined /> Capacity: {venue.capacity} guests
                </div>
                <div style={{ marginBottom: 8 }}>
                  <DollarOutlined /> ₱{venue.price.toLocaleString()}
                </div>
                <div>
                  {amenities.slice(0, 3).map((amenity, index) => (
                    <Tag key={index} color="blue">
                      {amenity}
                    </Tag>
                  ))}
                  {amenities.length > 3 && <Tag>+{amenities.length - 3} more</Tag>}
                </div>
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
              placeholder="Capacity"
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("minCapacity", value)}
            >
              <Option value={0}>Any</Option>
              <Option value={50}>50+ guests</Option>
              <Option value={100}>100+ guests</Option>
              <Option value={200}>200+ guests</Option>
              <Option value={500}>500+ guests</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <div>
              <div style={{ marginBottom: 6 }}>Price Range (₱)</div>
              <Slider
                range
                min={0}
                max={100000}
                step={5000}
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
            <Col xs={24} md={18}>
              <Select
                mode="multiple"
                placeholder="Select amenities"
                style={{ width: "100%" }}
                onChange={(values) => handleFilterChange("amenities", values)}
              >
                <Option value="parking">Parking</Option>
                <Option value="wifi">WiFi</Option>
                <Option value="air-conditioning">Air Conditioning</Option>
                <Option value="sound-system">Sound System</Option>
                <Option value="catering">In-house Catering</Option>
                <Option value="outdoor-space">Outdoor Space</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Sort by"
                style={{ width: "100%" }}
                defaultValue={sortBy}
                onChange={handleSortChange}
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="price_asc">Price: Low to High</Option>
                <Option value="price_desc">Price: High to Low</Option>
                <Option value="capacity_asc">Capacity: Low to High</Option>
                <Option value="capacity_desc">Capacity: High to Low</Option>
                <Option value="name_asc">Name: A to Z</Option>
              </Select>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Venues List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : venues.length > 0 ? (
        <>
          <Row gutter={[24, 24]}>{venues.map(renderVenueCard)}</Row>

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
        <Empty description="No venues found matching your criteria" style={{ margin: "40px 0" }} />
      )}
    </div>
  )
}

export default VenueListPage
