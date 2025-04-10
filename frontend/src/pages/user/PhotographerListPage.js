"use client"

import { useState, useEffect } from "react"
import { Card, Select, Typography, Row, Col, Slider, Button, Spin, Empty, Tag, Rate } from "antd"
import { DollarOutlined, EnvironmentOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

const { Title, Paragraph } = Typography
const { Option } = Select
const { Meta } = Card

const PhotographerListPage = () => {
  const navigate = useNavigate()
  const [photographers, setPhotographers] = useState([])
  const [filteredPhotographers, setFilteredPhotographers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: "",
    style: [],
    minExperience: 0,
    maxExperience: 30,
    minPrice: 0,
    maxPrice: 1000,
  })

  // Available filter options
  const locations = ["New York", "Los Angeles", "Chicago", "San Francisco", "Austin", "Miami", "Seattle"]
  const styles = ["Portrait", "Wedding", "Fashion", "Event", "Landscape", "Commercial", "Product", "Street", "Travel"]

  // Fetch photographers data
  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        // In a real application, you would fetch data from your API
        const response = await fetch("/api/photographers")
        const data = await response.json()
        setPhotographers(data)
        setFilteredPhotographers(data)
      } catch (error) {
        console.error("Failed to fetch photographers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotographers()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    const applyFilters = () => {
      const filtered = photographers.filter((photographer) => {
        // Filter by location
        if (filters.location && photographer.location !== filters.location) {
          return false
        }

        // Filter by style
        if (filters.style.length > 0 && !filters.style.some((style) => photographer.styles.includes(style))) {
          return false
        }

        // Filter by experience
        if (photographer.experience < filters.minExperience || photographer.experience > filters.maxExperience) {
          return false
        }

        // Filter by price
        if (photographer.pricePerHour < filters.minPrice || photographer.pricePerHour > filters.maxPrice) {
          return false
        }

        return true
      })

      setFilteredPhotographers(filtered)
    }

    if (photographers.length > 0) {
      applyFilters()
    }
  }, [filters, photographers])

  // Handle filter changes
  const handleLocationChange = (value) => {
    setFilters({ ...filters, location: value })
  }

  const handleStyleChange = (value) => {
    setFilters({ ...filters, style: value })
  }

  const handleExperienceChange = (value) => {
    setFilters({ ...filters, minExperience: value[0], maxExperience: value[1] })
  }

  const handlePriceChange = (value) => {
    setFilters({ ...filters, minPrice: value[0], maxPrice: value[1] })
  }

  const resetFilters = () => {
    setFilters({
      location: "",
      style: [],
      minExperience: 0,
      maxExperience: 30,
      minPrice: 0,
      maxPrice: 1000,
    })
  }

  const handleViewDetails = (id) => {
    navigate(`/photographers/${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2}>Find Your Perfect Photographer</Title>
      <Paragraph className="mb-8">
        Browse our curated selection of professional photographers for your event, portrait session, or commercial
        needs.
      </Paragraph>

      {/* Filter Section */}
      <Card className="mb-8">
        <Title level={4}>Filter Options</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2">Location</div>
            <Select
              placeholder="Select location"
              style={{ width: "100%" }}
              allowClear
              value={filters.location}
              onChange={handleLocationChange}
            >
              {locations.map((location) => (
                <Option key={location} value={location}>
                  {location}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="mb-2">Photography Style</div>
            <Select
              mode="multiple"
              placeholder="Select styles"
              style={{ width: "100%" }}
              value={filters.style}
              onChange={handleStyleChange}
            >
              {styles.map((style) => (
                <Option key={style} value={style}>
                  {style}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="mb-2">Experience (years)</div>
            <Slider
              range
              min={0}
              max={30}
              value={[filters.minExperience, filters.maxExperience]}
              onChange={handleExperienceChange}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="mb-2">Price per Hour ($)</div>
            <Slider
              range
              min={0}
              max={1000}
              value={[filters.minPrice, filters.maxPrice]}
              onChange={handlePriceChange}
            />
            <div className="flex justify-between">
              <span>${filters.minPrice}</span>
              <span>${filters.maxPrice}</span>
            </div>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col xs={24} className="flex justify-end">
            <Button onClick={resetFilters}>Reset Filters</Button>
          </Col>
        </Row>
      </Card>

      {/* Results Section */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : filteredPhotographers.length === 0 ? (
        <Empty description="No photographers found matching your criteria" className="my-8" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredPhotographers.map((photographer) => (
            <Col xs={24} sm={12} md={8} lg={6} key={photographer.id}>
              <Card
                hoverable
                cover={
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img
                      alt={photographer.name}
                      src={photographer.avatar || "/api/placeholder/300/200"}
                      className="object-cover w-full h-full"
                    />
                  </div>
                }
                actions={[
                  <Button type="primary" onClick={() => handleViewDetails(photographer.id)} key="details">
                    View Details
                  </Button>,
                ]}
              >
                <Meta
                  title={photographer.name}
                  description={
                    <div>
                      <div className="mb-2">
                        <Rate disabled defaultValue={photographer.rating} allowHalf className="text-sm" />
                      </div>
                      <div className="flex items-center mb-2">
                        <EnvironmentOutlined className="mr-1" />
                        <span>{photographer.location}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <DollarOutlined className="mr-1" />
                        <span>${photographer.pricePerHour}/hour</span>
                      </div>
                      <div className="mb-2">
                        <span>Experience: {photographer.experience} years</span>
                      </div>
                      <div>
                        {photographer.styles &&
                          photographer.styles.map((style) => (
                            <Tag key={style} className="mb-1 mr-1">
                              {style}
                            </Tag>
                          ))}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default PhotographerListPage
