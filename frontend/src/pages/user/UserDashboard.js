import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Tabs,
  message,
  Spin,
  Empty,
} from "antd";
import {
  HomeOutlined,
  ShopOutlined,
  CameraOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import ServiceCard from "../../components/common/ServiceCard";

const { Title } = Typography;

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentViews: [],
    favorites: [],
    stats: {
      totalViews: 0,
      totalFavorites: 0,
      totalInquiries: 0,
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
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

  const getServiceTypeText = (type) => {
    switch (type) {
      case "venue":
        return "Venue";
      case "catering":
        return "Catering";
      case "photographer":
        return "Photographer";
      case "designer":
        return "Designer";
      default:
        return type;
    }
  };

  const getServiceUrl = (type, id) => {
    switch (type) {
      case "venue":
        return `/user/venues/${id}`;
      case "catering":
        return `/user/catering/${id}`;
      case "photographer":
        return `/user/photographers/${id}`;
      case "designer":
        return `/user/designers/${id}`;
      default:
        return "#";
    }
  };

  const renderServiceList = (services) => {
    if (!services.length) {
      return <Empty description="No items to show" />;
    }

    return (
      <Row gutter={[16, 16]}>
        {services.map((item, index) => {
          const type = item.venue ? "venue" :
                       item.catering ? "catering" :
                       item.photographer ? "photographer" :
                       item.designer ? "designer" : "";

          const service = item[type];

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Link to={getServiceUrl(type, service.id)}>
                <ServiceCard
                  title={service.name}
                  description={service.description}
                  image={service.images?.[0]}
                  icon={getServiceIcon(type)}
                  type={getServiceTypeText(type)}
                />
              </Link>
            </Col>
          );
        })}
      </Row>
    );
  };

  const tabItems = [
    {
      key: "1",
      label: "Recent Views",
      children: loading ? <Spin /> : renderServiceList(dashboardData.recentViews),
    },
    {
      key: "2",
      label: "Favorites",
      children: loading ? <Spin /> : renderServiceList(dashboardData.favorites),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Your Dashboard</Title>
      <Tabs items={tabItems} />
    </div>
  );
};

export default UserDashboard;
