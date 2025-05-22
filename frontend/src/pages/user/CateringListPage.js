import { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Spin, Empty } from "antd";
import { Link } from "react-router-dom";
import api from "../../services/api";

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const API_URL = process.env.REACT_APP_API_URL || "";
const safeJsonParse = (json) => {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getFirstImage = (imagesField) => {
  if (!imagesField) return null;
  const parsed = safeJsonParse(imagesField);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed[0];
  }
  if (typeof imagesField === "string" && imagesField.trim() !== "") {
    return imagesField;
  }
  return null;
};

const getImagePath = (filename) => {
  if (!filename) return "/placeholder.jpg";
  return `${API_URL}/uploads/catering/${filename}`;
};

const CateringListPage = () => {
  const [caterings, setCaterings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaterings();
    // eslint-disable-next-line
  }, []);

  const fetchCaterings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/catering");
      setCaterings(response.data.caterings || response.data);
    } catch (error) {
      console.error("Error fetching catering services:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCateringCard = (catering) => {
    const firstImage = getFirstImage(catering.images);
    const imagePath = getImagePath(firstImage);

    return (
      <Col xs={24} sm={12} lg={8} key={catering.id}>
        <Card
          hoverable
          cover={
            <div style={{ height: 200, overflow: "hidden" }}>
              <img
                alt={catering.name}
                src={imagePath}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder.jpg";
                }}
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
                  Location: {catering.location}
                </div>
                <div style={{ marginBottom: 8 }}>
                  Max People: {catering.maxPeople}
                </div>
                <div style={{ marginBottom: 8 }}>
                  Price Per Person: ₱
                  {catering.pricePerPerson?.toLocaleString() || "0"}
                </div>
                <div style={{ marginBottom: 8 }}>
                  Cuisine Type: {catering.cuisineType}
                </div>
              </>
            }
          />
        </Card>
      </Col>
    );
  };

  return (
    <div className="catering-list-page">
      <Title level={2}>Find Your Perfect Catering Service</Title>
      <Paragraph>
        Browse through our collection of catering services for your special event.
      </Paragraph>

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
  );
};

export default CateringListPage;