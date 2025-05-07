import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Tabs,
  message,
  Spin,
  Empty,
  Card,
} from "antd";
import {
  HomeOutlined,
  ShopOutlined,
  CameraOutlined,
  BgColorsOutlined,
  EyeOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentViews: [],
    favorites: [],
    stats: {
      totalViews: 0,
      totalFavorites: 0,
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/users/dashboard");
      console.log("Dashboard Response:", response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getServiceType = (item) => {
    if (item.venue) return { type: 'venue', data: item.venue };
    if (item.catering) return { type: 'catering', data: item.catering };
    if (item.photographer) return { type: 'photographer', data: item.photographer };
    if (item.designer) return { type: 'designer', data: item.designer };
    return null;
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case "venue":
        return <HomeOutlined style={{ color: "#1890ff" }} />;
      case "catering":
        return <ShopOutlined style={{ color: "#fa8c16" }} />;
      case "photographer":
        return <CameraOutlined style={{ color: "#52c41a" }} />;
      case "designer":
        return <BgColorsOutlined style={{ color: "#722ed1" }} />;
      default:
        return <HomeOutlined />;
    }
  };

  const getServiceUrl = (type, id) => {
    switch (type) {
      case "venue":
        return `/api/user/venues/${id}`;
      case "catering":
        return `/api/user/catering/${id}`;
      case "photographer":
        return `/api/user/photographers/${id}`;
      case "designer":
        return `/api/user/designers/${id}`;
      default:
        return "#";
    }
  };

  const removeDuplicateServices = (items) => {
    const seen = new Set();
    return items.filter(item => {
      const service = getServiceType(item);
      if (!service) return false;
      
      const key = `${service.type}-${service.data.id}`;
      if (seen.has(key)) return false;
      
      seen.add(key);
      return true;
    });
  };

  const renderServiceList = (items) => {
    if (!items || items.length === 0) {
      return <Empty description="No items to show" />;
    }

    const uniqueItems = removeDuplicateServices(items);

    return (
      <Row gutter={[16, 16]}>
        {uniqueItems.map((item, index) => {
          const service = getServiceType(item);
          if (!service) return null;

          const { type, data } = service;
          const images = Array.isArray(data.images) ? data.images : 
                        typeof data.images === 'string' ? JSON.parse(data.images) : [];
          
          return (
            <Col xs={24} sm={12} md={8} lg={6} key={`${type}-${data.id}-${index}`}>
              <Link to={getServiceUrl(type, data.id)}>
                <Card
                  hoverable
                  cover={
                    images && images.length > 0 ? (
                      <img 
                        alt={data.name}
                        src={images[0]}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    ) : null
                  }
                >
                  <Card.Meta
                    avatar={getServiceIcon(type)}
                    title={data.name}
                    description={data.description?.substring(0, 100) + '...'}
                  />
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Welcome, {currentUser?.name || 'User'}</Title>
      <div style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <EyeOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                <Title level={4} style={{ margin: 0 }}>Total Views</Title>
                <Text style={{ fontSize: '24px' }}>{dashboardData.stats.totalViews}</Text>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <HeartOutlined style={{ fontSize: '24px', color: '#f5222d', marginBottom: '8px' }} />
                <Title level={4} style={{ margin: 0 }}>Total Favorites</Title>
                <Text style={{ fontSize: '24px' }}>{dashboardData.stats.totalFavorites}</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      <Tabs defaultActiveKey="1" items={[
        {
          key: "1",
          label: `Recent Views (${dashboardData.recentViews?.length || 0})`,
          children: loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
            </div>
          ) : renderServiceList(dashboardData.recentViews),
        },
        {
          key: "2",
          label: `Favorites (${dashboardData.favorites?.length || 0})`,
          children: loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
            </div>
          ) : renderServiceList(dashboardData.favorites),
        },
      ]} />
    </div>
  );
};

export default UserDashboard;