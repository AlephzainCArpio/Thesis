import { useState, useEffect } from "react";
import { Table, Tag, Button, Card, message, Popconfirm, Modal, Typography, Spin } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const PendingServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingServices();
    // eslint-disable-next-line
  }, [currentUser]);

  const fetchPendingServices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/providers/services");
      // Only show current provider's services that are not approved
      const pending = response.data.filter(
        (svc) =>
          svc.status &&
          svc.status.toUpperCase() !== "APPROVED" &&
          (!svc.providerId || svc.providerId === currentUser.id)
      );
      setServices(pending);
    } catch (error) {
      message.error("Failed to load pending services");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, serviceType) => {
    try {
      let endpoint = "";
      switch (serviceType) {
        case "Venue":
          endpoint = `/venues/${id}`;
          break;
        case "Catering":
          endpoint = `/catering/${id}`;
          break;
        case "Photographer":
          endpoint = `/photographers/${id}`;
          break;
        case "Designer":
          endpoint = `/designers/${id}`;
          break;
        default:
          throw new Error("Invalid service type");
      }
      await api.delete(endpoint);
      message.success("Service deleted successfully");
      fetchPendingServices();
    } catch (error) {
      message.error("Failed to delete service");
    }
  };

  const handleEdit = (id, serviceType) => {
    navigate("/provider/register-service", {
      state: { serviceId: id, serviceType },
    });
  };

  const showServiceDetails = (service) => {
    setSelectedService(service);
    setDetailModalVisible(true);
  };

  const getStatusTag = (status) => {
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
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button icon={<EyeOutlined />} onClick={() => showServiceDetails(record)} />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id, record.category)}
            disabled={record.status === "APPROVED"}
          />
          <Popconfirm
            title="Are you sure you want to delete this service?"
            onConfirm={() => handleDelete(record.id, record.category)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const renderServiceDetails = () => {
    if (!selectedService) return null;
    const { category } = selectedService;
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
        {category === "Venue" && (
          <>
            <p>
              <strong>Capacity:</strong> {selectedService.capacity} people
            </p>
            <p>
              <strong>Price:</strong> ₱{selectedService.price}
            </p>
            <p>
              <strong>Amenities:</strong> {selectedService.amenities?.join(", ") || "None"}
            </p>
          </>
        )}
        {category === "Catering" && (
          <>
            <p>
              <strong>Maximum People:</strong> {selectedService.maxPeople} people
            </p>
            <p>
              <strong>Price Per Person:</strong> ₱{selectedService.pricePerPerson}
            </p>
            <p>
              <strong>Cuisine Types:</strong> {selectedService.cuisineTypes?.join(", ") || "None"}
            </p>
            <p>
              <strong>Menu Options:</strong> {selectedService.menuOptions || "None"}
            </p>
          </>
        )}
        {category === "Photographer" && (
          <>
            <p>
              <strong>Specialties:</strong> {selectedService.specialties?.join(", ") || "None"}
            </p>
            <p>
              <strong>Price Range:</strong> {selectedService.priceRange}
            </p>
            <p>
              <strong>Packages:</strong> {selectedService.packages || "None"}
            </p>
          </>
        )}
        {category === "Designer" && (
          <>
            <p>
              <strong>Design Types:</strong> {selectedService.designTypes?.join(", ") || "None"}
            </p>
            <p>
              <strong>Price Range:</strong> {selectedService.priceRange}
            </p>
            <p>
              <strong>Packages:</strong> {selectedService.packages || "None"}
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
      <Card>
        <Table dataSource={services} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
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
        {renderServiceDetails()}
      </Modal>
    </div>
  );
};

export default PendingServicesPage;