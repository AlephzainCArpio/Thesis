import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Carousel,
  Spin,
  Divider,
  Button,
} from "antd";
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

// If you have a placeholder.svg in your public folder, use "/placeholder.svg"
// If you want to use a local asset, import it: 
// import placeholderImg from '../../assets/placeholder.svg';
const PLACEHOLDER_IMG = "/placeholder.svg";

const { Title, Paragraph, Link } = Typography;

// Parse images robustly: array, JSON string, comma-separated, or single URL
const safeImageParse = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      if (typeof parsed === "string" && parsed.trim()) return [parsed.trim()];
    } catch (e) {
      if (images.includes(",")) {
        return images.split(",").map((img) => img.trim()).filter(Boolean);
      }
      if (images.trim()) return [images.trim()];
    }
  }
  return [];
};

const safeEventTypesParse = (eventTypes) => {
  if (!eventTypes) return [];
  if (Array.isArray(eventTypes)) return eventTypes;
  if (typeof eventTypes === "string") {
    try {
      const parsed = JSON.parse(eventTypes);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "string" && parsed.trim()) {
        return parsed.split(",").map((type) => type.trim());
      }
    } catch (e) {
      if (eventTypes.includes(",")) {
        return eventTypes.split(",").map((type) => type.trim());
      }
      if (eventTypes.trim()) return [eventTypes.trim()];
    }
  }
  return [];
};

const DesignerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track broken images by index to avoid infinite onError loops
  const [brokenImages, setBrokenImages] = useState({}); // { [index]: true }

  useEffect(() => {
    const fetchDesigner = async () => {
      try {
        const response = await api.get(`/api/designers/${id}`);
        setDesigner(response.data);
      } catch (error) {
        console.error("Error fetching designer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigner();
  }, [id]);

  // Reset broken images tracking if designer/images change
  useEffect(() => {
    setBrokenImages({});
  }, [designer]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!designer) {
    return null;
  }

  const images = safeImageParse(designer.images);
  const portfolio = designer.portfolio;
  const eventTypes = safeEventTypesParse(designer.eventTypes);

  const handleImgError = (index) => {
    setBrokenImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="designer-detail-page">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          {/* Image Carousel */}
          <Card style={{ marginBottom: 24 }}>
            {images.length > 0 ? (
              <Carousel autoplay>
                {images.map((image, index) => (
                  <div key={index}>
                    <div
                      style={{
                        height: "400px",
                        background: "#f0f0f0",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={
                          brokenImages[index]
                            ? PLACEHOLDER_IMG
                            : image || PLACEHOLDER_IMG
                        }
                        alt={`${designer.name} - Image ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block",
                        }}
                        onError={() => handleImgError(index)}
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
            ) : (
              <div
                style={{
                  height: "400px",
                  background: "#f0f0f0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={PLACEHOLDER_IMG}
                  alt="No images"
                  style={{ height: "80px", marginRight: 16 }}
                />
                <p>No images available</p>
              </div>
            )}
          </Card>

          {/* Main Details */}
          <Card>
            <Title level={2}>{designer.name}</Title>

            <Paragraph>
              <EnvironmentOutlined /> {designer.location}
            </Paragraph>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card size="small">
                  <div style={{ textAlign: "center" }}>
                    <CheckCircleOutlined
                      style={{ fontSize: 24, color: "#1890ff" }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <strong>Design Style</strong>
                      <p>{designer.style || "N/A"}</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <div style={{ textAlign: "center" }}>
                    <CheckCircleOutlined
                      style={{ fontSize: 24, color: "#52c41a" }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <strong>Price Range</strong>
                      <p>{designer.priceRange || "N/A"}</p>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">About the Designer</Divider>
            <Paragraph>{designer.description}</Paragraph>

            <Divider orientation="left">Portfolio</Divider>
            {portfolio ? (
              <Paragraph>
                <a href={portfolio} target="_blank" rel="noopener noreferrer">
                  View Portfolio
                </a>
              </Paragraph>
            ) : (
              <Paragraph>No portfolio available</Paragraph>
            )}

            <Divider orientation="left">Event Types</Divider>
            <div>
              {eventTypes.length > 0 ? (
                eventTypes.map((type, index) => (
                  <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                    {type}
                  </Tag>
                ))
              ) : (
                <Paragraph>No event types available</Paragraph>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Provider Details */}
          <Card title="Designer Provider" style={{ marginBottom: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Name">
                {designer.provider?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {designer.provider?.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <PhoneOutlined /> {designer.provider?.phone || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Location */}
          <Card title="Location">
            <div
              style={{
                height: "200px",
                background: "#f0f0f0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <EnvironmentOutlined style={{ fontSize: 32 }} />
              <p style={{ marginLeft: 8 }}>{designer.location}</p>
            </div>
            <Button
              type="link"
              block
              href={`https://maps.google.com/?q=${encodeURIComponent(
                designer.location
              )}`}
              target="_blank"
              style={{ marginTop: 16 }}
            >
              View on Google Maps
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DesignerDetailPage;