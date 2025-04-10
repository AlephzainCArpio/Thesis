import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber, 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Tag, 
  Spin, 
  Empty, 
  Alert, 
  message,
  Divider
} from 'antd';
import { 
  EnvironmentOutlined, 
  TeamOutlined, 
  DollarOutlined, 
  CalendarOutlined,
  ShoppingCartOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const { TabPane } = Tabs;
const { Option } = Select;

const RecommendationsPage = () => {
  const [form] = Form.useForm();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await api.post('/recommendations', {
        budget: values.budget,
        location: values.location,
        guests: values.guests,
        eventType: values.eventType,
        serviceType: values.serviceType
      });
      
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setErrorMessage('Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewServiceDetails = async (serviceId, serviceType) => {
    try {
      // Record the view in history
      await api.post('/users/view-history', {
        serviceId,
        serviceType
      });
      
      // Navigate to service details page (to be implemented)
      message.success('View recorded. Redirecting to details page...');
      
      // For now, just log that we would navigate
      console.log(`Navigate to ${serviceType} details with ID: ${serviceId}`);
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const formatPrice = (price) => {
    return '₱' + price.toLocaleString();
  };

  const renderVenueCard = (venue) => (
    <Card
      key={venue.id}
      hoverable
      style={{ marginBottom: 16 }}
      actions={[
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => viewServiceDetails(venue.id, 'venue')}
        >
          View Details
        </Button>
      ]}
    >
      <Card.Meta
        title={venue.name}
        description={
          <>
            <p><EnvironmentOutlined /> {venue.location}</p>
            <p><TeamOutlined /> Capacity: {venue.capacity} people</p>
            <p><DollarOutlined /> Price: {formatPrice(venue.price)}</p>
            {venue.previously_viewed && (
              <Tag color="blue">Previously Viewed</Tag>
            )}
          </>
        }
      />
    </Card>
  );

  const renderCateringCard = (catering) => (
    <Card
      key={catering.id}
      hoverable
      style={{ marginBottom: 16 }}
      actions={[
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => viewServiceDetails(catering.id, 'catering')}
        >
          View Details
        </Button>
      ]}
    >
      <Card.Meta
        title={catering.name}
        description={
          <>
            <p><EnvironmentOutlined /> {catering.location}</p>
            <p><TeamOutlined /> Serves up to: {catering.capacity} people</p>
            <p><DollarOutlined /> Price per person: {formatPrice(catering.price_per_person)}</p>
            <p>Cuisine: {catering.cuisine_type}</p>
            {catering.previously_viewed && (
              <Tag color="blue">Previously Viewed</Tag>
            )}
          </>
        }
      />
    </Card>
  );

  const renderPhotographerCard = (photographer) => (
    <Card
      key={photographer.id}
      hoverable
      style={{ marginBottom: 16 }}
      actions={[
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => viewServiceDetails(photographer.id, 'photographer')}
        >
          View Details
        </Button>
      ]}
    >
      <Card.Meta
        title={photographer.name}
        description={
          <>
            <p><EnvironmentOutlined /> {photographer.location}</p>
            <p><DollarOutlined /> Price range: {formatPrice(photographer.price)}</p>
            <p>Style: {photographer.style}</p>
            {photographer.previously_viewed && (
              <Tag color="blue">Previously Viewed</Tag>
            )}
          </>
        }
      />
    </Card>
  );

  const renderDesignerCard = (designer) => (
    <Card
      key={designer.id}
      hoverable
      style={{ marginBottom: 16 }}
      actions={[
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => viewServiceDetails(designer.id, 'designer')}
        >
          View Details
        </Button>
      ]}
    >
      <Card.Meta
        title={designer.name}
        description={
          <>
            <p><EnvironmentOutlined /> {designer.location}</p>
            <p><DollarOutlined /> Price range: {formatPrice(designer.price)}</p>
            <p>Style: {designer.style}</p>
            {designer.previously_viewed && (
              <Tag color="blue">Previously Viewed</Tag>
            )}
          </>
        }
      />
    </Card>
  );

  const renderRecommendations = () => {
    if (!recommendations) return null;

    return (
      <div style={{ marginTop: 24 }}>
        <Divider>Your Personalized Recommendations</Divider>
        
        <Tabs defaultActiveKey="venues">
          <TabPane 
            tab={`Venues (${recommendations.venues?.length || 0})`} 
            key="venues"
          >
            {recommendations.venues && recommendations.venues.length > 0 ? (
              <Row gutter={16}>
                {recommendations.venues.map(venue => (
                  <Col xs={24} sm={12} lg={8} key={venue.id}>
                    {renderVenueCard(venue)}
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="No venue recommendations found" />
            )}
          </TabPane>
          
          <TabPane 
            tab={`Catering (${recommendations.caterings?.length || 0})`} 
            key="caterings"
          >
            {recommendations.caterings && recommendations.caterings.length > 0 ? (
              <Row gutter={16}>
                {recommendations.caterings.map(catering => (
                  <Col xs={24} sm={12} lg={8} key={catering.id}>
                    {renderCateringCard(catering)}
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="No catering recommendations found" />
            )}
          </TabPane>
          
          <TabPane 
            tab={`Photographers (${recommendations.photographers?.length || 0})`} 
            key="photographers"
          >
            {recommendations.photographers && recommendations.photographers.length > 0 ? (
              <Row gutter={16}>
                {recommendations.photographers.map(photographer => (
                  <Col xs={24} sm={12} lg={8} key={photographer.id}>
                    {renderPhotographerCard(photographer)}
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="No photographer recommendations found" />
            )}
          </TabPane>
          
          <TabPane 
            tab={`Designers (${recommendations.designers?.length || 0})`} 
            key="designers"
          >
            {recommendations.designers && recommendations.designers.length > 0 ? (
              <Row gutter={16}>
                {recommendations.designers.map(designer => (
                  <Col xs={24} sm={12} lg={8} key={designer.id}>
                    {renderDesignerCard(designer)}
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="No designer recommendations found" />
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  };

  return (
    <div>
      <h2>Find Your Perfect Event Services</h2>
      <p>Tell us about your event and we'll recommend the best services for you.</p>
      
      <Card>
        <Form
          form={form}
          name="recommendations"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            serviceType: 'all',
            eventType: 'wedding'
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Event Type"
                name="eventType"
                rules={[{ required: true, message: 'Please select event type' }]}
              >
                <Select>
                  <Option value="wedding">Wedding</Option>
                  <Option value="corporate">Corporate Event</Option>
                  <Option value="birthday">Birthday Party</Option>
                  <Option value="conference">Conference</Option>
                  <Option value="graduation">Graduation</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Service Type"
                name="serviceType"
                rules={[{ required: true, message: 'Please select service type' }]}
              >
                <Select>
                  <Option value="all">All Services</Option>
                  <Option value="venue">Venues</Option>
                  <Option value="catering">Catering</Option>
                  <Option value="photographer">Photographers</Option>
                  <Option value="designer">Event Designers</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <Input prefix={<EnvironmentOutlined />} placeholder="e.g., Manila, Cebu" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                label="Number of Guests"
                name="guests"
                rules={[{ required: true, message: 'Please enter number of guests' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={10000}
                  placeholder="e.g., 100"
                  prefix={<TeamOutlined />}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                label="Budget (₱)"
                name="budget"
                rules={[{ required: true, message: 'Please enter your budget' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1000}
                  placeholder="e.g., 100000"
                  formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₱\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<ShoppingCartOutlined />} 
              loading={loading}
              size="large"
              block
            >
              Get Recommendations
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {errorMessage && (
        <Alert
          message="Error"
          description={errorMessage}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Finding the best services for your event...</p>
        </div>
      ) : (
        renderRecommendations()
      )}
    </div>
  );
};

export default RecommendationsPage;