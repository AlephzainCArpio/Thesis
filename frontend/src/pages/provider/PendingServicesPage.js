import { useState, useEffect } from "react";
import { Card, Tag, Button, message, Popconfirm, Modal, Typography, Spin } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

function getStatusTag(status) {
  let color = "";
  switch (status) {
    case "PENDING":
      color = "gold";
      break;
    case "APPROVED":
      color = "green";
      break;
    case "REJECTED":
      color = "red";
      break;
    default:
      color = "default";
  }
  return <Tag color={color}>{status}</Tag>;
}

const VenueForm = ({ service, onEdit, onDelete, onView }) => (
  <Card
    title={service.name}
    extra={getStatusTag(service.status)}
    style={{ marginBottom: 16 }}
    actions={[
      <EyeOutlined key="view" onClick={() => onView(service)} />,
      <EditOutlined key="edit" onClick={() => onEdit(service.id)} disabled={service.status === "APPROVED"} />,
      <Popconfirm
        title="Are you sure you want to delete this service?"
        onConfirm={() => onDelete(service.id)}
        okText="Yes"
        cancelText="No"
        key="delete"
      >
        <DeleteOutlined style={{ color: "red" }} />
      </Popconfirm>,
    ]}
  >
    <p><b>Location:</b> {service.location}</p>
    <p><b>Capacity:</b> {service.capacity}</p>
    <p><b>Price:</b> ₱{service.price}</p>
    <p><b>Amenities:</b> {Array.isArray(service.amenities) ? service.amenities.join(", ") : service.amenities}</p>
  </Card>
);

const CateringForm = ({ service, onEdit, onDelete, onView }) => (
  <Card
    title={service.name}
    extra={getStatusTag(service.status)}
    style={{ marginBottom: 16 }}
    actions={[
      <EyeOutlined key="view" onClick={() => onView(service)} />,
      <EditOutlined key="edit" onClick={() => onEdit(service.id)} disabled={service.status === "APPROVED"} />,
      <Popconfirm
        title="Are you sure you want to delete this service?"
        onConfirm={() => onDelete(service.id)}
        okText="Yes"
        cancelText="No"
        key="delete"
      >
        <DeleteOutlined style={{ color: "red" }} />
      </Popconfirm>,
    ]}
  >
    <p><b>Location:</b> {service.location}</p>
    <p><b>Max People:</b> {service.maxPeople}</p>
    <p><b>Price/Person:</b> ₱{service.pricePerPerson}</p>
    <p><b>Cuisine Type:</b> {service.cuisineType}</p>
  </Card>
);

const PhotographerForm = ({ service, onEdit, onDelete, onView }) => (
  <Card
    title={service.name}
    extra={getStatusTag(service.status)}
    style={{ marginBottom: 16 }}
    actions={[
      <EyeOutlined key="view" onClick={() => onView(service)} />,
      <EditOutlined key="edit" onClick={() => onEdit(service.id)} disabled={service.status === "APPROVED"} />,
      <Popconfirm
        title="Are you sure you want to delete this service?"
        onConfirm={() => onDelete(service.id)}
        okText="Yes"
        cancelText="No"
        key="delete"
      >
        <DeleteOutlined style={{ color: "red" }} />
      </Popconfirm>,
    ]}
  >
    <p><b>Location:</b> {service.location}</p>
    <p><b>Experience Years:</b> {service.experienceYears}</p>
    <p><b>Style:</b> {service.style}</p>
    <p><b>Price Range:</b> {service.priceRange}</p>
  </Card>
);

const DesignerForm = ({ service, onEdit, onDelete, onView }) => (
  <Card
    title={service.name}
    extra={getStatusTag(service.status)}
    style={{ marginBottom: 16 }}
    actions={[
      <EyeOutlined key="view" onClick={() => onView(service)} />,
      <EditOutlined key="edit" onClick={() => onEdit(service.id)} disabled={service.status === "APPROVED"} />,
      <Popconfirm
        title="Are you sure you want to delete this service?"
        onConfirm={() => onDelete(service.id)}
        okText="Yes"
        cancelText="No"
        key="delete"
      >
        <DeleteOutlined style={{ color: "red" }} />
      </Popconfirm>,
    ]}
  >
    <p><b>Location:</b> {service.location}</p>
    <p><b>Style:</b> {service.style}</p>
    <p><b>Price Range:</b> {service.priceRange}</p>
  </Card>
);

const PendingServicesPage = () => {
  const [providerType, setProviderType] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTypeAndServices();
    // eslint-disable-next-line
  }, [currentUser]);

  const fetchTypeAndServices = async () => {
    try {
      setLoading(true);
      // Get provider type
      const typeRes = await api.get("/api/providers/provider-type");
      setProviderType(typeRes.data.providerType);
      // Get all services for this provider
      const svcRes = await api.get("/api/providers/services");
      // Filter only non-approved services for current provider and their type
      const pending = svcRes.data.filter(
        (svc) =>
          svc.status &&
          svc.status.toUpperCase() !== "APPROVED" &&
          (!svc.providerId || svc.providerId === currentUser.id) &&
          svc.category &&
          svc.category.toUpperCase() === (typeRes.data.providerType || "").toUpperCase()
      );
      setServices(pending);
    } catch (error) {
      message.error("Failed to load pending services");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      let endpoint = "";
      switch (providerType) {
        case "VENUE":
          endpoint = `/venues/${id}`;
          break;
        case "CATERING":
          endpoint = `/catering/${id}`;
          break;
        case "PHOTOGRAPHER":
          endpoint = `/photographers/${id}`;
          break;
        case "DESIGNER":
          endpoint = `/designers/${id}`;
          break;
        default:
          throw new Error("Invalid provider type");
      }
      await api.delete(endpoint);
      message.success("Service deleted successfully");
      fetchTypeAndServices();
    } catch (error) {
      message.error("Failed to delete service");
    }
  };

  const handleEdit = (id) => {
    navigate("/provider/register-service", {
      state: { serviceId: id, serviceType: providerType },
    });
  };

  const handleView = (service) => {
    setSelectedService(service);
    setDetailModalVisible(true);
  };

  const renderDetail = () => {
    if (!selectedService) return null;
    return (
      <div>
        <Title level={4}>{selectedService.name}</Title>
        <p>
          <strong>Status:</strong> {getStatusTag(selectedService.status)}
        </p>
        {selectedService.status === "REJECTED" && (
          <p>
            <strong>Rejection Reason:</strong> {selectedService.rejectionReason || "No reason provided"}
          </p>
        )}
        <p>
          <strong>Description:</strong> {selectedService.description}
        </p>
        <p>
          <strong>Location:</strong> {selectedService.location}
        </p>
        {providerType === "VENUE" && (
          <>
            <p>
              <strong>Capacity:</strong> {selectedService.capacity}
            </p>
            <p>
              <strong>Price:</strong> ₱{selectedService.price}
            </p>
            <p>
              <strong>Amenities:</strong> {Array.isArray(selectedService.amenities) ? selectedService.amenities.join(", ") : selectedService.amenities}
            </p>
          </>
        )}
        {providerType === "CATERING" && (
          <>
            <p>
              <strong>Max People:</strong> {selectedService.maxPeople}
            </p>
            <p>
              <strong>Price Per Person:</strong> ₱{selectedService.pricePerPerson}
            </p>
            <p>
              <strong>Cuisine Type:</strong> {selectedService.cuisineType}
            </p>
          </>
        )}
        {providerType === "PHOTOGRAPHER" && (
          <>
            <p>
              <strong>Experience Years:</strong> {selectedService.experienceYears}
            </p>
            <p>
              <strong>Style:</strong> {selectedService.style}
            </p>
            <p>
              <strong>Price Range:</strong> {selectedService.priceRange}
            </p>
          </>
        )}
        {providerType === "DESIGNER" && (
          <>
            <p>
              <strong>Style:</strong> {selectedService.style}
            </p>
            <p>
              <strong>Price Range:</strong> {selectedService.priceRange}
            </p>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pending-services-container" style={{ padding: 24 }}>
      <Title level={2}>My Pending/Rejected Services</Title>
      <p>
        Manage all your registered services here. Services need to be approved by admin before they become visible to
        clients.
      </p>
      {providerType === "VENUE" &&
        services.map((svc) => (
          <VenueForm key={svc.id} service={svc} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
        ))}
      {providerType === "CATERING" &&
        services.map((svc) => (
          <CateringForm key={svc.id} service={svc} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
        ))}
      {providerType === "PHOTOGRAPHER" &&
        services.map((svc) => (
          <PhotographerForm key={svc.id} service={svc} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
        ))}
      {providerType === "DESIGNER" &&
        services.map((svc) => (
          <DesignerForm key={svc.id} service={svc} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
        ))}
      <Modal
        title="Service Details"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {renderDetail()}
      </Modal>
    </div>
  );
};

export default PendingServicesPage;