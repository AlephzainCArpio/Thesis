import React from 'react';
import { Form, Input, InputNumber, Select, Upload } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const RegisterServicePage = () => {
  const { currentUser } = useAuth();
  const providerType = currentUser?.providerType;

  if (!providerType) {
    return <div>Error: Your provider type is not set. Please contact admin.</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Register Your Service</h2>

      {/* Form based on provider type */}
      {providerType === 'VENUE' && <VenueForm />}
      {providerType === 'CATERING' && <CateringForm />}
      {providerType === 'PHOTOGRAPHER' && <PhotographerForm />}
      {providerType === 'DESIGNER' && <DesignerForm />}
    </div>
  );
};

// Venue form
const VenueForm = () => {
  return (
    <Form layout="vertical">
      <Form.Item
        name="name"
        label="Venue Name"
        rules={[{ required: true, message: "Please enter venue name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please enter description" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        name="location"
        label="Location"
        rules={[{ required: true, message: "Please enter location" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="capacity"
        label="Capacity"
        rules={[{ required: true, message: "Please enter capacity" }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="price"
        label="Price"
        rules={[{ required: true, message: "Please enter price" }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="amenities" label="Amenities">
        <Select mode="tags" placeholder="Enter amenities">
          <Option value="wifi">WiFi</Option>
          <Option value="parking">Parking</Option>
          <Option value="catering">Catering Allowed</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="images"
        label="Images"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload
          listType="picture-card"
          multiple
          beforeUpload={() => false}
          accept="image/*"
          maxCount={5}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item>
        <button type="submit">Register Venue</button>
      </Form.Item>
    </Form>
  );
};

// Catering form
const CateringForm = () => {
  return (
    <Form layout="vertical">
      <Form.Item
        name="name"
        label="Catering Name"
        rules={[{ required: true, message: "Please enter catering name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please enter description" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        name="location"
        label="Location"
        rules={[{ required: true, message: "Please enter location" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="maxPeople"
        label="Maximum People"
        rules={[{ required: true, message: "Please enter max capacity" }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="pricePerPerson"
        label="Price Per Person"
        rules={[{ required: true, message: "Please enter price per person" }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="cuisineType"
        label="Cuisine Type"
        rules={[{ required: true, message: "Please select cuisine type" }]}
      >
        <Select>
          <Option value="filipino">Filipino</Option>
          <Option value="chinese">Chinese</Option>
          <Option value="italian">Italian</Option>
        </Select>
      </Form.Item>
      <Form.Item name="dietaryOptions" label="Dietary Options">
        <Select mode="tags" placeholder="Enter dietary options">
          <Option value="vegetarian">Vegetarian</Option>
          <Option value="vegan">Vegan</Option>
          <Option value="gluten-free">Gluten-Free</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="images"
        label="Images"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload
          listType="picture-card"
          multiple
          beforeUpload={() => false}
          accept="image/*"
          maxCount={5}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item>
        <button type="submit">Register Catering</button>
      </Form.Item>
    </Form>
  );
};

// Photographer form
const PhotographerForm = () => {
  return (
    <Form layout="vertical">
      <Form.Item
        name="name"
        label="Photographer Name"
        rules={[{ required: true, message: "Please enter photographer name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please enter description" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        name="location"
        label="Location"
        rules={[{ required: true, message: "Please enter location" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="style"
        label="Photography Style"
        rules={[{ required: true, message: "Please select a style" }]}
      >
        <Select>
          <Option value="traditional">Traditional</Option>
          <Option value="photojournalistic">Photojournalistic</Option>
          <Option value="contemporary">Contemporary</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="experienceYears"
        label="Years of Experience"
        rules={[{ required: true, message: "Please enter years of experience" }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="priceRange"
        label="Price Range"
        rules={[{ required: true, message: "Please enter a price range" }]}
      >
        <Input placeholder="e.g., 5000-10000" />
      </Form.Item>
      <Form.Item
        name="copyType"
        label="Copy Type"
        rules={[{ required: true, message: "Please select a copy type" }]}
      >
        <Select>
          <Option value="virtual">Virtual</Option>
          <Option value="physical">Physical</Option>
          <Option value="both">Both</Option>
        </Select>
      </Form.Item>
      <Form.Item name="portfolio" label="Portfolio URL">
        <Input placeholder="Enter portfolio link" />
      </Form.Item>
      <Form.Item
        name="images"
        label="Images"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload
          listType="picture-card"
          multiple
          beforeUpload={() => false}
          accept="image/*"
          maxCount={5}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item>
        <button type="submit">Register Photographer</button>
      </Form.Item>
    </Form>
  );
};

// Designer form
const DesignerForm = () => {
  return (
    <Form layout="vertical">
      <Form.Item
        name="name"
        label="Designer Name"
        rules={[{ required: true, message: "Please enter designer name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please enter description" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        name="location"
        label="Location"
        rules={[{ required: true, message: "Please enter location" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="style"
        label="Design Style"
        rules={[{ required: true, message: "Please select a style" }]}
      >
        <Select>
          <Option value="modern">Modern</Option>
          <Option value="classic">Classic</Option>
          <Option value="minimalist">Minimalist</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="priceRange"
        label="Price Range"
        rules={[{ required: true, message: "Please enter a price range" }]}
      >
        <Input placeholder="e.g., 20000-50000" />
      </Form.Item>
      <Form.Item name="eventTypes" label="Event Types">
        <Select mode="tags" placeholder="Enter event types">
          <Option value="wedding">Wedding</Option>
          <Option value="corporate">Corporate</Option>
        </Select>
      </Form.Item>
      <Form.Item name="portfolio" label="Portfolio URL">
        <Input placeholder="Enter portfolio link" />
      </Form.Item>
      <Form.Item
        name="images"
        label="Images"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload
          listType="picture-card"
          multiple
          beforeUpload={() => false}
          accept="image/*"
          maxCount={5}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item>
        <button type="submit">Register Designer</button>
      </Form.Item>
    </Form>
  );
};

export default RegisterServicePage;