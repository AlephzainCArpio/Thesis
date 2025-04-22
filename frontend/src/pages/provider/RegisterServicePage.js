import { useState, useEffect } from "react"
import { Form, Input, InputNumber, Select, Button, Upload, Card, Tabs, message, Alert } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input

const RegisterServicePage = () => {
  const [loading, setLoading] = useState(false)
  const [serviceType, setServiceType] = useState("")
  const [providerType, setProviderType] = useState(null)
  const [canRegister, setCanRegister] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const { currentUser } = useAuth()

  useEffect(() => {
    // Check if provider already has a service type
    const checkProviderType = async () => {
      try {
        const response = await api.get("/provider/type")
        setProviderType(response.data.providerType)

        // If provider already has a type, set it as the active tab
        if (response.data.providerType) {
          setServiceType(response.data.providerType)
        }
      } catch (error) {
        console.error("Error checking provider type:", error)
      }
    }

    checkProviderType()
  }, [])

  // When service type changes, validate if provider can register this type
  useEffect(() => {
    const validateServiceType = async () => {
      // If provider doesn't have a type yet, they can register any service
      if (!providerType) {
        setCanRegister(true)
        setErrorMessage("")
        return
      }

      // If provider already has a type, they can only register that type
      if (providerType !== serviceType) {
        setCanRegister(false)
        setErrorMessage(
          `You are registered as a ${providerType} provider. You cannot register services in multiple categories.`,
        )
      } else {
        setCanRegister(true)
        setErrorMessage("")
      }
    }

    validateServiceType()
  }, [serviceType, providerType])

  const onFinish = async (values) => {
    try {
      setLoading(true)

      // First validate if provider can register this service type
      const validationResponse = await api.post("/provider/register-service/validate", {
        serviceType,
      })

      if (!validationResponse.data.canProceed) {
        message.error(validationResponse.data.message)
        return
      }

      // Format image URLs as JSON string
      let images = []
      if (values.images && values.images.fileList) {
        images = values.images.fileList.map((file) => file.thumbUrl || file.url)
      }

      const serviceData = {
        ...values,
        images: JSON.stringify(images),
        providerId: currentUser.id,
      }

      // Send to appropriate endpoint based on service type
      let endpoint = ""
      switch (serviceType) {
        case "venue":
          endpoint = "/venues"
          break
        case "catering":
          endpoint = "/catering"
          break
        case "photographer":
          endpoint = "/photographers"
          break
        case "designer":
          endpoint = "/designers"
          break
        default:
          endpoint = "/venues"
      }

      await api.post(endpoint, serviceData)

      message.success("Service submitted for approval!")
      
      setServiceType(providerType || "venue")
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to register service")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const uploadProps = {
    listType: "picture",
    beforeUpload: (file) => {
      return false 
    },
    maxCount: 5,
  }

  return (
    <div>
      <h2>Register a New Service</h2>
      <p>
        Fill out the details below to add your service to our platform. It will be reviewed by an admin before being
        published.
      </p>

      {errorMessage && (
        <Alert
          message="Registration Restricted"
          description={errorMessage}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Tabs activeKey={serviceType} onChange={setServiceType} disabled={providerType !== null}>
          <TabPane tab="Venue" key="venue" disabled={providerType && providerType !== "venue"}>
            <Form name="register_venue" layout="vertical" onFinish={onFinish} disabled={!canRegister}>
              <Form.Item
                name="name"
                label="Venue Name"
                rules={[{ required: true, message: "Please enter venue name!" }]}
              >
                <Input placeholder="Enter venue name" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: "Please enter description!" }]}
              >
                <TextArea rows={4} placeholder="Describe your venue" />
              </Form.Item>

              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: "Please enter location!" }]}
              >
                <Input placeholder="Full address" />
              </Form.Item>

              <Form.Item
                name="capacity"
                label="Maximum Capacity"
                rules={[{ required: true, message: "Please enter capacity!" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} placeholder="Max number of guests" />
              </Form.Item>

              <Form.Item name="price" label="Price (₱)" rules={[{ required: true, message: "Please enter price!" }]}>
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Rental fee" />
              </Form.Item>

              <Form.Item name="amenities" label="Amenities">
                <Select mode="tags" placeholder="Enter amenities">
                  <Option value="parking">Parking</Option>
                  <Option value="wifi">WiFi</Option>
                  <Option value="air-conditioning">Air Conditioning</Option>
                  <Option value="sound-system">Sound System</Option>
                </Select>
              </Form.Item>

              <Form.Item name="images" label="Photos">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Upload Images</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} disabled={!canRegister}>
                  Submit for Approval
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Catering" key="catering" disabled={providerType && providerType !== "catering"}>
            <Form name="register_catering" layout="vertical" onFinish={onFinish} disabled={!canRegister}>
              <Form.Item name="name" label="Business Name" rules={[{ required: true }]}>
                <Input placeholder="Enter business name" />
              </Form.Item>

              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <TextArea rows={4} placeholder="Describe your catering service" />
              </Form.Item>

              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                <Input placeholder="Full address" />
              </Form.Item>

              <Form.Item name="maxPeople" label="Maximum People" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} placeholder="Max number of guests" />
              </Form.Item>

              <Form.Item name="pricePerPerson" label="Price Per Person (₱)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Price per person" />
              </Form.Item>

              <Form.Item name="cuisineTypes" label="Cuisine Types">
                <Select mode="tags" placeholder="Enter cuisine types">
                  <Option value="filipino">Filipino</Option>
                  <Option value="chinese">Chinese</Option>
                  <Option value="japanese">Japanese</Option>
                  <Option value="italian">Italian</Option>
                  <Option value="american">American</Option>
                </Select>
              </Form.Item>

              <Form.Item name="dietaryOptions" label="Dietary Options">
                <Select mode="tags" placeholder="Enter dietary options">
                  <Option value="vegetarian">Vegetarian</Option>
                  <Option value="vegan">Vegan</Option>
                  <Option value="gluten-free">Gluten-Free</Option>
                  <Option value="halal">Halal</Option>
                </Select>
              </Form.Item>

              <Form.Item name="images" label="Food Photos">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Upload Images</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} disabled={!canRegister}>
                  Submit for Approval
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Photographer" key="photographer" disabled={providerType && providerType !== "photographer"}>
            <Form name="register_photographer" layout="vertical" onFinish={onFinish} disabled={!canRegister}>
              <Form.Item name="name" label="Business Name" rules={[{ required: true }]}>
                <Input placeholder="Enter business name" />
              </Form.Item>

              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <TextArea rows={4} placeholder="Describe your photography services" />
              </Form.Item>

              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                <Input placeholder="Full address" />
              </Form.Item>

              <Form.Item name="hourlyRate" label="Hourly Rate (₱)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Hourly rate" />
              </Form.Item>

              <Form.Item name="packages" label="Packages (separate with commas)">
                <TextArea rows={4} placeholder="Describe your package options" />
              </Form.Item>

              <Form.Item name="photographyStyles" label="Photography Styles">
                <Select mode="tags" placeholder="Enter photography styles">
                  <Option value="traditional">Traditional</Option>
                  <Option value="photojournalistic">Photojournalistic</Option>
                  <Option value="artistic">Artistic</Option>
                  <Option value="candid">Candid</Option>
                  <Option value="vintage">Vintage</Option>
                </Select>
              </Form.Item>

              <Form.Item name="experienceYears" label="Years of Experience" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Experience in years" />
              </Form.Item>

              <Form.Item name="images" label="Portfolio Photos">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Upload Images</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} disabled={!canRegister}>
                  Submit for Approval
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Designer" key="designer" disabled={providerType && providerType !== "designer"}>
            <Form name="register_designer" layout="vertical" onFinish={onFinish} disabled={!canRegister}>
              <Form.Item name="name" label="Business Name" rules={[{ required: true }]}>
                <Input placeholder="Enter business name" />
              </Form.Item>

              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <TextArea rows={4} placeholder="Describe your design services" />
              </Form.Item>

              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                <Input placeholder="Full address" />
              </Form.Item>

              <Form.Item name="price" label="Base Price (₱)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Starting price" />
              </Form.Item>

              <Form.Item name="designStyles" label="Design Styles">
                <Select mode="tags" placeholder="Enter design styles">
                  <Option value="modern">Modern</Option>
                  <Option value="rustic">Rustic</Option>
                  <Option value="minimalist">Minimalist</Option>
                  <Option value="bohemian">Bohemian</Option>
                  <Option value="tropical">Tropical</Option>
                  <Option value="traditional">Traditional</Option>
                </Select>
              </Form.Item>

              <Form.Item name="services" label="Services Offered">
                <Select mode="tags" placeholder="Enter services">
                  <Option value="floral-arrangements">Floral Arrangements</Option>
                  <Option value="table-settings">Table Settings</Option>
                  <Option value="stage-design">Stage Design</Option>
                  <Option value="lighting">Lighting Design</Option>
                  <Option value="full-venue-styling">Full Venue Styling</Option>
                </Select>
              </Form.Item>

              <Form.Item name="specialty" label="Specialty (if any)">
                <Input placeholder="Your special expertise" />
              </Form.Item>

              <Form.Item name="images" label="Portfolio Photos">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Upload Images</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} disabled={!canRegister}>
                  Submit for Approval
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default RegisterServicePage
