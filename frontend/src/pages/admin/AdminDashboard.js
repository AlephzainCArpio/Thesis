"use client"

import { useState, useEffect } from "react"
import { Row, Col, Card, Statistic, Table, Tag, Spin, Alert, Tabs, Select, DatePicker } from "antd"
import {
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  CameraOutlined,
  ShopOutlined,
  PictureOutlined,
} from "@ant-design/icons"
import api from "../../services/api"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const { TabPane } = Tabs
const { RangePicker } = DatePicker
const { Option } = Select

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalVenues: 0,
    totalCatering: 0,
    totalPhotographers: 0,
    totalDesigners: 0,
    pendingVenues: 0,
    pendingCatering: 0,
    pendingPhotographers: 0,
    pendingDesigners: 0,
  })

  const [recentBookings, setRecentBookings] = useState([])
  const [bookingStats, setBookingStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeframe, setTimeframe] = useState("week")
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [timeframe])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard statistics
      const statsResponse = await api.get("/admin/dashboard/stats")
      setStats(statsResponse.data)

      // Fetch recent bookings
      const bookingsResponse = await api.get("/admin/dashboard/recent-bookings")
      setRecentBookings(bookingsResponse.data)

      // Fetch booking statistics based on timeframe
      const bookingStatsResponse = await api.get(`/admin/dashboard/booking-stats?timeframe=${timeframe}`)
      setBookingStats(bookingStatsResponse.data)

      // Format data for chart
      const formattedChartData = bookingStatsResponse.data.map((item) => ({
        name: item.date,
        bookings: item.count,
      }))
      setChartData(formattedChartData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="blue">Pending</Tag>
      case "APPROVED":
        return <Tag color="green">Approved</Tag>
      case "REJECTED":
        return <Tag color="red">Rejected</Tag>
      case "COMPLETED":
        return <Tag color="purple">Completed</Tag>
      case "CANCELLED":
        return <Tag color="volcano">Cancelled</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const bookingColumns = [
    {
      title: "Booking ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Customer",
      dataIndex: ["user", "name"],
      key: "user",
    },
    {
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
      render: (type) => {
        const types = {
          VENUE: { color: "geekblue", icon: <HomeOutlined /> },
          CATERING: { color: "orange", icon: <ShopOutlined /> },
          PHOTOGRAPHER: { color: "green", icon: <CameraOutlined /> },
          DESIGNER: { color: "purple", icon: <PictureOutlined /> },
        }

        return (
          <Tag color={types[type]?.color || "default"} icon={types[type]?.icon}>
            {type}
          </Tag>
        )
      },
    },
    {
      title: "Service Name",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Date",
      dataIndex: "eventDate",
      key: "eventDate",
    },
    {
      title: "Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `₱${price?.toLocaleString() || "0"}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "20px" }}>Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Total Users" value={stats.totalUsers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Total Providers" value={stats.totalProviders} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Total Venues" value={stats.totalVenues} prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Pending Venues"
              value={stats.pendingVenues}
              valueStyle={{ color: stats.pendingVenues > 0 ? "#faad14" : "#3f8600" }}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Total Catering Services" value={stats.totalCatering} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Pending Catering"
              value={stats.pendingCatering}
              valueStyle={{ color: stats.pendingCatering > 0 ? "#faad14" : "#3f8600" }}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Total Photographers" value={stats.totalPhotographers} prefix={<CameraOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Pending Photographers"
              value={stats.pendingPhotographers}
              valueStyle={{ color: stats.pendingPhotographers > 0 ? "#faad14" : "#3f8600" }}
              prefix={<CameraOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Total Designers" value={stats.totalDesigners} prefix={<PictureOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Pending Designers"
              value={stats.pendingDesigners}
              valueStyle={{ color: stats.pendingDesigners > 0 ? "#faad14" : "#3f8600" }}
              prefix={<PictureOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for different dashboard sections */}
      <Tabs defaultActiveKey="bookings" style={{ marginTop: 24 }}>
        <TabPane tab="Recent Bookings" key="bookings">
          <Table columns={bookingColumns} dataSource={recentBookings} rowKey="id" pagination={{ pageSize: 5 }} />
        </TabPane>

        <TabPane tab="Analytics" key="analytics">
          <div style={{ marginBottom: 16 }}>
            <span style={{ marginRight: 8 }}>Timeframe:</span>
            <Select value={timeframe} onChange={setTimeframe} style={{ width: 120 }}>
              <Option value="week">Last Week</Option>
              <Option value="month">Last Month</Option>
              <Option value="quarter">Last Quarter</Option>
              <Option value="year">Last Year</Option>
            </Select>
          </div>

          <Card title={`Bookings Overview - ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default AdminDashboard
