import { useState, useEffect } from "react"
import { Table, Tag, Button, Card, Tabs, message, Popconfirm, Modal, Typography } from "antd"
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"

const { TabPane } = Tabs
const { Title, Text } = Typography

const PendingServicesPage = () => {
  const [activeTab, setActiveTab] = useState("venues")
  const [venues, setVenues] = useState([])
  const [catering, setCatering] = useState([])
  const [photographers, setPhotographers] = useState([])
  const [designers, setDesigners] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [providerType, setProviderType] = useState(null)

  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // First get the provider type
    const checkProviderType = async () => {
      try {
        const response = await api.get("/provider/type")
        setProviderType(response.data.providerType)

        // Set the active tab to the provider's type
        if (response.data.providerType) {
          setActiveTab(response.data.providerType + "s") // Add 's' for plural
        }
      } catch (error) {
        console.error("Error checking provider type:", error)
      }
    }

    checkProviderType().then(() => {
      fetchServices()
    })
  }, [currentUser])

  const fetchServices = async () => {
    try {
      setLoading(true)

      // Only fetch services for the provider's type
      if (providerType === "venue" || !providerType) {
        const venuesRes = await api.get(`/venues/provider/${currentUser.id}`)
        setVenues(venuesRes.data)
      }

      if (providerType === "catering" || !providerType) {
        const cateringRes = await api.get(`/catering/provider/${currentUser.id}`)
        setCatering(cateringRes.data)
      }

      if (providerType === "photographer" || !providerType) {
        const photographersRes = await api.get(`/photographers/provider/${currentUser.id}`)
        setPhotographers(photographersRes.data)
      }

      if (providerType === "designer" || !providerType) {
        const designersRes = await api.get(`/designers/provider/${currentUser.id}`)
        setDesigners(designersRes.data)
      }
    } catch (error) {
      message.error("Failed to load services")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, serviceType) => {
    try {
      let endpoint = ""

      switch (serviceType) {
        case "venues":
          endpoint = `/venues/${id}`
          break
        case "catering":
          endpoint = `/catering/${id}`
          break
        case "photographers":
          endpoint = `/photographers/${id}`
          break
        case "designers":
          endpoint = `/designers/${id}`
          break
        default:
          throw new Error("Invalid service type")
      }

      await api.delete(endpoint)

      message.success("Service deleted successfully")
      fetchServices() // Refresh the list
    } catch (error) {
      message.error("Failed to delete service")
      console.error(error)
    }
  }

  const handleEdit = (id, serviceType) => {
    // Navigate to edit page or show edit modal
    navigate("/provider/register-service", {
      state: { serviceId: id, serviceType },
    })
  }

  const showServiceDetails = (service, serviceType) => {
    setSelectedService({ ...service, serviceType })
    setDetailModalVisible(true)
  }

  const getStatusTag = (status) => {
    let color = ""

    switch (status) {
      case "PENDING":
        color = "gold"
        break
      case "APPROVED":
        color = "green"
        break
      case "REJECTED":
        color = "red"
        break
      default:
        color = "default"
    }

    return <Tag color={color}>{status}</Tag>
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
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
          <Button icon={<EyeOutlined />} onClick={() => showServiceDetails(record, activeTab)} />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id, activeTab)}
            disabled={record.status === "APPROVED"} // Disable edit for approved services
          />
          <Popconfirm
            title="Are you sure you want to delete this service?"
            onConfirm={() => handleDelete(record.id, activeTab)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  const renderServiceDetails = () => {
    if (!selectedService) return null

    const { serviceType } = selectedService

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

        {serviceType === "venues" && (
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

        {serviceType === "catering" && (
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

        {serviceType === "photographers" && (
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

        {serviceType === "designers" && (
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
    )
  }

  return (
    <div className="pending-services-container">
      <Title level={2}>My Services</Title>
      <p>
        Manage all your registered services here. Services need to be approved by admin before they become visible to
        clients.
      </p>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Venues" key="venues" disabled={providerType && providerType !== "venue"}>
            <Table dataSource={venues} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </TabPane>

          <TabPane tab="Catering" key="catering" disabled={providerType && providerType !== "catering"}>
            <Table
              dataSource={catering}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Photographers" key="photographers" disabled={providerType && providerType !== "photographer"}>
            <Table
              dataSource={photographers}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Designers" key="designers" disabled={providerType && providerType !== "designer"}>
            <Table
              dataSource={designers}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
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
  )
}

export default PendingServicesPage
